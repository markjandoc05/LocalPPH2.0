import assert from 'node:assert/strict';
import test from 'node:test';
import { sanitizePublicBusinessPayload } from './public-business-payload';

test('removes private owner, verification, and moderation data from public listings', () => {
  const result = sanitizePublicBusinessPayload({
    id: 'business-1',
    name: 'Example Business',
    ownerId: 'firebase-user-id',
    ownerName: 'private@example.com',
    owner: {
      email: 'private@example.com',
      mobileNumber: '09170000000',
      addressLine1: 'Private home address',
    },
    documents: [{ name: 'business-permit.pdf', url: 'https://private.example/document' }],
    moderatorNotes: 'Internal review notes',
    contactEmail: 'hello@example-business.ph',
    gallery: ['https://public.example/photo.jpg'],
  });

  assert.deepEqual(result, {
    id: 'business-1',
    name: 'Example Business',
    contactEmail: 'hello@example-business.ph',
    gallery: ['https://public.example/photo.jpg'],
  });
});
