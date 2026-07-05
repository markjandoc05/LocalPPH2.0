import { DataProvider } from "./types";
import { db } from "../../db/index";
import { 
  users, 
  businesses, 
  categories, 
  subcategories, 
  regions, 
  provinces, 
  cities, 
} from "../../db/schema";
import { eq, and, or, ilike, sql, desc } from "drizzle-orm";
import { BusinessListing } from "@/types/business";

export const databaseProvider: DataProvider = {
  async createUser(variables) {
    const res = await db.insert(users)
      .values({
        id: variables.id,
        email: variables.email,
        displayName: variables.displayName,
        photoUrl: variables.photoUrl,
        role: variables.role as any,
      })
      .onConflictDoUpdate({
        target: users.id,
        set: {
          email: variables.email,
          displayName: variables.displayName,
          photoUrl: variables.photoUrl,
          updatedAt: new Date(),
        }
      })
      .returning({ id: users.id });
    
    return { data: { user_insert: res[0].id } };
  },

  async getUserById(variables) {
    const res = await db.query.users.findFirst({
      where: eq(users.id, variables.id),
    });
    return { data: { user: res || null } };
  },

  async updateUser(variables) {
    try {
      const data = variables.data;
      const setFields: any = {
        updatedAt: new Date(),
      };
      
      const allowedFields = [
        'firstName', 'lastName', 'displayName', 'photoUrl', 'mobileNumber',
        'telephoneNumber', 'dateOfBirth', 'gender', 'addressLine1',
        'addressLine2', 'barangay', 'city', 'province', 'region',
        'zipCode', 'country'
      ];
      
      for (const field of allowedFields) {
        if (field in data) {
          setFields[field] = data[field];
        }
      }

      console.log("Updating user:", variables.id, "Set fields:", setFields);
      const res = await db.update(users)
        .set(setFields)
        .where(eq(users.id, variables.id))
        .returning({ id: users.id });
      
      return {
        data: { user_update: res[0]?.id || variables.id },
      };
    } catch (error) {
      console.error("Database update error:", error);
      throw error;
    }
  },

  async getAllUsers() {
    const res = await db.query.users.findMany();
    return { data: { users: res } };
  },

  async getMyBusinesses(variables) {
    const res = await db.query.businesses.findMany({
      where: eq(businesses.ownerId, variables.ownerId),
      with: {
        owner: true,
        category: true,
        subcategory: true,
        city: true,
        province: true,
        region: true,
      }
    });
    
    const formatted = res.map(b => ({
      ...b,
      ownerName: b.owner?.displayName || b.owner?.email || "Not assigned",
      categoryName: b.category?.name || "Not assigned",
      subcategoryName: b.subcategory?.name || "Not assigned",
      cityName: b.city?.name || "Not assigned",
      provinceName: b.province?.name || "Not assigned",
      regionName: b.region?.name || "Not assigned",
      createdAt: b.createdAt.toISOString(),
      updatedAt: b.updatedAt.toISOString(),
    })) as unknown as BusinessListing[];

    return { data: { businesses: formatted } };
  },

  async getBusinessById(variables) {
    const res = await db.query.businesses.findFirst({
      where: eq(businesses.id, variables.id),
      with: {
        owner: true,
        category: true,
        subcategory: true,
        city: true,
        province: true,
        region: true,
      }
    });
    
    if (!res) return { data: { business: null } };

    const formatted = {
      ...res,
      ownerName: res.owner?.displayName || res.owner?.email || "Not assigned",
      categoryName: res.category?.name || "Not assigned",
      subcategoryName: res.subcategory?.name || "Not assigned",
      cityName: res.city?.name || "Not assigned",
      provinceName: res.province?.name || "Not assigned",
      regionName: res.region?.name || "Not assigned",
      createdAt: res.createdAt.toISOString(),
      updatedAt: res.updatedAt.toISOString(),
    } as unknown as BusinessListing;

    return { data: { business: formatted } };
  },

  async createBusinessDraft(variables) {
    const id = variables.id || crypto.randomUUID();
    const res = await db.insert(businesses)
      .values({
        ...variables,
        id,
        status: 'DRAFT',
      })
      .returning({ id: businesses.id });
    
    return { data: { business_insert: res[0].id } };
  },

  async updateBusiness(variables) {
    const res = await db.update(businesses)
      .set({
        ...variables.data,
        updatedAt: new Date(),
      })
      .where(eq(businesses.id, variables.id))
      .returning({ id: businesses.id });
    
    return {
      data: { business_update: res[0]?.id || variables.id },
    };
  },

  async submitBusiness(variables) {
    const res = await db.update(businesses)
      .set({
        status: 'PENDING',
        updatedAt: new Date(),
      })
      .where(eq(businesses.id, variables.id))
      .returning({ id: businesses.id });
    
    return {
      data: { business_update: res[0]?.id || variables.id },
    };
  },

  async getAllBusinesses(variables) {
    const whereClause = variables?.status ? eq(businesses.status, variables.status) : undefined;
    const res = await db.query.businesses.findMany({
      where: whereClause,
      with: {
        owner: true,
        category: true,
        subcategory: true,
        city: true,
        province: true,
        region: true,
      }
    });
    
    const formatted = res.map(b => ({
      ...b,
      ownerName: b.owner?.displayName || b.owner?.email || "Not assigned",
      categoryName: b.category?.name || "Not assigned",
      subcategoryName: b.subcategory?.name || "Not assigned",
      cityName: b.city?.name || "Not assigned",
      provinceName: b.province?.name || "Not assigned",
      regionName: b.region?.name || "Not assigned",
      createdAt: b.createdAt.toISOString(),
      updatedAt: b.updatedAt.toISOString(),
    })) as unknown as BusinessListing[];

    return { data: { businesses: formatted } };
  },

  async updateBusinessStatus(variables) {
    const res = await db.update(businesses)
      .set({
        status: variables.status,
        moderatorNotes: variables.moderatorNotes,
        updatedAt: new Date(),
      })
      .where(eq(businesses.id, variables.id))
      .returning({ id: businesses.id });
    
    return {
      data: {
        business_update: res[0]?.id || variables.id,
      },
    };
  },

  async searchApprovedBusinesses(variables) {
    const limit = variables.limit || 20;
    const offset = variables.offset || 0;
    
    const where = [eq(businesses.status, 'APPROVED')];
    
    if (variables.q) {
      where.push(or(
        ilike(businesses.name, `%${variables.q}%`),
        ilike(businesses.description, `%${variables.q}%`),
        ilike(businesses.keywords, `%${variables.q}%`)
      ) as any);
    }
    
    if (variables.categoryId) where.push(eq(businesses.categoryId, variables.categoryId));
    if (variables.regionId) where.push(eq(businesses.regionId, variables.regionId));
    if (variables.provinceId) where.push(eq(businesses.provinceId, variables.provinceId));
    if (variables.cityId) where.push(eq(businesses.cityId, variables.cityId));
    if (variables.featuredOnly) where.push(eq(businesses.isFeatured, true));

    const res = await db.query.businesses.findMany({
      where: and(...where),
      limit,
      offset,
      orderBy: [desc(businesses.createdAt)],
      with: {
        owner: true,
        category: true,
        subcategory: true,
        city: true,
        province: true,
        region: true,
      }
    });
    
    const countRes = await db.select({ count: sql<number>`count(*)` }).from(businesses).where(and(...where));
    
    const formatted = res.map(b => ({
      ...b,
      ownerName: b.owner?.displayName || b.owner?.email || "Not assigned",
      categoryName: b.category?.name || "Not assigned",
      subcategoryName: b.subcategory?.name || "Not assigned",
      cityName: b.city?.name || "Not assigned",
      provinceName: b.province?.name || "Not assigned",
      regionName: b.region?.name || "Not assigned",
      createdAt: b.createdAt.toISOString(),
      updatedAt: b.updatedAt.toISOString(),
    })) as unknown as BusinessListing[];

    return {
      data: {
        businesses: formatted,
        total: Number(countRes[0].count),
      },
    };
  },

  async getApprovedBusinessBySlug(variables) {
    const res = await db.query.businesses.findFirst({
      where: and(eq(businesses.slug, variables.slug), eq(businesses.status, 'APPROVED')),
      with: {
        owner: true,
        category: true,
        subcategory: true,
        city: true,
        province: true,
        region: true,
      }
    });
    
    if (!res) return { data: { business: null } };

    const formatted = {
      ...res,
      ownerName: res.owner?.displayName || res.owner?.email || "Not assigned",
      categoryName: res.category?.name || "Not assigned",
      subcategoryName: res.subcategory?.name || "Not assigned",
      cityName: res.city?.name || "Not assigned",
      provinceName: res.province?.name || "Not assigned",
      regionName: res.region?.name || "Not assigned",
      createdAt: res.createdAt.toISOString(),
      updatedAt: res.updatedAt.toISOString(),
    } as unknown as BusinessListing;

    return { data: { business: formatted } };
  },

  async getFeaturedApprovedBusinesses() {
    const res = await db.query.businesses.findMany({
      where: and(eq(businesses.isFeatured, true), eq(businesses.status, 'APPROVED')),
      limit: 6,
      with: {
        owner: true,
        category: true,
        subcategory: true,
        city: true,
        province: true,
        region: true,
      }
    });
    
    const formatted = res.map(b => ({
      ...b,
      ownerName: b.owner?.displayName || b.owner?.email || "Not assigned",
      categoryName: b.category?.name || "Not assigned",
      subcategoryName: b.subcategory?.name || "Not assigned",
      cityName: b.city?.name || "Not assigned",
      provinceName: b.province?.name || "Not assigned",
      regionName: b.region?.name || "Not assigned",
      createdAt: b.createdAt.toISOString(),
      updatedAt: b.updatedAt.toISOString(),
    })) as unknown as BusinessListing[];

    return { data: { businesses: formatted } };
  },

  async getRecentlyApprovedBusinesses() {
    const res = await db.query.businesses.findMany({
      where: eq(businesses.status, 'APPROVED'),
      limit: 6,
      orderBy: [desc(businesses.createdAt)],
      with: {
        owner: true,
        category: true,
        subcategory: true,
        city: true,
        province: true,
        region: true,
      }
    });
    
    const formatted = res.map(b => ({
      ...b,
      ownerName: b.owner?.displayName || b.owner?.email || "Not assigned",
      categoryName: b.category?.name || "Not assigned",
      subcategoryName: b.subcategory?.name || "Not assigned",
      cityName: b.city?.name || "Not assigned",
      provinceName: b.province?.name || "Not assigned",
      regionName: b.region?.name || "Not assigned",
      createdAt: b.createdAt.toISOString(),
      updatedAt: b.updatedAt.toISOString(),
    })) as unknown as BusinessListing[];

    return { data: { businesses: formatted } };
  },

  // Metadata operations
  async getRegions() {
    const res = await db.query.regions.findMany();
    return { data: { regions: res } };
  },
  async getProvinces(variables) {
    const where = variables?.regionId ? eq(provinces.regionId, variables.regionId) : undefined;
    const res = await db.query.provinces.findMany({ where });
    return { data: { provinces: res } };
  },
  async getCities(variables) {
    const where = variables?.provinceId ? eq(cities.provinceId, variables.provinceId) : undefined;
    const res = await db.query.cities.findMany({ where });
    return { data: { cities: res } };
  },
  async getCategories() {
    const res = await db.query.categories.findMany();
    return { data: { categories: res } };
  },
  async getSubcategories(variables) {
    const where = variables?.categoryId ? eq(subcategories.categoryId, variables.categoryId) : undefined;
    const res = await db.query.subcategories.findMany({ where });
    return { data: { subcategories: res } };
  },

  async upsertRegion(variables) {
    const res = await db.insert(regions)
      .values({
        name: variables.name,
        slug: variables.slug,
      })
      .onConflictDoUpdate({
        target: regions.slug,
        set: { name: variables.name }
      })
      .returning({ id: regions.id });
    return { data: { region_upsert: res[0].id } };
  },
  async upsertProvince(variables) {
    const res = await db.insert(provinces)
      .values({
        name: variables.name,
        slug: variables.slug,
        regionId: variables.regionId,
      })
      .onConflictDoUpdate({
        target: provinces.slug,
        set: { name: variables.name, regionId: variables.regionId }
      })
      .returning({ id: provinces.id });
    return { data: { province_upsert: res[0].id } };
  },
  async upsertCity(variables) {
    const res = await db.insert(cities)
      .values({
        name: variables.name,
        slug: variables.slug,
        provinceId: variables.provinceId,
      })
      .onConflictDoUpdate({
        target: cities.slug,
        set: { name: variables.name, provinceId: variables.provinceId }
      })
      .returning({ id: cities.id });
    return { data: { city_upsert: res[0].id } };
  },
  async upsertCategory(variables) {
    const res = await db.insert(categories)
      .values({
        name: variables.name,
        slug: variables.slug,
      })
      .onConflictDoUpdate({
        target: categories.slug,
        set: { name: variables.name }
      })
      .returning({ id: categories.id });
    return { data: { category_upsert: res[0].id } };
  },
  async upsertSubcategory(variables) {
    const res = await db.insert(subcategories)
      .values({
        name: variables.name,
        slug: variables.slug,
        categoryId: variables.categoryId,
      })
      .onConflictDoUpdate({
        target: subcategories.slug,
        set: { name: variables.name, categoryId: variables.categoryId }
      })
      .returning({ id: subcategories.id });
    return { data: { subcategory_upsert: res[0].id } };
  },
};
