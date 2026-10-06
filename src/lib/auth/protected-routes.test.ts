import * as listingPolicy from '../listing-policy';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { runInNewContext } from 'node:vm';
import * as crypto from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import * as drizzle from 'drizzle-orm';
import { PgDialect } from 'drizzle-orm/pg-core';
import ts from 'typescript';
import * as schema from '../../db/schema';
import * as roles from './roles';

const privateMarker = 'SYNTHETIC_DEPENDENCY_SECRET';
const businessId = '11111111-1111-4111-8111-111111111111';
type Endpoint = { path: string; method: 'GET' | 'POST'; admin: boolean; success?: number; body?: unknown; image?: boolean };
const endpoints: Endpoint[] = [
  { path: 'business/delete-listing', method: 'POST', admin: false, body: { businessId } },
  { path: 'admin/settings', method: 'GET', admin: true },
  { path: 'admin/settings', method: 'POST', admin: true, body: { smtp: { password: '********' } } },
  { path: 'admin/email-test', method: 'POST', admin: true },
  { path: 'admin/email-marketing', method: 'GET', admin: true },
  { path: 'admin/email-marketing', method: 'POST', admin: true, body: { action: 'sendRecipient' }, success: 400 },
  { path: 'admin/email-marketing/upload-image', method: 'POST', admin: true, image: true },
  { path: 'admin/directory/[table]', method: 'POST', admin: true, body: { action: 'options' } },
  { path: 'admin/import', method: 'POST', admin: true, body: { type: 'categories', data: [] } },
  { path: 'admin/seed', method: 'POST', admin: true },
  { path: 'business/upload-permission', method: 'POST', admin: false, body: { businessId, category: 'logo' } },
  { path: 'business/delete-media', method: 'POST', admin: false, body: { filePath: `businesses/user-a/${businessId}/logo/synthetic.png` } },
];
const sources = new Map<string, string>();
const compiledSource = (relativePath: string) => {
  if (!sources.has(relativePath)) sources.set(relativePath, ts.transpileModule(
    readFileSync(new URL(relativePath, import.meta.url), 'utf8'),
    { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } },
  ).outputText);
  return sources.get(relativePath)!;
};

type Scenario = {
  role?: string; accountStatus?: string; deleted?: boolean; anonymous?: boolean;
  tokenError?: string; profileError?: boolean; nonOwner?: boolean; noDeletedRow?: boolean;
  settingsFailure?: boolean; saveFailure?: boolean; header?: string;
  businessStatus?: string;
};

