import assert from 'node:assert/strict';
import test from 'node:test';

import {
  DTI_SEC_REVISION_MESSAGE,
  getRevisionReminderRetryAt,
  hasVerificationDocuments,
} from './listing-revision-reminders';

test('uses the approved DTI /SEC reminder wording', () => {
  assert.match(DTI_SEC_REVISION_MESSAGE, /DTI \/SEC Certificate/);
});

test('enforces a 24-hour reminder cooldown', () => {
  const now = new Date('2026-08-07T12:00:00.000Z');
  assert.equal(
    getRevisionReminderRetryAt('2026-08-07T00:00:00.000Z', now)?.toISOString(),
    '2026-08-08T00:00:00.000Z',
  );
  assert.equal(getRevisionReminderRetryAt('2026-08-06T11:59:59.000Z', now), null);
});

test('detects uploaded verification documents from arrays or serialized values', () => {
  assert.equal(hasVerificationDocuments([]), false);
  assert.equal(hasVerificationDocuments('[{"id":"document-1"}]'), true);
  assert.equal(hasVerificationDocuments('invalid-json'), false);
});
