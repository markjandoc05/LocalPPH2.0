import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { runInNewContext } from 'node:vm';
import { NextRequest, NextResponse } from 'next/server';
import * as drizzle from 'drizzle-orm';
import ts from 'typescript';
import * as schema from '../../db/schema';
import * as policy from '../auth/data-api-policy';
import * as roles from '../auth/roles';
import * as draftHelpers from './business-draft';
import * as senderHelpers from './business-inquiry-sender';
import * as publicPayload from './public-business-payload';
import * as reminders from '../listing-revision-reminders';
import * as categoryHelpers from './seed/categories';
import type { DataProvider } from './types';

const compile = (path: string) => ts.transpileModule(readFileSync(new URL(path, import.meta.url), 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;
const providerSource = compile('./database-provider.ts');
const routeSource = compile('../../app/api/data/route.ts');
const execute = <T>(source: string, dependencies: Record<string, unknown>): T => {
  const exports = {};
  runInNewContext(source, {
    exports, TextEncoder, console: { error: () => {}, warn: () => {} },
    require: (name: string) => {
      if (Object.hasOwn(dependencies, name)) return dependencies[name];
      throw new Error(`Unexpected draft test dependency: ${name}`);
    },
  });
  return exports as T;
};
const id = '11111111-1111-4111-8111-111111111111';
const payload = { id, name: 'Synthetic draft', slug: 'synthetic-draft', ownerId: 'forged-owner', description: 'Synthetic content', status: 'APPROVED', isFeatured: true };
type Row = { id: string; ownerId: string; status: string; [key: string]: unknown };

const fixture = (initial: Row[] = [], concurrent = false) => {
  const rows = new Map(initial.map((row) => [row.id, structuredClone(row)]));
  let attempts = 0;
  let mutations = 0;
  let reads = 0;
  let release: () => void = () => {};
  const barrier = new Promise<void>((resolve) => { release = resolve; });
  const db = new Proxy({
    query: {
      users: { findFirst: async () => ({ id: 'owner-a', role: 'BUSINESS', accountStatus: 'ACTIVE' }) },
      businesses: { findFirst: async () => {
        const snapshot = rows.get(id);
        if (concurrent && ++reads <= 2) { if (reads === 2) release(); await barrier; }
        return snapshot ? structuredClone(snapshot) : undefined;
      } },
    },
    insert: (table: unknown) => {
      assert.equal(table, schema.businesses);
      return { values: (input: Row) => {
        let conflictSafe = false;
        const query = {
          onConflictDoNothing: (options: { target: unknown }) => {
            assert.equal(options.target, schema.businesses.id); conflictSafe = true; return query;
          },
          returning: async () => {
            attempts++;
            if (rows.has(input.id)) {
              if (conflictSafe) return [];
              throw new Error('Synthetic duplicate primary key');
            }
            rows.set(input.id, structuredClone({ ...input, createdAt: '2026-01-01', updatedAt: '2026-01-01' }));
            mutations++;
            return [{ id: input.id }];
          },
        };
        return query;
      } };
    },
  }, { get: (target, key) => {
    if (key === 'query') return target.query;
    if (key === 'insert') return target.insert;
    throw new Error(`Existing business mutation attempted: ${String(key)}`);
  } });
  const { databaseProvider } = execute<{ databaseProvider: DataProvider }>(providerSource, {
    '../../db/index': { db }, '../../db/schema': schema, 'drizzle-orm': drizzle,
    './business-draft': draftHelpers, './business-inquiry-sender': senderHelpers,
    './public-business-payload': publicPayload, './public-data-cache': {}, './seed/categories': categoryHelpers,
    '@/lib/time': { formatAppDateTime: () => 'Synthetic' }, '@/lib/email/notifications': {}, '@/lib/listing-revision-reminders': reminders,
  });
  const request = async (ownerId = 'owner-a', data = payload) => {
    const provider = { ...databaseProvider, getUserById: async () => ({ data: { user: { id: ownerId, role: 'BUSINESS', accountStatus: 'ACTIVE' } } }) };
    const { POST } = execute<{ POST: (request: NextRequest) => Promise<Response> }>(routeSource, {
      'next/server': { NextRequest, NextResponse }, '@/lib/firebase-admin': { adminAuth: { verifyIdToken: async () => ({ uid: ownerId }) } },
      '@/lib/auth/data-api-policy': policy, '@/lib/auth/roles': roles,
      '@/lib/data-connect/database-provider': { databaseProvider: provider }, '@/lib/data-connect/business-draft': draftHelpers,
      '@/lib/server/rate-limit': { consumeRateLimit: () => ({ allowed: true }), getRequestClientIp: () => 'synthetic' },
      '@/lib/data-connect/public-cache-invalidation': {},
    });
    return POST(new NextRequest('http://localhost/api/data', {
      method: 'POST', headers: { Authorization: 'Bearer synthetic', 'Content-Type': 'application/json' },
      body: JSON.stringify({ method: 'createBusinessDraft', variables: data }),
    }));
  };
  return { rows, request, counters: () => ({ attempts, mutations }) };
};

test('first draft creation keeps the existing ID contract and uses the authenticated owner', async () => {
  const state = fixture();
  const response = await state.request();
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { data: { business_insert: id, business_created: true } });
  assert.equal(state.rows.get(id)?.ownerId, 'owner-a');
  assert.equal(state.rows.get(id)?.status, 'DRAFT');
  assert.equal(state.rows.get(id)?.isFeatured, undefined);
});

test('retry after a committed creation returns the same draft without overwriting changed input', async () => {
  const state = fixture();
  await state.request();
  const before = structuredClone(state.rows.get(id));
  const retry = await state.request('owner-a', { ...payload, name: 'Changed retry input', description: 'Changed retry content' });
  assert.equal(retry.status, 200);
  assert.deepEqual(await retry.json(), { data: { business_insert: id, business_created: false } });
  assert.deepEqual(state.rows.get(id), before);
  assert.deepEqual(state.counters(), { attempts: 1, mutations: 1 });
});

test('another owner cannot reuse an established ID or modify any of its content', async () => {
  const original = { ...payload, ownerId: 'owner-b', status: 'DRAFT', addressLine1: 'Synthetic existing address', updatedAt: '2025-01-01' };
  const state = fixture([original]);
  const response = await state.request('owner-a');
  assert.equal(response.status, 403);
  assert.deepEqual(state.rows.get(id), original);
  assert.deepEqual(state.counters(), { attempts: 0, mutations: 0 });
});

test('advanced listing statuses are preserved and cannot be reset through draft creation', async () => {
  for (const status of ['PENDING', 'APPROVED', 'REVISION_REQUESTED', 'REJECTED', 'INACTIVE', 'SUSPENDED']) {
    const original = { ...payload, ownerId: 'owner-a', status, gallery: 'existing synthetic gallery', updatedAt: '2025-01-01' };
    const state = fixture([original]);
    assert.equal((await state.request()).status, 409, status);
    assert.deepEqual(state.rows.get(id), original);
    assert.deepEqual(state.counters(), { attempts: 0, mutations: 0 });
  }
});

test('simultaneous same-owner ID collisions insert once and resume the winning content', async () => {
  const state = fixture([], true);
  const responses = await Promise.all([state.request(), state.request('owner-a', { ...payload, name: 'Other simultaneous input' })]);
  assert.equal(responses.every((response) => response.status === 200), true);
  const bodies = await Promise.all(responses.map((response) => response.json()));
  assert.deepEqual(bodies.map((body) => body.data.business_created).sort(), [false, true]);
  assert.equal(state.rows.size, 1);
  assert.equal(state.rows.get(id)?.name, payload.name);
  assert.deepEqual(state.counters(), { attempts: 2, mutations: 1 });
});

test('simultaneous different-owner ID collisions reject the losing owner without replacing data', async () => {
  const state = fixture([], true);
  const responses = await Promise.all([state.request('owner-a'), state.request('owner-b', { ...payload, name: 'Other owner input' })]);
  assert.deepEqual(responses.map((response) => response.status).sort(), [200, 403]);
  assert.equal(state.rows.size, 1);
  assert.equal(state.rows.get(id)?.ownerId, 'owner-a');
  assert.equal(state.rows.get(id)?.name, payload.name);
  assert.deepEqual(state.counters(), { attempts: 2, mutations: 1 });
});