// Load actual handlers and the shared guard with all service boundaries replaced.
// Database writes, storage calls, mail, and seed operations only update these in-memory spies.
const loadEndpoint = (endpoint: Endpoint, scenario: Scenario = {}) => {
  const user = { id: 'user-a', role: scenario.role || (endpoint.admin ? 'ADMIN' : 'BUSINESS'), accountStatus: scenario.accountStatus || 'ACTIVE', email: 'synthetic@example.invalid', displayName: 'Synthetic User' };
  const effects = { writes: 0, mail: 0, storage: 0, seed: 0, cache: 0, savedSettings: undefined as unknown, deleteWhere: undefined as drizzle.SQL | undefined };
  const profile = () => {
    if (scenario.profileError) throw new Error(privateMarker);
    return scenario.deleted ? null : user;
  };
  const select = () => {
    let table: unknown;
    const chain: Record<string, unknown> = {
      from: (value: unknown) => { table = value; return chain; },
      where: () => chain, for: (mode: string) => { assert.equal(mode, 'update'); return chain; }, orderBy: () => chain, limit: () => chain, leftJoin: () => chain,
      then: (resolve: (value: unknown[]) => unknown, reject: (reason: unknown) => unknown) => {
        try { return Promise.resolve(table === schema.users ? (profile() ? [user] : []) : table === schema.businesses ? [{ id: businessId, ownerId: scenario.nonOwner ? 'other-user' : user.id, status: 'DRAFT' }] : []).then(resolve, reject); }
        catch (error) { return Promise.reject(error).then(resolve, reject); }
      },
    };
    return chain;
  };
  const db = {
    query: {
      users: { findFirst: async () => profile() },
      businesses: { findFirst: async ({ where }: { where: drizzle.SQL }) => {
        const params = new PgDialect().sqlToQuery(where).params;
        if (scenario.nonOwner && params.includes(user.id)) return null;
        return { id: businessId, ownerId: scenario.nonOwner ? 'other-user' : user.id, status: scenario.businessStatus || 'DRAFT' };
      } },
    },
    select,
    transaction: async (callback: (tx: { select: typeof select }) => Promise<unknown>) => callback({ select }),
    delete: () => ({ where: (where: drizzle.SQL) => {
      effects.writes++; effects.deleteWhere = where;
      return { returning: async () => scenario.noDeletedRow ? [] : [{ id: businessId }] };
    } }),
  };
  const adminAuth = { verifyIdToken: async () => {
    if (scenario.tokenError) throw Object.assign(new Error(privateMarker), { code: scenario.tokenError });
    return { uid: user.id, role: 'ADMIN' }; // Token role must never override the SQL role.
  } };
  const adminStorage = { bucket: () => ({ name: 'phase1c-synthetic.invalid', file: () => ({
    delete: async () => { effects.storage++; }, save: async () => { effects.storage++; },
  }) }) };
  const settings = { smtp: { enabled: true, password: privateMarker, host: 'smtp.invalid' }, emailTemplates: {} };
  let requestHeaders = new Headers();
  const modules = new Map<string, Record<string, unknown>>();
  const dependencies: Record<string, unknown> = {
    'next/server': { NextRequest, NextResponse }, 'drizzle-orm': drizzle, 'crypto': crypto,
    '@/db': { db }, '@/db/schema': schema, '@/lib/firebase-admin': { adminAuth },
    '@/lib/firebase/admin': { adminAuth, adminStorage }, './roles': roles, '@/lib/auth/roles': roles,
    'next/headers': { headers: async () => requestHeaders },
    '@/lib/data-connect/database-provider': { databaseProvider: {
      getUserById: async () => ({ data: { user: profile() } }), getAllUsers: async () => ({ data: { users: [] } }),
    } },
    '@/lib/settings/settings-service': {
      getSettings: async () => { if (scenario.settingsFailure) throw new Error(privateMarker); return settings; },
      saveSettings: async (value: unknown) => { if (scenario.saveFailure) throw new Error(privateMarker); effects.writes++; effects.savedSettings = value; },
    },
    '@/lib/email/notifications': {
      sendEmailNotification: async () => { effects.mail++; return { sent: true }; }, getSmtpDiagnostics: async () => ({}),
    },
    '@/lib/data-connect/seed/seeder': { seedMetadata: async () => { effects.seed++; return { success: true }; } },
    '@/lib/listing-policy': listingPolicy,
    '@/lib/data-connect/public-cache-invalidation': {
      invalidatePublicBusinessCache: () => { effects.cache++; }, invalidatePublicDirectoryCache: () => { effects.cache++; },
    },
    '@/lib/seo/metadata': { SITE_URL: 'https://synthetic.invalid' },
  };
  const loadModule = (relativePath: string): Record<string, unknown> => {
    if (modules.has(relativePath)) return modules.get(relativePath)!;
    const exports: Record<string, unknown> = {};
    modules.set(relativePath, exports);
    runInNewContext(compiledSource(relativePath), {
      exports, Buffer, File, FormData, setTimeout, clearTimeout,
      console: { error: () => {}, warn: () => {}, log: () => {} },
      require: (specifier: string) => {
        if (Object.hasOwn(dependencies, specifier)) return dependencies[specifier];
        if (specifier === '@/lib/auth/server-authorization' || specifier === './server-authorization') return loadModule('./server-authorization.ts');
        if (specifier === '@/lib/auth/admin') return loadModule('./admin.ts');
        throw new Error(`Unexpected protected-route dependency: ${specifier}`);
      },
    });
    return exports;
  };
  const handler = loadModule(`../../app/api/${endpoint.path}/route.ts`)[endpoint.method] as (request: NextRequest, context: unknown) => Promise<Response>;
  const request = async () => {
    requestHeaders = scenario.anonymous ? new Headers() : new Headers({ Authorization: scenario.header ?? 'Bearer synthetic-token' });
    let body: BodyInit | undefined;
    if (endpoint.method === 'POST') {
      if (endpoint.image) {
        const form = new FormData(); form.set('image', new File(['synthetic-image'], 'synthetic.png', { type: 'image/png' })); body = form;
      } else { requestHeaders.set('Content-Type', 'application/json'); body = JSON.stringify(endpoint.body || {}); }
    }
    return handler(new NextRequest(`http://localhost/api/${endpoint.path}`, { method: endpoint.method, headers: requestHeaders, body }), { params: Promise.resolve({ table: 'categories' }) });
  };
  const legacyAdmin = async () => {
    requestHeaders = new Headers({ Authorization: 'Bearer synthetic-token' });
    return (loadModule('./admin.ts').getAdminUser as () => Promise<{ id: string } | null>)();
  };
  return { request, effects, legacyAdmin };
};

