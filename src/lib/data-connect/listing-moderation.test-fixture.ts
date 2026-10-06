// Synthetic-only harness: actual provider and API code, with every service import intercepted.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { NextRequest, NextResponse } from 'next/server';
import ts from 'typescript';
import * as drizzle from 'drizzle-orm';
import * as schema from '../../db/schema';
import * as roles from '../auth/roles';
import * as apiPolicy from '../auth/data-api-policy';
import * as listingPolicy from '../listing-policy';
import * as drafts from './business-draft';
import * as inquiries from './business-inquiry-sender';
import * as payload from './public-business-payload';
import * as reminders from '../listing-revision-reminders';
import * as categories from './seed/categories';
import type { DataProvider } from './types';
import type { BusinessStatus } from '../../types/business';

export const listingId = '11111111-1111-4111-8111-111111111111';
export const decisionId = '22222222-2222-4222-8222-222222222222';
const compile = (path: string) => ts.transpileModule(readFileSync(new URL(path, import.meta.url), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
const providerSource = compile('./database-provider.ts');
const routeSource = compile('../../app/api/data/route.ts');
const load = <T>(source: string, dependencies: Record<string, unknown>): T => {
  const exports = {};
  runInNewContext(source, { exports, TextEncoder, console: { error: () => {}, warn: () => {}, info: () => {} }, require: (name: string) => {
    if (Object.hasOwn(dependencies, name)) return dependencies[name];
    throw new Error(`Unmocked service import: ${name}`);
  } });
  return exports as T;
};

export const createModerationFixture = (status: BusinessStatus = 'PENDING', options: { emailFails?: boolean; ownerMissingEmail?: boolean; missingDocuments?: boolean } = {}) => {
  let row = { id: listingId, ownerId: 'owner-a', status, name: 'Synthetic ordinary restaurant', slug: 'synthetic-restaurant', description: 'Ordinary food services', moderatorNotes: 'Existing owner-facing note', gallery: '[]', documents: options.missingDocuments ? '[]' : '[{"id":"synthetic-document","name":"Synthetic registration","url":"https://example.invalid/document"}]', logoUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jBMkAAAAASUVORK5CYII=', categoryId: 'category-1', regionId: 'region-1', provinceId: 'province-1', cityId: 'city-1', addressLine1: 'Synthetic address', contactMobile: '09171234567', updatedAt: new Date('2026-01-01T00:00:00.000Z'), createdAt: new Date('2025-01-01T00:00:00.000Z') };
  const tickets = new Map<string, Record<string, unknown>>();
  const effects = { updates: 0, emails: 0, ticketInserts: 0, locks: 0, cache: 0, mediaDeletes: 0, emailFails: !!options.emailFails };
  const profile = (id: string) => ({ id, role: id.startsWith('reviewer') ? 'ADMIN' : id === 'subscriber-a' ? 'SUBSCRIBER' : 'BUSINESS', accountStatus: id === 'banned-a' ? 'BANNED' : 'ACTIVE', email: options.ownerMissingEmail && id === 'owner-a' ? '' : `${id}@example.invalid`, displayName: 'Synthetic user' });
  let queue: Promise<unknown> = Promise.resolve();
  const query = { businesses: { findFirst: async () => structuredClone(row) }, users: { findFirst: async () => profile('owner-a'), findMany: async () => [profile('reviewer-a')] }, supportTickets: { findFirst: async (args: { where: drizzle.SQL }) => {
    const dialect = new (await import('drizzle-orm/pg-core')).PgDialect();
    return tickets.get(String(dialect.sqlToQuery(args.where).params[0]));
  } } };
  const tx = {
    query,
    select: () => ({ from: (table: unknown) => {
      assert.equal(table, schema.businesses);
      return { where: () => ({ for: async (mode: string) => { assert.equal(mode, 'update'); effects.locks++; return [structuredClone(row)]; } }) };
    } }),
    update: (table: unknown) => {
      assert.equal(table, schema.businesses);
      return { set: (values: Partial<typeof row>) => ({ where: () => {
        const write = async () => { row = structuredClone({ ...row, ...values }); effects.updates++; return [{ id: row.id }]; };
        return { returning: write, then: (resolve: (value: unknown) => unknown) => write().then(resolve) };
      } }) };
    },
    insert: (table: unknown) => {
      assert.equal(table, schema.supportTickets);
      return { values: (input: Record<string, unknown>) => ({ onConflictDoNothing: () => ({ returning: async () => {
        if (tickets.has(String(input.id))) return [];
        tickets.set(String(input.id), structuredClone(input)); effects.ticketInserts++; return [{ id: input.id }];
      } }) }) };
    },
  };
  const db = { query, transaction: async (callback: (transaction: typeof tx) => Promise<unknown>) => {
    const previous = queue; let release!: () => void; queue = new Promise<void>((resolve) => { release = resolve; });
    await previous;
    const before = structuredClone(row);
    try { return await callback(tx); } catch (error) { row = before; throw error; } finally { release(); }
  } };
  const notify = async () => {
    effects.emails++;
    assert.ok(effects.updates > 0, 'email must occur after a committed decision');
    if (effects.emailFails) throw new Error('Synthetic SMTP failure');
    return { sent: true };
  };
  const { databaseProvider } = load<{ databaseProvider: DataProvider }>(providerSource, {
    '../../db/index': { db }, '../../db/schema': schema, 'drizzle-orm': drizzle,
    './business-inquiry-sender': inquiries, './business-draft': drafts, '@/lib/listing-policy': listingPolicy,
    './public-business-payload': payload, './public-data-cache': {}, './seed/categories': categories,
    '@/lib/time': { formatAppDateTime: () => 'Synthetic time' }, '@/lib/listing-revision-reminders': reminders,
    '@/lib/email/notifications': { notifyUserOfApprovedListing: notify, notifyUserOfListingRevision: notify, notifyUserOfListingModeration: notify, notifyAdminsOfSubmittedListing: notify },
  });
  const provider = { ...databaseProvider, getUserById: async ({ id }: { id: string }) => ({ data: { user: profile(id) } }) };
  const { POST } = load<{ POST: (request: NextRequest) => Promise<Response> }>(routeSource, {
    'next/server': { NextRequest, NextResponse }, '@/lib/firebase-admin': { adminAuth: { verifyIdToken: async (token: string) => ({ uid: token }) } },
    '@/lib/auth/data-api-policy': apiPolicy, '@/lib/auth/roles': roles, '@/lib/data-connect/database-provider': { databaseProvider: provider },
    '@/lib/data-connect/business-draft': drafts, '@/lib/listing-policy': listingPolicy,
    '@/lib/server/rate-limit': { consumeRateLimit: () => ({ allowed: true }), getRequestClientIp: () => 'synthetic' },
    '@/lib/data-connect/public-cache-invalidation': { expirePublicBusinessCache: () => { effects.cache++; }, invalidatePublicBusinessCache: () => { effects.cache++; }, invalidatePublicDirectoryCache: () => {} },
  });
  const mediaRequest = async (endpoint: 'upload-permission' | 'delete-media') => {
    const { POST: mediaPost } = load<{ POST: (request: NextRequest) => Promise<Response> }>(compile(`../../app/api/business/${endpoint}/route.ts`), {
      'next/server': { NextRequest, NextResponse }, 'drizzle-orm': drizzle, '@/db': { db }, '@/db/schema': schema,
      '@/lib/auth/roles': roles, '@/lib/listing-policy': listingPolicy,
      '@/lib/auth/server-authorization': { requireActiveUser: async () => ({ user: profile('owner-a') }) },
      '@/lib/firebase/admin': { adminStorage: { bucket: () => ({ file: () => ({ delete: async () => { effects.mediaDeletes++; } }) }) } },
    });
    return mediaPost(new NextRequest(`http://localhost/api/business/${endpoint}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ businessId: listingId, category: 'logo', filePath: `businesses/owner-a/${listingId}/logo/synthetic.png` }) }));
  };
  return { provider: databaseProvider, effects, tickets, row: () => structuredClone(row), mediaRequest, request: (method: string, variables: Record<string, unknown>, uid = 'reviewer-a') => POST(new NextRequest('http://localhost/api/data', { method: 'POST', headers: { Authorization: `Bearer ${uid}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ method, variables }) })) };
};
