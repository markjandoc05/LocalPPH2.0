import assert from 'node:assert/strict';
import test from 'node:test';
import { createModerationFixture, decisionId, listingId } from './listing-moderation.test-fixture';
import { LISTING_POLICY_VERSION, MISSING_REGISTRATION_DOCUMENTS_MESSAGE, MODERATION_PRESETS, readModerationMetadata } from '../listing-policy';
import { DTI_SEC_REVISION_MESSAGE } from '../listing-revision-reminders';
import { formatPublicBusinessRow } from './public-business-payload';

const rejection = (fixture: ReturnType<typeof createModerationFixture>, overrides: Record<string, unknown> = {}) => ({ id: listingId, status: 'REJECTED', reasonCode: 'GAMBLING_RELATED_BUSINESS', moderatorNotes: MODERATION_PRESETS[0].message, decisionId, expectedStatus: fixture.row().status, expectedUpdatedAt: fixture.row().updatedAt.toISOString(), ...overrides });

test('missing registration preset describes absent evidence, allows applicable alternatives, and preserves the DTI/SEC response', () => {
  assert.equal(MISSING_REGISTRATION_DOCUMENTS_MESSAGE, 'Thank you for submitting your business to LocalPages. We couldn’t find a business registration document in your submission. Please upload your DTI, SEC, or other applicable business registration document, then resubmit your listing for review.');
  assert.equal(MODERATION_PRESETS.find((preset) => preset.code === 'MISSING_REGISTRATION_DOCUMENTS')?.message, MISSING_REGISTRATION_DOCUMENTS_MESSAGE);
  assert.equal(MODERATION_PRESETS.find((preset) => preset.code === 'DTI_SEC_DOCUMENT_REQUEST')?.message, DTI_SEC_REVISION_MESSAGE);
});

