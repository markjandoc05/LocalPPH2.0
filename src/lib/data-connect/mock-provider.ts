import { DataProvider } from "./types";
import { BusinessListing, BusinessStatus } from "@/types/business";
import { regions as seedRegions, provinces as seedProvinces, cities as seedCities } from "./seed/locations";
import { categories as seedCategories } from "./seed/categories";

// TEMPORARY DEVELOPMENT ONLY - DO NOT USE IN PRODUCTION
// Mock DB
let mockUsers: any[] = [
  {
    id: "mock-user-id",
    email: "business@example.com",
    displayName: "Business Owner",
    role: "BUSINESS",
    accountStatus: "ACTIVE",
    createdAt: new Date().toISOString(),
  },
  {
    id: "mock-admin-id",
    email: "admin@example.com",
    displayName: "System Admin",
    role: "ADMIN",
    accountStatus: "ACTIVE",
    createdAt: new Date().toISOString(),
  },
  {
    id: "markjandoc-admin-id",
    email: "markjandoc@gmail.com",
    displayName: "Mark Jandoc",
    role: "ADMIN",
    accountStatus: "ACTIVE",
    createdAt: new Date().toISOString(),
  },
];

const mockRegions = seedRegions.map((r, i) => ({ id: `r${i + 1}`, ...r }));
const mockProvinces = seedProvinces.map((p, i) => {
  const region = mockRegions.find(r => r.slug === p.regionSlug);
  return { id: `p${i + 1}`, name: p.name, slug: p.slug, regionId: region?.id };
});
const mockCities = seedCities.map((c, i) => {
  const province = mockProvinces.find(p => p.slug === c.provinceSlug);
  return { id: `city${i + 1}`, name: c.name, slug: c.slug, provinceId: province?.id };
});

const mockCategories = seedCategories.map((c, i) => ({ id: `c${i + 1}`, name: c.name, slug: c.slug }));
const mockSubcategories: any[] = [];
seedCategories.forEach((c, i) => {
  const catId = `c${i + 1}`;
  c.subcategories.forEach((s) => {
    mockSubcategories.push({ id: `s${mockSubcategories.length + 1}`, categoryId: catId, name: s.name, slug: s.slug });
  });
});

