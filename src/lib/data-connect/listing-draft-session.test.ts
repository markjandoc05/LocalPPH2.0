import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { runInNewContext } from 'node:vm';
import ts from 'typescript';
import { completeListingRequest, getPendingListingRequest, rememberListingRequest } from './listing-draft-session';

const firstId = '11111111-1111-4111-8111-111111111111';
const secondId = '22222222-2222-4222-8222-222222222222';

test('recovery markers stay owner-scoped and completion cannot replace a different pending request', () => {
  const values = new Map<string, string>();
  const storage = { getItem: (key: string) => values.get(key) || null, setItem: (key: string, value: string) => { values.set(key, value); } };
  rememberListingRequest('owner-a', firstId, storage);
  rememberListingRequest('owner-b', secondId, storage);
  completeListingRequest('owner-a', secondId, storage);
  assert.equal(getPendingListingRequest('owner-a', storage), firstId);
  assert.equal(getPendingListingRequest('owner-b', storage), secondId);
  completeListingRequest('owner-a', firstId, storage);
  assert.equal(getPendingListingRequest('owner-a', storage), null);
  assert.equal(getPendingListingRequest('owner-b', storage), secondId);
  assert.equal(values.size, 2);
});

test('unavailable or malformed browser storage does not crash recovery', () => {
  const unavailable = { getItem: () => { throw new Error('Synthetic blocked storage'); }, setItem: () => { throw new Error('Synthetic blocked storage'); } };
  assert.equal(getPendingListingRequest('owner-a', unavailable), null);
  assert.doesNotThrow(() => rememberListingRequest('owner-a', firstId, unavailable));
  assert.doesNotThrow(() => completeListingRequest('owner-a', firstId, unavailable));
  for (const value of ['invalid-json', JSON.stringify({ id: 'not-a-uuid', state: 'pending' }), JSON.stringify({ id: firstId, state: 'complete' })]) {
    assert.equal(getPendingListingRequest('owner-a', { getItem: () => value, setItem: () => {} }), null);
  }
});

test('business service preserves the legacy string contract and distinguishes a recovered draft', async () => {
  let response: { data: { business_insert: string; business_created?: boolean } } = { data: { business_insert: firstId } };
  const source = ts.transpileModule(readFileSync(new URL('./business-service.ts', import.meta.url), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const exports: Record<string, (...args: unknown[]) => Promise<unknown>> = {};
  runInNewContext(source, { exports, require: (name: string) => {
    assert.equal(name, './provider');
    return { provider: { createBusinessDraft: async () => response } };
  } });
  assert.equal(await exports.createBusinessDraft({ id: firstId }), firstId);
  const legacy = await exports.createBusinessDraftWithResult({ id: firstId }) as { id: string; created: boolean };
  assert.equal(legacy.id, firstId);
  assert.equal(legacy.created, true);
  response = { data: { business_insert: firstId, business_created: false } };
  const replay = await exports.createBusinessDraftWithResult({ id: firstId }) as { id: string; created: boolean };
  assert.equal(replay.id, firstId);
  assert.equal(replay.created, false);
});