test('policy rejection persists reason and trusted actor; SMTP failure does not undo it', async () => {
  const f = createModerationFixture('PENDING', { emailFails: true });
  const response = await f.request('updateBusinessStatus', rejection(f, { adminUserId: 'forged-reviewer' }));
  assert.equal(response.status, 200);
  assert.equal((await response.json()).data.moderationEmailNotification.sent, false);
  assert.equal(f.row().status, 'REJECTED');
  assert.equal(readModerationMetadata(f.row().moderatorNotes)?.decision?.reviewerId, 'reviewer-a');
  assert.equal(f.effects.updates, 1); assert.equal(f.effects.emails, 1); assert.equal(f.effects.cache, 1);
  const own = await f.request('getBusinessById', { id: listingId }, 'owner-a');
  const business = (await own.json()).data.business;
  assert.equal(business.moderatorNotes, MODERATION_PRESETS[0].message);
  assert.equal(JSON.stringify(business).includes('reviewerId'), false);
  assert.equal(JSON.stringify(formatPublicBusinessRow(f.row())).includes('GAMBLING_RELATED_BUSINESS'), false);
});
test('duplicate decision retry returns saved result and does not resend an email', async () => {
  const f = createModerationFixture(); const request = rejection(f);
  assert.equal((await f.request('updateBusinessStatus', request)).status, 200);
  const retry = await f.request('updateBusinessStatus', request);
  assert.equal(retry.status, 200); assert.equal((await retry.json()).data.alreadyApplied, true);
  assert.equal(f.effects.updates, 1); assert.equal(f.effects.emails, 1);
  assert.equal((await f.request('updateBusinessStatus', { ...request, moderatorNotes: 'Changed retry' })).status, 409);
});
test('simultaneous same decision saves once; a competing decision fails with conflict', async () => {
  const f = createModerationFixture(); const request = rejection(f);
  const responses = await Promise.all([f.request('updateBusinessStatus', request), f.request('updateBusinessStatus', request), f.request('updateBusinessStatus', { ...request, decisionId: '33333333-3333-4333-8333-333333333333', status: 'APPROVED', reasonCode: undefined, moderatorNotes: '' }, 'reviewer-b')]);
  assert.deepEqual(responses.map((response) => response.status), [200, 200, 409]);
  assert.equal(f.effects.updates, 1); assert.equal(f.effects.emails, 1); assert.equal(f.effects.locks, 3);
});
test('blank, oversized, invalid-action and missing-document rejection reasons are rejected server-side', async () => {
  for (const overrides of [{ moderatorNotes: '' }, { moderatorNotes: 'x'.repeat(5001) }, { reasonCode: 'MISSING_REGISTRATION_DOCUMENTS' }, { reasonCode: 'DTI_SEC_DOCUMENT_REQUEST' }, { status: 'SUSPENDED' }, { status: 'APPROVED' }, { decisionId: 'invalid' }, { expectedUpdatedAt: undefined }, { expectedStatus: undefined }]) {
    const f = createModerationFixture();
    assert.ok([400, 409].includes((await f.request('updateBusinessStatus', rejection(f, overrides))).status));
    assert.equal(f.effects.updates, 0); assert.equal(f.effects.emails, 0);
  }
});
test('owner edits invalidate the reviewed version before a moderator can confirm', async () => {
  const f = createModerationFixture('REVISION_REQUESTED'); const oldDecision = rejection(f);
  assert.equal((await f.request('updateBusiness', { id: listingId, data: { description: 'Corrected actual services' } }, 'owner-a')).status, 200);
  assert.equal((await f.request('updateBusinessStatus', oldDecision)).status, 409);
  assert.equal(f.row().status, 'REVISION_REQUESTED'); assert.equal(f.effects.emails, 0);
});
test('approved content stays published and unchanged when an owner tries update, submit or rejection shortcuts', async () => {
  const f = createModerationFixture('APPROVED'); const before = f.row();
  assert.equal((await f.request('updateBusiness', { id: listingId, data: { description: 'Casino services', status: 'PENDING', moderatorNotes: '' } }, 'owner-a')).status, 409);
  assert.equal((await f.request('submitBusiness', { id: listingId, policyVersion: LISTING_POLICY_VERSION }, 'owner-a')).status, 409);
  assert.equal((await f.request('updateBusinessStatus', rejection(f))).status, 409);
  assert.deepEqual(f.row(), before); assert.equal(f.effects.updates, 0);
});
test('suspension preserves approved content and supports explicit reviewer reinstatement', async () => {
  const f = createModerationFixture('APPROVED'); const before = f.row();
  assert.equal((await f.request('updateBusinessStatus', rejection(f, { status: 'SUSPENDED' }))).status, 200);
  assert.equal(f.row().status, 'SUSPENDED'); assert.equal(f.row().description, before.description); assert.equal(f.row().gallery, before.gallery);
  assert.equal((await f.request('updateBusinessStatus', rejection(f, { status: 'APPROVED', reasonCode: undefined, moderatorNotes: '', decisionId: '33333333-3333-4333-8333-333333333333' }))).status, 200);
  assert.equal(f.row().status, 'APPROVED'); assert.equal(f.row().description, before.description);
});
test('inactive listings require an authorized reviewer and current reviewed version to reactivate', async () => {
  const f = createModerationFixture('INACTIVE'); const before = f.row();
  const approval = rejection(f, { status: 'APPROVED', reasonCode: undefined, moderatorNotes: '' });
  for (const uid of ['owner-a', 'subscriber-a', 'banned-a']) {
    assert.equal((await f.request('updateBusinessStatus', approval, uid)).status, 403);
  }
  assert.equal((await f.request('updateBusiness', { id: listingId, data: { name: 'Owner reactivation' } }, 'owner-a')).status, 409);
  assert.equal((await f.request('submitBusiness', { id: listingId, policyVersion: LISTING_POLICY_VERSION }, 'owner-a')).status, 409);
  assert.equal((await f.request('updateBusinessStatus', { ...approval, expectedUpdatedAt: '2020-01-01T00:00:00.000Z' })).status, 409);
  assert.deepEqual(f.row(), before); assert.equal(f.effects.emails, 0);
  assert.equal((await f.request('updateBusinessStatus', { ...approval, adminUserId: 'forged-reviewer' })).status, 200);
  assert.equal(f.row().status, 'APPROVED'); assert.equal(f.row().description, before.description);
  assert.equal(readModerationMetadata(f.row().moderatorNotes)?.decision?.reviewerId, 'reviewer-a');
  assert.equal(f.effects.updates, 1); assert.equal(f.effects.emails, 1);
  const retry = await f.request('updateBusinessStatus', approval);
  assert.equal(retry.status, 200); assert.equal((await retry.json()).data.alreadyApplied, true);
  assert.equal(f.effects.updates, 1); assert.equal(f.effects.emails, 1);
});
test('inactive recovery only permits explicit approval and does not enable draft review shortcuts', async () => {
  const inactive = createModerationFixture('INACTIVE'); const before = inactive.row();
  for (const overrides of [{}, { status: 'SUSPENDED' }, { status: 'REVISION_REQUESTED', reasonCode: 'MISSING_REGISTRATION_DOCUMENTS', moderatorNotes: MISSING_REGISTRATION_DOCUMENTS_MESSAGE }]) {
    assert.equal((await inactive.request('updateBusinessStatus', rejection(inactive, overrides))).status, 409);
  }
  assert.deepEqual(inactive.row(), before); assert.equal(inactive.effects.emails, 0);
  const draft = createModerationFixture('DRAFT');
  assert.equal((await draft.request('updateBusinessStatus', rejection(draft, { status: 'APPROVED', reasonCode: undefined, moderatorNotes: '' }))).status, 400);
  assert.equal(draft.row().status, 'DRAFT');
});
test('rejected and suspended decisions survive attempted owner updates and resubmission', async () => {
  for (const status of ['REJECTED', 'SUSPENDED'] as const) {
    const f = createModerationFixture(status); const before = f.row();
    for (const method of ['updateBusiness', 'submitBusiness']) assert.equal((await f.request(method, { id: listingId, data: { moderatorNotes: '', description: 'Renamed' }, policyVersion: LISTING_POLICY_VERSION }, 'owner-a')).status, 409);
    assert.deepEqual(f.row(), before); assert.equal(f.effects.emails, 0);
  }
});
test('ordinary document revisions remain editable and resubmit only with current policy acknowledgement', async () => {
  const f = createModerationFixture('PENDING', { missingDocuments: true });
  assert.equal((await f.request('updateBusinessStatus', rejection(f, { status: 'REVISION_REQUESTED', reasonCode: 'MISSING_REGISTRATION_DOCUMENTS', moderatorNotes: MODERATION_PRESETS[2].message }))).status, 200);
  assert.equal((await f.request('updateBusiness', { id: listingId, data: { documents: [{ id: 'synthetic', url: 'https://example.invalid/document' }], moderatorNotes: 'Forged', status: 'APPROVED' } }, 'owner-a')).status, 200);
  assert.equal((await f.request('submitBusiness', { id: listingId }, 'owner-a')).status, 400);
  assert.equal((await f.request('submitBusiness', { id: listingId, policyVersion: 'stale' }, 'owner-a')).status, 400);
  const responses = await Promise.all([f.request('submitBusiness', { id: listingId, policyVersion: LISTING_POLICY_VERSION }, 'owner-a'), f.request('submitBusiness', { id: listingId, policyVersion: LISTING_POLICY_VERSION }, 'owner-a')]);
  assert.deepEqual(responses.map((response) => response.status), [200, 200]); assert.equal(f.row().status, 'PENDING');
  const metadata = readModerationMetadata(f.row().moderatorNotes);
  assert.equal(metadata?.acknowledgement?.policyVersion, LISTING_POLICY_VERSION);
  assert.equal(metadata?.decision?.reasonCode, 'MISSING_REGISTRATION_DOCUMENTS');
  assert.equal(f.effects.emails, 2);
});
test('review requests enter support once and preserve the decision and listing status', async () => {
  const f = createModerationFixture('REJECTED'); const before = f.row();
  const request = { id: listingId, requestId: decisionId, message: 'We are an ordinary restaurant. Please reconsider.' };
  const results = await Promise.all([f.request('requestListingReview', request, 'owner-a'), f.request('requestListingReview', request, 'owner-a')]);
  assert.deepEqual(results.map((response) => response.status), [200, 200]); assert.equal(f.effects.ticketInserts, 1);
  assert.equal(f.tickets.get(decisionId)?.category, 'LISTING_REVIEW'); assert.deepEqual(f.row(), before); assert.equal(f.effects.emails, 0);
  assert.equal((await f.request('requestListingReview', { ...request, message: 'Changed retry' }, 'owner-a')).status, 409);
});
test('approved change requests preserve the public version and use the support change category', async () => {
  const f = createModerationFixture('APPROVED'); const before = f.row();
  assert.equal((await f.request('requestListingReview', { id: listingId, requestId: decisionId, message: 'Please review a new phone number.' }, 'owner-a')).status, 200);
  assert.equal(f.tickets.get(decisionId)?.category, 'LISTING_CHANGE'); assert.deepEqual(f.row(), before);
});
test('listing requests cannot be forged for another owner or through generic support creation', async () => {
  const f = createModerationFixture('REJECTED');
  const request = { id: listingId, requestId: decisionId, message: 'Synthetic explanation' };
  for (const uid of ['other-owner', 'subscriber-a', 'banned-a']) assert.equal((await f.request('requestListingReview', request, uid)).status, 403);
  assert.equal((await f.request('createSupportTicket', { category: 'LISTING_REVIEW', subject: 'Forged', message: 'Forged listing claim' }, 'owner-a')).status, 400);
  assert.equal((await f.request('updateBusinessStatus', rejection(f), 'owner-a')).status, 403);
  assert.equal(f.effects.ticketInserts, 0); assert.equal(f.effects.updates, 0);
});
test('missing owner email does not prevent suspension from being saved', async () => {
  const f = createModerationFixture('APPROVED', { ownerMissingEmail: true });
  const response = await f.request('updateBusinessStatus', rejection(f, { status: 'SUSPENDED' }));
  assert.equal(response.status, 200); assert.equal((await response.json()).data.moderationEmailNotification.reason, 'missing_owner_email');
  assert.equal(f.row().status, 'SUSPENDED'); assert.equal(f.effects.emails, 0);
});

