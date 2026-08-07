export const REVISION_REMINDER_COOLDOWN_MS = 24 * 60 * 60 * 1000;

export const DTI_SEC_REVISION_MESSAGE =
  'To help us verify and approve your listing, please upload your DTI /SEC Certificate or any valid business registration document. Thank you!';

export const getRevisionReminderRetryAt = (
  lastSentAt?: string | Date | null,
  now = new Date(),
) => {
  if (!lastSentAt) return null;

  const sentAt = new Date(lastSentAt).getTime();
  if (!Number.isFinite(sentAt)) return null;

  const retryAt = sentAt + REVISION_REMINDER_COOLDOWN_MS;
  return retryAt > now.getTime() ? new Date(retryAt) : null;
};

export const hasVerificationDocuments = (documents: unknown) => {
  if (Array.isArray(documents)) return documents.length > 0;
  if (typeof documents !== 'string' || !documents.trim()) return false;

  try {
    const parsed = JSON.parse(documents);
    return Array.isArray(parsed) && parsed.length > 0;
  } catch {
    return false;
  }
};
