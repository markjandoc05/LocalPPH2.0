import { BusinessListing, BusinessStatus } from "@/types/business";

export interface DataProvider {
  // User operations
  createUser(variables: {
    id: string;
    email: string;
    displayName: string;
    photoUrl?: string;
    role: string;
    emailVerified?: boolean;
  }): Promise<{ data: { user_insert: string } }>;
  getUserById(variables: {
    id: string;
  }): Promise<{ data: { user: any | null } }>;
  updateUser(variables: {
    id: string;
    data: any;
  }): Promise<{ data: { user_update: string } }>;
  updateUserAccountStatus(variables: {
    id: string;
    accountStatus: string;
  }): Promise<{ data: { user_update: string } }>;
  updateUserRole(variables: {
    id: string;
    role: string;
  }): Promise<{ data: { user_update: string; upgradeEmailNotification?: any } }>;
  deleteUserAccount(variables: {
    id: string;
  }): Promise<{ data: { user_delete: string; deletedBusinesses: number } }>;
  getAllUsers(): Promise<{ data: { users: any[] } }>;

  // Support operations
  createSupportTicket(variables: {
    userId: string;
    category: string;
    subject: string;
    message: string;
  }): Promise<{ data: { support_ticket_insert: string } }>;
  getMySupportTickets(variables: {
    userId: string;
  }): Promise<{ data: { supportTickets: any[] } }>;
  getAllSupportTickets(): Promise<{ data: { supportTickets: any[] } }>;
  updateSupportTicket(variables: {
    id: string;
    status?: string;
    adminResponse?: string;
    respondedById?: string;
  }): Promise<{ data: { support_ticket_update: string } }>;
  getMyBusinessInquiries(variables: {
    ownerId: string;
  }): Promise<{ data: { inquiries: any[] } }>;
  respondBusinessInquiry(variables: {
    id: string;
    ownerId: string;
    response: string;
  }): Promise<{ data: { inquiry_update: string } }>;
  markBusinessInquiryRead(variables: {
    id: string;
    ownerId: string;
  }): Promise<{ data: { inquiry_update: string } }>;
  deleteBusinessInquiry(variables: {
    id: string;
    ownerId: string;
  }): Promise<{ data: { inquiry_delete: string } }>;
  getMySentBusinessInquiries(variables: {
    userId: string;
  }): Promise<{ data: { inquiries: any[] } }>;
  deleteMyBusinessInquiry(variables: {
    id: string;
    userId: string;
  }): Promise<{ data: { inquiry_delete: string } }>;
  markMyBusinessInquiryRead(variables: {
    id: string;
    userId: string;
  }): Promise<{ data: { inquiry_update: string } }>;
  replyMyBusinessInquiry(variables: {
    id: string;
    userId: string;
    response: string;
  }): Promise<{ data: { inquiry_update: string } }>;

  // Backup and recovery operations
  createBackupSnapshot(variables: {
    label?: string;
    scope: string[];
    backupType?: 'MANUAL' | 'SCHEDULED';
    createdById?: string;
  }): Promise<{ data: { backup_snapshot_insert: string } }>;
  getBackupSnapshots(): Promise<{ data: { backupSnapshots: any[] } }>;
  restoreBackupSnapshot(variables: {
    id: string;
    scope?: string[];
    restoredById?: string;
  }): Promise<{ data: { backup_snapshot_restore: string; restoredCount: number } }>;
  deleteBackupSnapshot(variables: {
    id: string;
  }): Promise<{ data: { backup_snapshot_delete: string } }>;
  getBackupSchedule(): Promise<{ data: { backupSchedule: any } }>;
  updateBackupSchedule(variables: {
    enabled: boolean;
    frequency: string;
    scope: string[];
    timeOfDay: string;
    updatedById?: string;
  }): Promise<{ data: { backupSchedule: any } }>;
  runDueBackupSchedule(variables?: {
    createdById?: string;
  }): Promise<{ data: { ran: boolean; backupId?: string } }>;

  // Business operations
  getMyBusinesses(variables: {
    ownerId: string;
  }): Promise<{ data: { businesses: BusinessListing[] } }>;
  getBusinessById(variables: {
    id: string;
  }): Promise<{ data: { business: BusinessListing | null } }>;
  createBusinessDraft(
    variables: any,
  ): Promise<{ data: { business_insert: string } }>;
  updateBusiness(variables: {
    id: string;
    data: any;
  }): Promise<{ data: { business_update: string } }>;
  submitBusiness(variables: {
    id: string;
  }): Promise<{ data: { business_update: string } }>;

  // Admin operations
  getAllBusinesses(variables?: {
    status?: BusinessStatus;
  }): Promise<{ data: { businesses: BusinessListing[] } }>;
  updateBusinessStatus(variables: {
    id: string;
    status: BusinessStatus;
    moderatorNotes?: string;
    adminUserId?: string;
  }): Promise<{ data: { business_update: string; approvalEmailNotification?: any; revisionEmailNotification?: any } }>;

  // Public operations
  searchApprovedBusinesses(variables: {
    q?: string;
    categoryId?: string;
    regionId?: string;
    provinceId?: string;
    cityId?: string;
    verifiedOnly?: boolean;
    featuredOnly?: boolean;
    sort?: string;
    limit?: number;
    page?: number;
  }): Promise<{ data: { businesses: BusinessListing[]; total: number } }>;
  getSearchSuggestions(variables: { q: string }): Promise<{ data: { suggestions: any[] } }>;
  getApprovedBusinessBySlug(variables: {
    slug: string;
  }): Promise<{ data: { business: BusinessListing | null } }>;
  getFeaturedApprovedBusinesses(): Promise<{
    data: { businesses: BusinessListing[] };
  }>;
  getRecentlyApprovedBusinesses(): Promise<{
    data: { businesses: BusinessListing[] };
  }>;

  // Metadata operations (Seeding & Lookups)
  getRegions(): Promise<{ data: { regions: any[] } }>;
  getProvinces(variables?: { regionId?: string }): Promise<{ data: { provinces: any[] } }>;
  getCities(variables?: { provinceId?: string }): Promise<{ data: { cities: any[] } }>;
  getCategories(): Promise<{ data: { categories: any[] } }>;
  getSubcategories(variables?: { categoryId?: string }): Promise<{ data: { subcategories: any[] } }>;

  upsertRegion(variables: { name: string; slug: string }): Promise<{ data: { region_upsert: string } }>;
  upsertProvince(variables: { name: string; slug: string; regionId: string }): Promise<{ data: { province_upsert: string } }>;
  upsertCity(variables: { name: string; slug: string; provinceId: string }): Promise<{ data: { city_upsert: string } }>;
  upsertCategory(variables: { name: string; slug: string; description?: string }): Promise<{ data: { category_upsert: string } }>;
  upsertSubcategory(variables: { name: string; slug: string; categoryId: string }): Promise<{ data: { subcategory_upsert: string } }>;
}