test('approved, pending, rejected and suspended media cannot be uploaded or deleted through application endpoints', async () => {
  for (const status of ['APPROVED', 'PENDING', 'REJECTED', 'SUSPENDED'] as const) {
    const f = createModerationFixture(status);
    assert.equal((await f.mediaRequest('upload-permission')).status, 409);
    assert.equal((await f.mediaRequest('delete-media')).status, 409);
    assert.equal(f.effects.mediaDeletes, 0);
  }
  const draft = createModerationFixture('DRAFT');
  assert.equal((await draft.mediaRequest('upload-permission')).status, 200);
  assert.equal((await draft.mediaRequest('delete-media')).status, 200);
  assert.equal(draft.effects.mediaDeletes, 1); // In-memory spy only; no Storage SDK imported.
});

test('a casino-associated restaurant name is not automatically rejected on submission', async () => {
  const f = createModerationFixture('DRAFT');
  assert.equal((await f.request('updateBusiness', { id: listingId, data: { name: 'Ordinary restaurant beside Casino Hotel' } }, 'owner-a')).status, 200);
  assert.equal((await f.request('submitBusiness', { id: listingId, policyVersion: LISTING_POLICY_VERSION }, 'owner-a')).status, 200);
  assert.equal(f.row().status, 'PENDING');
});
