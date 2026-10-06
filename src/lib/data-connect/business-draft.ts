export class BusinessDraftCreationError extends Error {
  constructor(message: string, readonly status: 403 | 409 | 503) {
    super(message);
    this.name = 'BusinessDraftCreationError';
  }
}

export const getBusinessDraftReplay = (
  existing: { id: string; ownerId: string; status: string } | null | undefined,
  ownerId: string,
) => {
  if (!existing) return null;
  if (existing.ownerId !== ownerId) {
    throw new BusinessDraftCreationError('Business ID is unavailable for this account.', 403);
  }
  if (existing.status !== 'DRAFT') {
    throw new BusinessDraftCreationError('This listing has already been saved. Open the saved listing to check its status.', 409);
  }
  return { data: { business_insert: existing.id, business_created: false } };
};
