import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { runInNewContext } from 'node:vm';
import { NextRequest, NextResponse } from 'next/server';
import * as drizzle from 'drizzle-orm';
import { PgDialect } from 'drizzle-orm/pg-core';
import ts from 'typescript';
import * as schema from '../../db/schema';
import * as policy from '../auth/data-api-policy';
import * as roles from '../auth/roles';
import * as senderHelpers from './business-inquiry-sender';
const inquiryHelpers = { BUSINESS_INQUIRY_PREFIX: 'LOCALPAGES_BUSINESS_INQUIRY::' };
import * as draftHelpers from './business-draft';
import * as listingPolicy from '../listing-policy';
import * as publicPayload from './public-business-payload';
import * as reminders from '../listing-revision-reminders';
import * as categoryHelpers from './seed/categories';
import type { DataProvider } from './types';

const compileModule = (url: URL) => ts.transpileModule(readFileSync(url, 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;
const providerSource = compileModule(new URL('./database-provider.ts', import.meta.url));
const routeSource = compileModule(new URL('../../app/api/data/route.ts', import.meta.url));

const executeModule = <T>(source: string, dependencies: Record<string, unknown>): T => {
  const exports = {};
  runInNewContext(source, {
    exports,
    require: (specifier: string) => {
      if (Object.hasOwn(dependencies, specifier)) return dependencies[specifier];
      throw new Error(`Unexpected dependency in isolated inquiry test: ${specifier}`);
    },
    console: { error: () => {}, warn: () => {} },
    TextEncoder,
  });
  return exports as T;
};

const privateMarker = 'SYNTHETIC_PRIVATE_PROFILE_VALUE';
const sender = {
  id: 'sender-a', displayName: 'Synthetic Sender', email: 'sender@example.invalid',
  addressLine1: privateMarker, addressLine2: privateMarker, dateOfBirth: '1970-01-01',
  mobileNumber: privateMarker, gender: privateMarker, role: 'SUBSCRIBER',
  accountStatus: 'ACTIVE', unexpectedPrivateField: { apiKey: privateMarker },
};
const inquiryDetails = {
  businessId: 'business-a', ownerId: 'owner-a', businessName: 'Synthetic Business',
  businessSlug: 'synthetic-business', subject: 'Synthetic inquiry', message: 'Synthetic message',
  senderName: 'Inquiry contact name', senderEmail: 'contact@example.invalid',
  senderContactNumber: 'synthetic-inquiry-phone',
};
const makeTicket = (overrides: Record<string, unknown> = {}) => ({
  id: 'inquiry-a', userId: 'sender-a', category: 'BUSINESS_INQUIRY',
  businessId: 'business-a', businessOwnerId: 'owner-a',
  subject: 'Synthetic inquiry', message: inquiryHelpers.BUSINESS_INQUIRY_PREFIX + JSON.stringify({ ...inquiryDetails, ownerId: overrides.businessOwnerId || inquiryDetails.ownerId }),
  createdAt: new Date('2026-01-02T00:00:00Z'), updatedAt: new Date('2026-01-02T00:00:00Z'),
  adminResponse: null, respondedAt: null, user: sender,
  ...overrides,
});

type QueryOptions = { with?: { user?: unknown }; where: drizzle.SQL };
const loadInquiryRoute = (options: {
  uid?: string; role?: string; accountStatus?: string; legacy?: boolean;
  tickets?: Array<Record<string, unknown>>;
} = {}) => {
  const uid = options.uid || 'owner-a';
  const calls: QueryOptions[] = [];
  // Deliberately return full profiles even for a projected query to also test response defense.
  const db = new Proxy({ query: {
    users: { findFirst: async () => ({ id: uid, role: options.role || 'BUSINESS', accountStatus: options.accountStatus || 'ACTIVE' }) },
    supportTickets: { findMany: async (query: QueryOptions) => {
      calls.push(query);
      return options.tickets || [makeTicket()];
    } },
  } }, { get: (target, key) => {
    if (key === 'query') return target.query;
    throw new Error(`Database mutation or unexpected operation attempted: ${String(key)}`);
  } });

  const { databaseProvider } = executeModule<{ databaseProvider: DataProvider }>(providerSource, {
    '../../db/index': { db }, '../../db/schema': schema, 'drizzle-orm': drizzle,
    './business-inquiry-sender': senderHelpers, './public-business-payload': publicPayload,
    './business-draft': draftHelpers, '@/lib/listing-policy': listingPolicy,
    './public-data-cache': {}, './seed/categories': categoryHelpers,
    '@/lib/time': { formatAppDateTime: () => 'Synthetic time' },
    '@/lib/email/notifications': {}, '@/lib/listing-revision-reminders': reminders,
  });
  const { POST } = executeModule<{ POST: (req: NextRequest) => Promise<Response> }>(routeSource, {
    'next/server': { NextRequest, NextResponse }, '@/lib/firebase-admin': { adminAuth: { verifyIdToken: async () => ({ uid }) } },
    '@/lib/auth/data-api-policy': policy, '@/lib/auth/roles': roles,
    '@/lib/data-connect/database-provider': { databaseProvider },
    '@/lib/data-connect/business-draft': draftHelpers, '@/lib/listing-policy': listingPolicy,
    '@/lib/server/rate-limit': { consumeRateLimit: () => ({ allowed: true }), getRequestClientIp: () => 'synthetic' },
    '@/lib/data-connect/public-cache-invalidation': {},
  });
  const request = (variables = {}, method = 'getMyBusinessInquiries', authenticated = true) => POST(new NextRequest('http://localhost/api/data', {
    method: 'POST', headers: authenticated ? { Authorization: 'Bearer synthetic-token', 'Content-Type': 'application/json' } : {},
    body: JSON.stringify({ method, variables }),
  }));
  return { request, calls };
};

const assertPrivateProfileExcluded = (body: unknown) => {
  const json = JSON.stringify(body);
  for (const value of [privateMarker, 'addressLine1', 'addressLine2', 'dateOfBirth', '1970-01-01', 'mobileNumber', 'unexpectedPrivateField']) {
    assert.equal(json.includes(value), false, value);
  }
};
const assertSenderProjection = (query: QueryOptions) => {
  assert.deepEqual(JSON.parse(JSON.stringify(query.with?.user)), { columns: { displayName: true, email: true } });
};

test('owner inquiry response preserves contact fields and excludes the unrelated sender profile', async () => {
  const { request, calls } = loadInquiryRoute();
  const response = await request();
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('Cache-Control'), 'no-store');
  const body = await response.json();
  assertPrivateProfileExcluded(body);
  assert.deepEqual(Object.keys(body), ['data']);
  assert.deepEqual(Object.keys(body.data), ['inquiries']);
  assert.equal(body.data.inquiries.length, 1);
  const inquiry = body.data.inquiries[0];
  assert.deepEqual(inquiry.sender, { displayName: sender.displayName, email: sender.email });
  assert.equal(inquiry.senderName, inquiryDetails.senderName);
  assert.equal(inquiry.senderEmail, inquiryDetails.senderEmail);
  assert.equal(inquiry.senderContactNumber, inquiryDetails.senderContactNumber);
  assert.equal(inquiry.message, inquiryDetails.message);
  assert.equal(inquiry.unreadForOwner, true);
  assert.equal(inquiry.messages[0].body, inquiryDetails.message);
  assert.deepEqual(Object.keys(inquiry).sort(), [
    'id', 'createdAt', 'updatedAt', 'businessId', 'businessName', 'businessSlug', 'ownerId',
    'subject', 'senderName', 'senderEmail', 'senderContactNumber', 'message', 'response',
    'respondedAt', 'messages', 'deletedForSender', 'deletedForOwner', 'unreadForSender', 'unreadForOwner', 'sender',
  ].sort());
  assertSenderProjection(calls[0]);
});

test('JSON-stored inquiry ownership uses the same sender privacy projection', async () => {
  const ticket = makeTicket({ businessId: undefined, businessOwnerId: undefined });
  const { request, calls } = loadInquiryRoute({ legacy: true, tickets: [ticket] });
  const response = await request();
  assert.equal(response.status, 200);
  const body = await response.json();
  assertPrivateProfileExcluded(body);
  assert.equal(body.data.inquiries[0].ownerId, 'owner-a');
  assert.deepEqual(body.data.inquiries[0].sender, { displayName: sender.displayName, email: sender.email });
  assert.equal(calls.length, 1);
  calls.forEach(assertSenderProjection);
});

test('owner scope comes from the verified token even when another owner is supplied', async () => {
  const normalizedTickets = [makeTicket(), makeTicket({ id: 'inquiry-b', businessOwnerId: 'owner-b' })];
  for (const legacy of [false, true]) {
    const tickets = legacy ? normalizedTickets.map((ticket) => ({
      ...ticket, businessId: undefined, businessOwnerId: undefined,
      message: inquiryHelpers.BUSINESS_INQUIRY_PREFIX + JSON.stringify({ ...inquiryDetails, ownerId: ticket.businessOwnerId }),
    })) : normalizedTickets;
    const { request } = loadInquiryRoute({ uid: 'owner-b', legacy, tickets });
    const response = await request({ ownerId: 'owner-a' });
    assert.equal(response.status, 200);
    assert.deepEqual((await response.json()).data.inquiries.map((inquiry: { id: string }) => inquiry.id), ['inquiry-b']);
  }
});

test('administrators retain access to their own inquiry scope without expanding it', async () => {
  const { request } = loadInquiryRoute({ uid: 'admin-a', role: 'ADMIN', tickets: [makeTicket(), makeTicket({ id: 'inquiry-admin', businessOwnerId: 'admin-a' })] });
  const response = await request({ ownerId: 'owner-a' });
  assert.equal(response.status, 200);
  const body = await response.json();
  assert.deepEqual(body.data.inquiries.map((inquiry: { id: string }) => inquiry.id), ['inquiry-admin']);
  assertPrivateProfileExcluded(body);
});

test('anonymous, non-business and inactive accounts cannot retrieve owner inquiries', async () => {
  const anonymous = loadInquiryRoute();
  assert.equal((await anonymous.request({}, 'getMyBusinessInquiries', false)).status, 401);
  assert.equal(anonymous.calls.length, 0);
  for (const role of ['SUBSCRIBER', 'MODERATOR', 'UNKNOWN_ROLE']) {
    const { request, calls } = loadInquiryRoute({ role });
    assert.equal((await request()).status, 403, role);
    assert.equal(calls.length, 0);
  }
  for (const accountStatus of ['BANNED', 'SUSPENDED', 'INACTIVE']) {
    const { request, calls } = loadInquiryRoute({ accountStatus });
    assert.equal((await request()).status, 403, accountStatus);
    assert.equal(calls.length, 0);
  }
});

test('sender contact fallbacks still work with the narrowed profile', async () => {
  const details = { ...inquiryDetails, senderName: '', senderEmail: '' };
  const { request } = loadInquiryRoute({ tickets: [makeTicket({ message: inquiryHelpers.BUSINESS_INQUIRY_PREFIX + JSON.stringify(details) })] });
  const body = await (await request()).json();
  assert.equal(body.data.inquiries[0].senderName, sender.displayName);
  assert.equal(body.data.inquiries[0].senderEmail, sender.email);
  assertPrivateProfileExcluded(body);
});

test('missing sender profiles preserve null and inquiry-provided contact fields', async () => {
  const { request } = loadInquiryRoute({ tickets: [makeTicket({ user: null })] });
  const body = await (await request()).json();
  assert.equal(body.data.inquiries[0].sender, null);
  assert.equal(body.data.inquiries[0].senderEmail, inquiryDetails.senderEmail);
  assert.equal(body.data.inquiries[0].senderContactNumber, inquiryDetails.senderContactNumber);
});

test('subscriber sent-inquiry envelope and authenticated user scope remain compatible', async () => {
  const { request, calls } = loadInquiryRoute({ uid: 'sender-a', role: 'SUBSCRIBER', tickets: [makeTicket({ user: null })] });
  const response = await request({ userId: 'sender-b' }, 'getMySentBusinessInquiries');
  assert.equal(response.status, 200);
  const body = await response.json();
  assert.equal(body.data.inquiries[0].sender, null);
  assert.equal(body.data.inquiries[0].senderEmail, inquiryDetails.senderEmail);
  const query = new PgDialect().sqlToQuery(calls[0].where);
  assert.equal(query.params.includes('sender-a'), true);
  assert.equal(query.params.includes('sender-b'), false);
});
