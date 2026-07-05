import { BusinessListing, BusinessStatus } from "@/types/business";

export interface DataProvider {
  // User operations
  createUser(variables: {
    id: string;
    email: string;
    displayName: string;
    photoUrl?: string;
    role: string;
  }): Promise<{ data: { user_insert: string } }>;
  getUserById(variables: {
    id: string;
  }): Promise<{ data: { user: any | null } }>;
  updateUser(variables: {
    id: string;
    data: any;
  }): Promise<{ data: { user_update: string } }>;
  getAllUsers(): Promise<{ data: { users: any[] } }>;

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
  }): Promise<{ data: { business_update: string } }>;

  // Public operations
  searchApprovedBusinesses(
    variables: any,
  ): Promise<{ data: { businesses: BusinessListing[]; total: number } }>;
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
  upsertCategory(variables: { name: string; slug: string }): Promise<{ data: { category_upsert: string } }>;
  upsertSubcategory(variables: { name: string; slug: string; categoryId: string }): Promise<{ data: { subcategory_upsert: string } }>;
}
