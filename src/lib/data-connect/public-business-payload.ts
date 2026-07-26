const PRIVATE_BUSINESS_FIELDS = new Set([
  'ownerId',
  'owner',
  'ownerName',
  'documents',
  'moderatorNotes',
]);

export const sanitizePublicBusinessPayload = <T extends Record<string, unknown>>(business: T) =>
  Object.fromEntries(
    Object.entries(business).filter(([key]) => !PRIVATE_BUSINESS_FIELDS.has(key)),
  );