const assertNoMutation = (effects: ReturnType<typeof loadEndpoint>['effects']) => {
  assert.equal(effects.writes + effects.mail + effects.storage + effects.seed + effects.cache, 0);
};

for (const endpoint of endpoints) {
  test(`${endpoint.method} ${endpoint.path} enforces token, active profile and SQL role before side effects`, async () => {
    const cases: Array<[Scenario, number]> = [
      [{ accountStatus: 'BANNED' }, 403], [{ accountStatus: 'DELETED' }, 403],
      [{ accountStatus: 'SUSPENDED' }, 403], [{ deleted: true }, 403],
      [{ anonymous: true }, 401], [{ header: 'Bearer   ' }, 401],
      [{ role: 'SUBSCRIBER' }, 403], [{ role: 'MODERATOR' }, 403], [{ role: 'UNKNOWN_ROLE' }, 403],
      [{ tokenError: 'auth/id-token-expired' }, 401],
      [{ tokenError: 'auth/internal-error' }, 503], [{ profileError: true }, 503],
    ];
    for (const [scenario, status] of cases) {
      const { request, effects } = loadEndpoint(endpoint, scenario);
      const response = await request();
      assert.equal(response.status, status, JSON.stringify(scenario));
      assert.equal(JSON.stringify(await response.json()).includes(privateMarker), false);
      assertNoMutation(effects);
    }
    const { request } = loadEndpoint(endpoint);
    assert.equal((await request()).status, endpoint.success || 200, 'active permitted account');
  });
}

test('business media and deletion retain owner-only behavior for business and admin accounts', async () => {
  for (const endpoint of endpoints.filter((entry) => !entry.admin)) {
    for (const role of ['BUSINESS', 'ADMIN']) {
      const allowed = loadEndpoint(endpoint, { role });
      assert.equal((await allowed.request()).status, 200);
      const forbidden = loadEndpoint(endpoint, { role, nonOwner: true });
      assert.equal((await forbidden.request()).status, 403);
      assertNoMutation(forbidden.effects);
    }
  }
});

test('listing deletion repeats the owner condition in the DELETE and handles ownership changes', async () => {
  const endpoint = endpoints[0];
  const allowed = loadEndpoint(endpoint);
  assert.equal((await allowed.request()).status, 200);
  const params = new PgDialect().sqlToQuery(allowed.effects.deleteWhere!).params;
  assert.equal(params.includes('user-a'), true);
  assert.equal(params.includes(businessId), true);
  assert.equal(params.includes('REJECTED'), true);
  assert.equal(params.includes('SUSPENDED'), true);
  const changed = loadEndpoint(endpoint, { noDeletedRow: true });
  assert.equal((await changed.request()).status, 403);
  assert.equal(changed.effects.cache, 0);
});

test('policy decisions cannot be erased through owner listing deletion', async () => {
  for (const businessStatus of ['REJECTED', 'SUSPENDED']) {
    const fixture = loadEndpoint(endpoints[0], { businessStatus });
    assert.equal((await fixture.request()).status, 409);
    assertNoMutation(fixture.effects);
  }
});

test('administrator settings preserve masked SMTP passwords and keep failures generic', async () => {
  for (const endpoint of endpoints.filter((entry) => entry.path === 'admin/settings')) {
    const allowed = loadEndpoint(endpoint);
    const response = await allowed.request();
    assert.equal(response.status, 200);
    const body = await response.json();
    const settings = endpoint.method === 'GET' ? body : body.settings;
    assert.equal(settings.smtp.password, '********');
    assert.equal(settings.smtp.hasPassword, true);
    assert.equal(JSON.stringify(body).includes(privateMarker), false);
    assert.equal(response.headers.get('Cache-Control'), 'no-store');
    if (endpoint.method === 'POST') {
      assert.equal((allowed.effects.savedSettings as { smtp: { password: string } }).smtp.password, privateMarker);
    }
    const failed = loadEndpoint(endpoint, endpoint.method === 'GET' ? { settingsFailure: true } : { saveFailure: true });
    const failedResponse = await failed.request();
    assert.equal(failedResponse.status, 500);
    assert.equal(JSON.stringify(await failedResponse.json()).includes(privateMarker), false);
    assertNoMutation(failed.effects);
  }
});

test('legacy admin helper also requires an active SQL administrator', async () => {
  const endpoint = endpoints[1];
  assert.equal((await loadEndpoint(endpoint).legacyAdmin())?.id, 'user-a');
  for (const scenario of [{ accountStatus: 'BANNED' }, { deleted: true }, { role: 'BUSINESS' }, { profileError: true }]) {
    assert.equal(await loadEndpoint(endpoint, scenario).legacyAdmin(), null);
  }
});
