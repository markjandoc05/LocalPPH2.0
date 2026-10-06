export interface BusinessInquirySender {
  displayName: string | null;
  email: string;
}

export const toBusinessInquirySender = (
  user: { displayName?: unknown; email?: unknown } | null | undefined,
): BusinessInquirySender | null => user ? {
  displayName: typeof user.displayName === 'string' ? user.displayName : null,
  email: typeof user.email === 'string' ? user.email : '',
} : null;
