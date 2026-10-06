import { provider } from "./provider";
import { BusinessListing, BusinessStatus } from "@/types/business";
import { UserAccount, AdminDashboardStats, SupportTicket } from "@/types/admin";
import type { ModerationRequest } from '@/lib/listing-policy';
import { normalizeRole } from "@/lib/auth/roles";

// Wrapper service around the Data Connect operations (or mocks) for Admin functionality

export const getAdminDashboardStats =
  async (): Promise<AdminDashboardStats> => {
    const [businessesResult, usersResult] = await Promise.all([
      provider.getAllBusinesses(),
      provider.getAllUsers(),
    ]);

    const businesses = businessesResult.data.businesses as BusinessListing[];
    const users = usersResult.data.users as UserAccount[];

    return {
      totalBusinesses: businesses.length,
      pendingApproval: businesses.filter((b) => b.status === "PENDING").length,
      approved: businesses.filter((b) => b.status === "APPROVED").length,
      needsRevision: businesses.filter((b) => b.status === "REVISION_REQUESTED")
        .length,
      rejected: businesses.filter((b) => b.status === "REJECTED").length,
      suspended: businesses.filter((b) => b.status === "SUSPENDED").length,
      totalUsers: users.length,
      businessAccounts: users.filter((u) => normalizeRole(u.role) === "BUSINESS").length,
    };
  };

export const getAllBusinesses = async (filters?: {
  status?: BusinessStatus;
}): Promise<BusinessListing[]> => {
  const result = await provider.getAllBusinesses(filters);
  return result.data.businesses as BusinessListing[];
};

export const getPendingBusinesses = async (): Promise<BusinessListing[]> => {
  return getAllBusinesses({ status: "PENDING" });
};

export const getBusinessForReview = async (
  id: string,
): Promise<BusinessListing | null> => {
  const result = await provider.getBusinessById({ id });
  return result.data.business as BusinessListing | null;
};

const saveBusinessReview = async (id: string, status: 'APPROVED' | 'REJECTED' | 'REVISION_REQUESTED' | 'SUSPENDED', adminUserId: string, request: ModerationRequest, reason = '') => {
  const result = await provider.updateBusinessStatus({ ...request, id, status, adminUserId, moderatorNotes: reason });
  return result.data;
};
export const approveBusiness = (id: string, adminUserId: string, request: ModerationRequest) => saveBusinessReview(id, 'APPROVED', adminUserId, request);
export const rejectBusiness = (id: string, adminUserId: string, reason: string, request: ModerationRequest) => saveBusinessReview(id, 'REJECTED', adminUserId, request, reason);
export const requestBusinessRevision = (id: string, adminUserId: string, reason: string, request: ModerationRequest) => saveBusinessReview(id, 'REVISION_REQUESTED', adminUserId, request, reason);

export const sendBusinessRevisionReminder = async (id: string) => {
  const result = await provider.sendBusinessRevisionReminder({ id });
  return result.data.revisionReminder;
};

export const suspendBusiness = (id: string, adminUserId: string, reason: string, request: ModerationRequest) => saveBusinessReview(id, 'SUSPENDED', adminUserId, request, reason);

export const getAllUsers = async (): Promise<UserAccount[]> => {
  const result = await provider.getAllUsers();
  return result.data.users as UserAccount[];
};

export const updateUserAccountStatus = async (
  id: string,
  accountStatus: 'ACTIVE' | 'BANNED' | 'DELETED',
) => {
  const result = await provider.updateUserAccountStatus({
    id,
    accountStatus,
  });
  return result.data.user_update;
};

export const updateUserRole = async (
  id: string,
  nextRole: 'BUSINESS',
) => {
  const result = await provider.updateUserRole({
    id,
    role: nextRole,
  });
  return result.data;
};

export const deleteUserAccount = async (id: string) => {
  const result = await provider.deleteUserAccount({ id });
  return result.data;
};

export const getAllSupportTickets = async (): Promise<SupportTicket[]> => {
  const result = await provider.getAllSupportTickets();
  return result.data.supportTickets as SupportTicket[];
};

export const createBackupSnapshot = async (variables: {
  label?: string;
  scope: string[];
  backupType?: 'MANUAL' | 'SCHEDULED';
  createdById?: string;
}) => {
  const result = await provider.createBackupSnapshot(variables);
  return result.data.backup_snapshot_insert;
};

export const getBackupSnapshots = async () => {
  const result = await provider.getBackupSnapshots();
  return result.data.backupSnapshots;
};

export const restoreBackupSnapshot = async (variables: {
  id: string;
  scope?: string[];
  restoredById?: string;
}) => {
  const result = await provider.restoreBackupSnapshot(variables);
  return result.data;
};

export const deleteBackupSnapshot = async (id: string) => {
  const result = await provider.deleteBackupSnapshot({ id });
  return result.data.backup_snapshot_delete;
};

export const getBackupSchedule = async () => {
  const result = await provider.getBackupSchedule();
  return result.data.backupSchedule;
};

export const updateBackupSchedule = async (variables: {
  enabled: boolean;
  frequency: string;
  scope: string[];
  timeOfDay: string;
  updatedById?: string;
}) => {
  const result = await provider.updateBackupSchedule(variables);
  return result.data.backupSchedule;
};

export const runDueBackupSchedule = async (createdById?: string) => {
  const result = await provider.runDueBackupSchedule({ createdById });
  return result.data;
};
