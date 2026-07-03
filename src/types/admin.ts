export interface AdminDashboardStats {
  totalBusinesses: number;
  pendingApproval: number;
  approved: number;
  needsRevision: number;
  rejected: number;
  suspended: number;
  totalUsers: number;
  businessAccounts: number;
}

export interface UserAccount {
  id: string;
  email: string;
  displayName: string;
  role: string;
  accountStatus: string;
  createdAt?: string;
}
