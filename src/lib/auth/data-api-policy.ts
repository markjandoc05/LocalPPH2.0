import { normalizeRole, ROLES } from '@/lib/auth/roles';

export const DATA_API_POLICIES = {
  createUser: 'bootstrap',
  getUserById: 'bootstrap',
  updateUser: 'authenticated',
  createSupportTicket: 'authenticated',
  getMySupportTickets: 'authenticated',
  getMySentBusinessInquiries: 'authenticated',
  deleteMyBusinessInquiry: 'authenticated',
  markMyBusinessInquiryRead: 'authenticated',
  replyMyBusinessInquiry: 'authenticated',
  getMyBusinesses: 'business',
  createBusinessDraft: 'business',
  updateBusiness: 'business',
  submitBusiness: 'business',
  getMyBusinessInquiries: 'business',
  respondBusinessInquiry: 'business',
  markBusinessInquiryRead: 'business',
  deleteBusinessInquiry: 'business',
  getBusinessById: 'business-review',
  getAllBusinesses: 'reviewer',
  updateBusinessStatus: 'reviewer',
  sendBusinessRevisionReminder: 'reviewer',
  getAllSupportTickets: 'reviewer',
  updateSupportTicket: 'reviewer',
  updateUserAccountStatus: 'admin',
  updateUserRole: 'admin',
  deleteUserAccount: 'admin',
  getAllUsers: 'admin',
  createBackupSnapshot: 'admin',
  getBackupSnapshots: 'admin',
  restoreBackupSnapshot: 'admin',
  deleteBackupSnapshot: 'admin',
  getBackupSchedule: 'admin',
  updateBackupSchedule: 'admin',
  runDueBackupSchedule: 'admin',
  upsertRegion: 'admin',
  upsertProvince: 'admin',
  upsertCity: 'admin',
  upsertCategory: 'admin',
  upsertSubcategory: 'admin',
} as const;

export type DataApiMethod = keyof typeof DATA_API_POLICIES;
export type DataApiAccess = (typeof DATA_API_POLICIES)[DataApiMethod];
const KNOWN_ROLES = new Set<string>(Object.values(ROLES));

export const isDataApiMethod = (method: unknown): method is DataApiMethod =>
  typeof method === 'string' && Object.hasOwn(DATA_API_POLICIES, method);

export const canInvokeDataApiMethod = (
  method: DataApiMethod,
  role?: string | null,
): boolean => {
  const access = DATA_API_POLICIES[method];
  if (access === 'bootstrap') return true;
  if (!role) return false;

  const normalizedRole = normalizeRole(role);
  if (!KNOWN_ROLES.has(normalizedRole)) return false;

  if (access === 'authenticated') return true;
  if (access === 'business') {
    return normalizedRole === ROLES.BUSINESS || normalizedRole === ROLES.ADMIN;
  }
  if (access === 'business-review') {
    return (
      normalizedRole === ROLES.BUSINESS ||
      normalizedRole === ROLES.ADMIN ||
      normalizedRole === ROLES.MODERATOR
    );
  }
  if (access === 'reviewer') {
    return normalizedRole === ROLES.ADMIN || normalizedRole === ROLES.MODERATOR;
  }

  return normalizedRole === ROLES.ADMIN;
};
