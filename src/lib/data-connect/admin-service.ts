import { provider } from "./provider";
import { BusinessListing, BusinessStatus } from "@/types/business";
import { UserAccount, AdminDashboardStats, SupportTicket } from "@/types/admin";
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

export const approveBusiness = async (id: string, adminUserId: string) => {
  const result = await provider.updateBusinessStatus({
    id,
    status: "APPROVED",
    adminUserId,
  });
  return result.data;
};

export const rejectBusiness = async (
  id: string,
  adminUserId: string,
  reason: string,
) => {
  const result = await provider.updateBusinessStatus({
    id,
    status: "REJECTED",
    moderatorNotes: reason,
    adminUserId,
  });
  return result.data.business_update;
};

export const requestBusinessRevision = async (
  id: string,
  adminUserId: string,
  note: string,
) => {
  const result = await provider.updateBusinessStatus({
    id,
    status: "REVISION_REQUESTED",
    moderatorNotes: note,
    adminUserId,
  });
  return result.data;
};

export const sendBusinessRevisionReminder = async (id: string) => {
  const result = await provider.sendBusinessRevisionReminder({ id });
  return result.data.revisionReminder;
};

export const suspendBusiness = async (
  id: string,
  adminUserId: string,
  reason: string,
) => {
  const result = await provider.updateBusinessStatus({
    id,
    status: "SUSPENDED",
    moderatorNotes: reason,
    adminUserId,
  });
  return result.data.business_update;
};

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
