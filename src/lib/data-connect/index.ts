import { provider } from "./provider";

// WARNING: Currently using the provider which wraps mock data.
// Before deploying to production, ensure NEXT_PUBLIC_DATA_MODE is set to 'firebase'
// and the SDK is generated.

export const {
  createUser,
  getUserById,
  updateUser,
  updateUserAccountStatus,
  getAllUsers,
  createSupportTicket,
  getMySupportTickets,
  getAllSupportTickets,
  updateSupportTicket,
  createBackupSnapshot,
  getBackupSnapshots,
  restoreBackupSnapshot,
  deleteBackupSnapshot,
  getBackupSchedule,
  updateBackupSchedule,
  runDueBackupSchedule,
  getMyBusinesses,
  getBusinessById,
  createBusinessDraft,
  updateBusiness,
  submitBusiness,
  getAllBusinesses,
  updateBusinessStatus,
  searchApprovedBusinesses,
  getApprovedBusinessBySlug,
  getFeaturedApprovedBusinesses,
  getRecentlyApprovedBusinesses,
} = provider;
