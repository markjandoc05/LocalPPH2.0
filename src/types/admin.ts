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
  emailVerified?: boolean;
  createdAt?: string;
}

export interface SupportTicket {
  id: string;
  userId: string;
  category: string;
  subject: string;
  message: string;
  status: string;
  adminResponse?: string | null;
  createdAt?: string;
  updatedAt?: string;
  user?: UserAccount | null;
}