const mockBusinesses: BusinessListing[] = [
  {
    id: "b1",
    ownerId: "mock-user-id",
    name: "Sample Cafe Manila",
    slug: "sample-cafe-manila",
    description: "A great place for coffee.",
    categoryId: "c1",
    categoryName: "Food & Beverage",
    regionId: "r1",
    provinceId: "p1",
    cityId: "city1",
    cityName: "Manila",
    addressLine1: "123 Taft Ave",
    contactMobile: "09171234567",
    status: "APPROVED",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const mockProvider: DataProvider = {
  async createUser(variables) {
    console.warn("⚠️ TEMPORARY MOCK ONLY: createUser", variables);
    let safeRole = ["ADMIN", "MODERATOR"].includes(variables.role)
      ? "SUBSCRIBER"
      : variables.role;

    if (variables.email === "markjandoc@gmail.com") {
      safeRole = "ADMIN";
    }

    mockUsers.push({
      id: variables.id,
      email: variables.email,
      displayName: variables.displayName,
      role: safeRole,
      accountStatus: "ACTIVE",
      createdAt: new Date().toISOString(),
    });

    return { data: { user_insert: variables.id } };
  },

  async getUserById(variables) {
    console.warn("⚠️ TEMPORARY MOCK ONLY: getUserById", variables);
    const user = mockUsers.find((u) => u.id === variables.id);
    return { data: { user: user || null } };
  },

  async updateUser(variables) {
    console.warn("⚠️ TEMPORARY MOCK ONLY: updateUser", variables);
    const index = mockUsers.findIndex((u) => u.id === variables.id);
    if (index !== -1) {
      mockUsers[index] = {
        ...mockUsers[index],
        ...variables.data,
      };
      return { data: { user_update: mockUsers[index].id } };
    }
    throw new Error("User not found");
  },

  async getAllUsers() {
    console.warn("⚠️ TEMPORARY MOCK ONLY: getAllUsers");
    return { data: { users: mockUsers } };
  },

  async getMyBusinesses(variables) {
    console.warn("⚠️ TEMPORARY MOCK ONLY: getMyBusinesses", variables);
    const userBusinesses = mockBusinesses.filter(
      (b) =>
        b.ownerId === variables.ownerId || variables.ownerId === "mock-user-id",
    );
    return { data: { businesses: userBusinesses } };
  },

  async getBusinessById(variables) {
    console.warn("⚠️ TEMPORARY MOCK ONLY: getBusinessById", variables);
    const business = mockBusinesses.find((b) => b.id === variables.id);
    return { data: { business: business || null } };
  },

  async createBusinessDraft(variables) {
    console.warn("⚠️ TEMPORARY MOCK ONLY: createBusinessDraft", variables);
    const newBusiness: BusinessListing = {
      ...variables,
      id: `b${Date.now()}`,
      status: "DRAFT" as BusinessStatus,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockBusinesses.push(newBusiness);
    return { data: { business_insert: newBusiness.id } };
  },

  async updateBusiness(variables) {
    console.warn("⚠️ TEMPORARY MOCK ONLY: updateBusiness", variables);
    const index = mockBusinesses.findIndex((b) => b.id === variables.id);
    if (index !== -1) {
      mockBusinesses[index] = {
        ...mockBusinesses[index],
        ...variables.data,
        updatedAt: new Date().toISOString(),
      };
      return { data: { business_update: mockBusinesses[index].id } };
    }
    throw new Error("Business not found");
  },

  async submitBusiness(variables) {
    console.warn("⚠️ TEMPORARY MOCK ONLY: submitBusiness", variables);
    const index = mockBusinesses.findIndex((b) => b.id === variables.id);
    if (index !== -1) {
      mockBusinesses[index].status = "PENDING";
      mockBusinesses[index].updatedAt = new Date().toISOString();
      return { data: { business_update: mockBusinesses[index].id } };
    }
    throw new Error("Business not found");
  },

  async getAllBusinesses(variables) {
    console.warn("⚠️ TEMPORARY MOCK ONLY: getAllBusinesses", variables);
    let filtered = [...mockBusinesses];
    if (variables?.status) {
      filtered = filtered.filter((b) => b.status === variables.status);
    }
    return { data: { businesses: filtered } };
  },

  async updateBusinessStatus(variables) {
    console.warn("⚠️ TEMPORARY MOCK ONLY: updateBusinessStatus", variables);
    const index = mockBusinesses.findIndex((b) => b.id === variables.id);
    if (index !== -1) {
      mockBusinesses[index].status = variables.status;
      if (variables.moderatorNotes !== undefined) {
        mockBusinesses[index].moderatorNotes = variables.moderatorNotes;
      }
      mockBusinesses[index].updatedAt = new Date().toISOString();
      return { data: { business_update: mockBusinesses[index].id } };
    }
    throw new Error("Business not found");
  },

  async searchApprovedBusinesses(variables) {
    console.warn("⚠️ TEMPORARY MOCK ONLY: searchApprovedBusinesses", variables);
    let results = mockBusinesses.filter((b) => b.status === "APPROVED");

    if (variables.q) {
      const q = variables.q.toLowerCase();
      results = results.filter(
        (b) =>
          b.name.toLowerCase().includes(q) ||
          b.description.toLowerCase().includes(q) ||
          (b.keywords || "").toLowerCase().includes(q) ||
          (b.cityName || "").toLowerCase().includes(q),
      );
    }
    if (variables.category) {
      results = results.filter(
        (b) =>
          b.categoryId === variables.category ||
          b.categoryName === variables.category,
      );
    }
    if (variables.city) {
      results = results.filter(
        (b) => b.cityId === variables.city || b.cityName === variables.city,
      );
    }
    if (variables.verifiedOnly) {
      results = results.filter((b) => b.isVerified);
    }
    if (variables.featuredOnly) {
      results = results.filter((b) => b.isFeatured);
    }

    results.sort((a, b) => {
      if (a.isFeatured && !b.isFeatured) return -1;
      if (!a.isFeatured && b.isFeatured) return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    const page = variables.page || 1;
    const limit = variables.limit || 12;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    return {
      data: {
        businesses: results.slice(startIndex, endIndex),
        total: results.length,
      },
    };
  },

  async getApprovedBusinessBySlug(variables) {
    console.warn(
      "⚠️ TEMPORARY MOCK ONLY: getApprovedBusinessBySlug",
      variables,
    );
    const business = mockBusinesses.find(
      (b) => b.slug === variables.slug && b.status === "APPROVED",
    );
    return { data: { business: business || null } };
  },

  async getFeaturedApprovedBusinesses() {
    console.warn("⚠️ TEMPORARY MOCK ONLY: getFeaturedApprovedBusinesses");
    const results = mockBusinesses.filter(
      (b) => b.status === "APPROVED" && b.isFeatured,
    );
    return { data: { businesses: results.slice(0, 4) } };
  },

  async getRecentlyApprovedBusinesses() {
    console.warn("⚠️ TEMPORARY MOCK ONLY: getRecentlyApprovedBusinesses");
    let results = mockBusinesses.filter((b) => b.status === "APPROVED");
    results.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
    return { data: { businesses: results.slice(0, 4) } };
  },

  // Metadata
  async getRegions() {
    return { data: { regions: mockRegions } };
  },
  async getProvinces(variables) {
    let filtered = mockProvinces;
    if (variables?.regionId) {
      filtered = filtered.filter((p) => p.regionId === variables.regionId);
    }
    return { data: { provinces: filtered } };
  },
  async getCities(variables) {
    let filtered = mockCities;
    if (variables?.provinceId) {
      filtered = filtered.filter((c) => c.provinceId === variables.provinceId);
    }
    return { data: { cities: filtered } };
  },
  async getCategories() {
    return { data: { categories: mockCategories } };
  },
  async getSubcategories(variables) {
    let filtered = mockSubcategories;
    if (variables?.categoryId) {
      filtered = filtered.filter((s) => s.categoryId === variables.categoryId);
    }
    return { data: { subcategories: filtered } };
  },

  async upsertRegion(variables) {
    const index = mockRegions.findIndex((r) => r.slug === variables.slug);
    if (index !== -1) {
      mockRegions[index].name = variables.name;
      return { data: { region_upsert: mockRegions[index].id } };
    }
    const newRegion = { id: `r${mockRegions.length + 1}`, ...variables };
    mockRegions.push(newRegion);
    return { data: { region_upsert: newRegion.id } };
  },
  async upsertProvince(variables) {
    const index = mockProvinces.findIndex((p) => p.slug === variables.slug);
    if (index !== -1) {
      mockProvinces[index].name = variables.name;
      mockProvinces[index].regionId = variables.regionId;
      return { data: { province_upsert: mockProvinces[index].id } };
    }
    const newProvince = { id: `p${mockProvinces.length + 1}`, ...variables };
    mockProvinces.push(newProvince);
    return { data: { province_upsert: newProvince.id } };
  },
  async upsertCity(variables) {
    const index = mockCities.findIndex((c) => c.slug === variables.slug);
    if (index !== -1) {
      mockCities[index].name = variables.name;
      mockCities[index].provinceId = variables.provinceId;
      return { data: { city_upsert: mockCities[index].id } };
    }
    const newCity = { id: `city${mockCities.length + 1}`, ...variables };
    mockCities.push(newCity);
    return { data: { city_upsert: newCity.id } };
  },
  async upsertCategory(variables) {
    const index = mockCategories.findIndex((c) => c.slug === variables.slug);
    if (index !== -1) {
      mockCategories[index].name = variables.name;
      return { data: { category_upsert: mockCategories[index].id } };
    }
    const newCategory = { id: `c${mockCategories.length + 1}`, ...variables };
    mockCategories.push(newCategory);
    return { data: { category_upsert: newCategory.id } };
  },
  async upsertSubcategory(variables) {
    const index = mockSubcategories.findIndex((s) => s.slug === variables.slug);
    if (index !== -1) {
      mockSubcategories[index].name = variables.name;
      mockSubcategories[index].categoryId = variables.categoryId;
      return { data: { subcategory_upsert: mockSubcategories[index].id } };
    }
    const newSubcategory = { id: `s${mockSubcategories.length + 1}`, ...variables };
    mockSubcategories.push(newSubcategory);
    return { data: { subcategory_upsert: newSubcategory.id } };
  },
};
