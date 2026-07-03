import { provider } from "./provider";
import { BusinessListing, BusinessStatus } from "@/types/business";
import { UserAccount, AdminDashboardStats } from "@/types/admin";

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
      businessAccounts: users.filter((u) => u.role === "BUSINESS").length,
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
  return result.data.business_update;
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
  return result.data.business_update;
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
