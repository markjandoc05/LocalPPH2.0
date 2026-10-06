type DraftSessionStorage = Pick<Storage, 'getItem' | 'setItem'> | null | undefined;
const keyForOwner = (ownerId: string) => `localpages_listing_request:${ownerId}`;
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const getPendingListingRequest = (ownerId: string, storage: DraftSessionStorage): string | null => {
  try {
    const value = storage?.getItem(keyForOwner(ownerId));
    if (!value) return null;
    const request = JSON.parse(value);
    return request?.state === 'pending' && typeof request.id === 'string' && uuidPattern.test(request.id) ? request.id : null;
  } catch { return null; }
};

export const rememberListingRequest = (ownerId: string, id: string, storage: DraftSessionStorage) => {
  try { storage?.setItem(keyForOwner(ownerId), JSON.stringify({ id, state: 'pending' })); }
  catch { /* The current form still retains its request ID when browser storage is unavailable. */ }
};

export const completeListingRequest = (ownerId: string, id: string, storage: DraftSessionStorage) => {
  if (getPendingListingRequest(ownerId, storage) !== id) return;
  try { storage?.setItem(keyForOwner(ownerId), JSON.stringify({ id, state: 'complete' })); }
  catch { /* Keeping a recovery marker is safe; the saved listing is never overwritten. */ }
};
