import { provider } from "./provider";

// WARNING: Currently using the provider which wraps mock data.
// Before deploying to production, ensure NEXT_PUBLIC_DATA_MODE is set to 'firebase'
// and the SDK is generated.

export const {
  createUser,
  getUserById,
  getAllUsers,
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
