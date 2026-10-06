import assert from 'node:assert/strict';
import test from 'node:test';

import {
  canInvokeDataApiMethod,
  DATA_API_POLICIES,
  isDataApiMethod,
  type DataApiMethod,
} from './data-api-policy';

test('the authenticated data API exposes only its explicit operation allowlist', () => {
  assert.equal(isDataApiMethod('getUserById'), true);
  assert.equal(isDataApiMethod('getAllBusinesses'), true);
  assert.equal(isDataApiMethod('searchApprovedBusinesses'), false);
  assert.equal(isDataApiMethod('__proto__'), false);
  assert.equal(isDataApiMethod('constructor'), false);
  assert.equal(isDataApiMethod(undefined), false);
  assert.equal(Object.keys(DATA_API_POLICIES).length, 40);
});

test('bootstrap operations require a valid token but not an existing database profile', () => {
  assert.equal(canInvokeDataApiMethod('createUser', null), true);
  assert.equal(canInvokeDataApiMethod('getUserById', null), true);
  assert.equal(canInvokeDataApiMethod('updateUser', null), false);
});

test('subscribers are limited to their profile, support, and sent inquiries', () => {
  const allowed: DataApiMethod[] = [
    'updateUser',
    'createSupportTicket',
    'getMySupportTickets',
    'getMySentBusinessInquiries',
    'deleteMyBusinessInquiry',
    'markMyBusinessInquiryRead',
    'replyMyBusinessInquiry',
  ];

  allowed.forEach((method) => {
    assert.equal(canInvokeDataApiMethod(method, 'SUBSCRIBER'), true, method);
  });
  assert.equal(canInvokeDataApiMethod('getMyBusinesses', 'SUBSCRIBER'), false);
  assert.equal(canInvokeDataApiMethod('getAllBusinesses', 'SUBSCRIBER'), false);
  assert.equal(canInvokeDataApiMethod('upsertCategory', 'SUBSCRIBER'), false);
  assert.equal(canInvokeDataApiMethod('updateUser', 'UNKNOWN_ROLE'), false);
});

test('business accounts can manage business-owned operations but cannot review or administer', () => {
  assert.equal(canInvokeDataApiMethod('getMyBusinesses', 'BUSINESS'), true);
  assert.equal(canInvokeDataApiMethod('requestListingReview', 'BUSINESS'), true);
  assert.equal(canInvokeDataApiMethod('requestListingReview', 'SUBSCRIBER'), false);
  assert.equal(canInvokeDataApiMethod('createBusinessDraft', 'BUSINESS'), true);
  assert.equal(canInvokeDataApiMethod('getBusinessById', 'BUSINESS'), true);
  assert.equal(canInvokeDataApiMethod('getAllBusinesses', 'BUSINESS'), false);
  assert.equal(canInvokeDataApiMethod('updateUserRole', 'BUSINESS'), false);
});

test('moderators can review listings and support tickets without admin powers', () => {
  assert.equal(canInvokeDataApiMethod('getBusinessById', 'MODERATOR'), true);
  assert.equal(canInvokeDataApiMethod('getAllBusinesses', 'MODERATOR'), true);
  assert.equal(canInvokeDataApiMethod('updateBusinessStatus', 'MODERATOR'), true);
  assert.equal(canInvokeDataApiMethod('sendBusinessRevisionReminder', 'MODERATOR'), true);
  assert.equal(canInvokeDataApiMethod('updateSupportTicket', 'MODERATOR'), true);
  assert.equal(canInvokeDataApiMethod('getAllUsers', 'MODERATOR'), false);
  assert.equal(canInvokeDataApiMethod('createBackupSnapshot', 'MODERATOR'), false);
  assert.equal(canInvokeDataApiMethod('upsertCategory', 'MODERATOR'), false);
});

test('administrators can invoke every allowlisted operation', () => {
  for (const method of Object.keys(DATA_API_POLICIES) as DataApiMethod[]) {
    assert.equal(canInvokeDataApiMethod(method, 'ADMIN'), true, method);
  }
});
