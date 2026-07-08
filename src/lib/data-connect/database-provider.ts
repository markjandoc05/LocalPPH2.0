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
import { eq, and, or, ilike, sql, desc, asc, inArray } from "drizzle-orm";
import { BusinessListing } from "@/types/business";

const formatBusinessRow = (b: any): BusinessListing => {
  if (!b) return b;
  let parsedDocuments = [];
  if (b.documents) {
    try {
      parsedDocuments = typeof b.documents === 'string' ? JSON.parse(b.documents) : b.documents;
    } catch (e) {
      console.error("Error parsing business documents JSON:", e);
    }
  }
  let parsedGallery = [];
  if (b.gallery) {
    try {
      parsedGallery = typeof b.gallery === 'string' ? JSON.parse(b.gallery) : b.gallery;
    } catch (e) {
      console.error("Error parsing business gallery JSON:", e);
    }
  }
  return {
    ...b,
    ownerName: b.owner?.displayName || b.owner?.email || "Not assigned",
    categoryName: b.category?.name || "Not assigned",
    categorySlug: b.category?.slug || undefined,
    subcategoryName: b.subcategory?.name || "Not assigned",
    subcategorySlug: b.subcategory?.slug || undefined,
    cityName: b.city?.name || "Not assigned",
    citySlug: b.city?.slug || undefined,
    provinceName: b.province?.name || "Not assigned",
    provinceSlug: b.province?.slug || undefined,
    regionName: b.region?.name || "Not assigned",
    regionSlug: b.region?.slug || undefined,
    documents: parsedDocuments,
    gallery: parsedGallery,
    createdAt: b.createdAt instanceof Date ? b.createdAt.toISOString() : (b.createdAt || new Date().toISOString()),
    updatedAt: b.updatedAt instanceof Date ? b.updatedAt.toISOString() : (b.updatedAt || new Date().toISOString()),
  } as unknown as BusinessListing;
};

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
    
    const formatted = res.map(formatBusinessRow);
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
    return { data: { business: formatBusinessRow(res) } };
  },

  async createBusinessDraft(variables) {
    const id = variables.id || crypto.randomUUID();
    const insertData = { ...variables };
    if (insertData.documents !== undefined) {
      insertData.documents = insertData.documents ? (typeof insertData.documents === 'string' ? insertData.documents : JSON.stringify(insertData.documents)) : null;
    }
    if (insertData.gallery !== undefined) {
      insertData.gallery = insertData.gallery ? (typeof insertData.gallery === 'string' ? insertData.gallery : JSON.stringify(insertData.gallery)) : null;
    }
    const res = await db.insert(businesses)
      .values({
        ...insertData,
        id,
        status: 'DRAFT',
      })
      .returning({ id: businesses.id });
    
    return { data: { business_insert: res[0].id } };
  },

  async updateBusiness(variables) {
    const updateData = { ...variables.data };
    if (updateData.documents !== undefined) {
      updateData.documents = updateData.documents ? (typeof updateData.documents === 'string' ? updateData.documents : JSON.stringify(updateData.documents)) : null;
    }
    if (updateData.gallery !== undefined) {
      updateData.gallery = updateData.gallery ? (typeof updateData.gallery === 'string' ? updateData.gallery : JSON.stringify(updateData.gallery)) : null;
    }

    const allowedColumns = [
      'categoryId', 'subcategoryId', 'regionId', 'provinceId', 'cityId',
      'name', 'description', 'address', 'contactNumber', 'email',
      'websiteUrl', 'logoUrl', 'coverUrl', 'gallery', 'documents',
      'facebookUrl', 'instagramUrl', 'tiktokUrl', 'shopeeUrl', 'lazadaUrl',
      'status', 'slug', 'isFeatured', 'keywords', 'moderatorNotes'
    ];

    const filteredData: any = {};
    for (const key of allowedColumns) {
      if (key in updateData) {
        filteredData[key] = updateData[key];
      }
    }

    const res = await db.update(businesses)
      .set({
        ...filteredData,
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
    
    const formatted = res.map(formatBusinessRow);
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
    const page = variables.page || 1;
    const offset = (page - 1) * limit;
    
    const baseWhere = [eq(businesses.status, 'APPROVED')];
    
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

    if (variables.categoryId) {
      if (uuidRegex.test(variables.categoryId)) {
        baseWhere.push(eq(businesses.categoryId, variables.categoryId));
      } else {
        baseWhere.push(or(eq(categories.slug, variables.categoryId), eq(subcategories.slug, variables.categoryId)) as any);
      }
    }
    if (variables.regionId) {
      if (uuidRegex.test(variables.regionId)) {
        baseWhere.push(eq(businesses.regionId, variables.regionId));
      } else {
        baseWhere.push(eq(regions.slug, variables.regionId));
      }
    }
    if (variables.provinceId) {
      if (uuidRegex.test(variables.provinceId)) {
        baseWhere.push(eq(businesses.provinceId, variables.provinceId));
      } else {
        baseWhere.push(eq(provinces.slug, variables.provinceId));
      }
    }
    if (variables.cityId) {
      if (uuidRegex.test(variables.cityId)) {
        baseWhere.push(eq(businesses.cityId, variables.cityId));
      } else {
        baseWhere.push(eq(cities.slug, variables.cityId));
      }
    }
    if (variables.featuredOnly) baseWhere.push(eq(businesses.isFeatured, true));
    if (variables.verifiedOnly) baseWhere.push(eq(businesses.isVerified, true));

    // For keyword search across joined tables, we need to join
    const query = db.select({
      id: businesses.id,
    })
    .from(businesses)
    .leftJoin(categories, eq(businesses.categoryId, categories.id))
    .leftJoin(subcategories, eq(businesses.subcategoryId, subcategories.id))
    .leftJoin(regions, eq(businesses.regionId, regions.id))
    .leftJoin(provinces, eq(businesses.provinceId, provinces.id))
    .leftJoin(cities, eq(businesses.cityId, cities.id));

    const searchFilters = [...baseWhere];
    if (variables.q) {
      const words = variables.q.split(/\s+/).filter(Boolean);
      for (const word of words) {
        searchFilters.push(or(
          ilike(businesses.name, `%${word}%`),
          ilike(businesses.description, `%${word}%`),
          ilike(businesses.keywords, `%${word}%`),
          sql`COALESCE(${categories.name}, '') ILIKE ${'%' + word + '%'}`,
          sql`COALESCE(${subcategories.name}, '') ILIKE ${'%' + word + '%'}`,
          sql`COALESCE(${regions.name}, '') ILIKE ${'%' + word + '%'}`,
          sql`COALESCE(${provinces.name}, '') ILIKE ${'%' + word + '%'}`,
          sql`COALESCE(${cities.name}, '') ILIKE ${'%' + word + '%'}`
        ) as any);
      }
    }

    let orderByList: any[] = [desc(businesses.createdAt)];
    if (variables.sort === 'featured') {
      orderByList = [desc(businesses.isFeatured), desc(businesses.createdAt)];
    } else if (variables.sort === 'verified') {
      orderByList = [desc(businesses.isVerified), desc(businesses.createdAt)];
    } else if (variables.sort === 'name') {
      orderByList = [asc(businesses.name), desc(businesses.createdAt)];
    }

    const businessIds = searchFilters.length > 0
      ? await query.where(and(...searchFilters)).orderBy(...orderByList)
      : await query.orderBy(...orderByList);
    const ids = businessIds.map(b => b.id);

    if (ids.length === 0) {
      return {
        data: {
          businesses: [],
          total: 0,
        },
      };
    }

    const paginatedIds = ids.slice(offset, offset + limit);
    if (paginatedIds.length === 0) {
      return {
        data: {
          businesses: [],
          total: ids.length,
        },
      };
    }

    const res = await db.query.businesses.findMany({
      where: inArray(businesses.id, paginatedIds),
      orderBy: orderByList,
      with: {
        owner: true,
        category: true,
        subcategory: true,
        city: true,
        province: true,
        region: true,
      }
    });
    
    const formatted = res.map(formatBusinessRow);

    return {
      data: {
        businesses: formatted,
        total: ids.length,
      },
    };
  },

  async getSearchSuggestions(variables) {
    const q = variables.q;
    if (!q || q.length < 2) return { data: { suggestions: [] } };

    const searchPattern = `%${q}%`;

    const res = await db.select({
      id: businesses.id,
      name: businesses.name,
      slug: businesses.slug,
      categoryName: categories.name,
      cityName: cities.name,
      provinceName: provinces.name,
    })
    .from(businesses)
    .leftJoin(categories, eq(businesses.categoryId, categories.id))
    .leftJoin(cities, eq(businesses.cityId, cities.id))
    .leftJoin(provinces, eq(businesses.provinceId, provinces.id))
    .where(or(
      ilike(businesses.name, searchPattern),
      ilike(categories.name, searchPattern),
      ilike(cities.name, searchPattern),
      ilike(provinces.name, searchPattern),
      ilike(businesses.keywords, searchPattern)
    ))
    .limit(10);

    const suggestions = res.map(r => ({
      id: r.id,
      slug: r.slug,
      text: r.name,
      subtext: `${r.categoryName} • ${r.cityName}, ${r.provinceName}`,
      type: 'business'
    }));

    return { data: { suggestions } };
  },

  async getApprovedBusinessBySlug(variables) {
    const res = await db.query.businesses.findFirst({
      where: eq(businesses.slug, variables.slug),
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
    return { data: { business: formatBusinessRow(res) } };
  },

  async getFeaturedApprovedBusinesses() {
    const res = await db.query.businesses.findMany({
      where: eq(businesses.isFeatured, true),
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
    
    const formatted = res.map(formatBusinessRow);
    return { data: { businesses: formatted } };
  },

  async getRecentlyApprovedBusinesses() {
    const res = await db.query.businesses.findMany({
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
    
    const formatted = res.map(formatBusinessRow);
    return { data: { businesses: formatted } };
  },

  // Metadata operations
  async getRegions() {
    const res = await db.query.regions.findMany();
    return { data: { regions: res } };
  },
  async getProvinces(variables) {
    let where;
    if (variables?.regionId) {
      if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(variables.regionId)) {
        where = eq(provinces.regionId, variables.regionId);
      } else {
        const r = await db.query.regions.findFirst({ where: eq(regions.slug, variables.regionId) });
        if (r) {
          where = eq(provinces.regionId, r.id);
        } else {
          return { data: { provinces: [] } };
        }
      }
    }
    const res = await db.query.provinces.findMany({ where });
    return { data: { provinces: res } };
  },
  async getCities(variables) {
    let where;
    if (variables?.provinceId) {
      if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(variables.provinceId)) {
        where = eq(cities.provinceId, variables.provinceId);
      } else {
        const p = await db.query.provinces.findFirst({ where: eq(provinces.slug, variables.provinceId) });
        if (p) {
          where = eq(cities.provinceId, p.id);
        } else {
          return { data: { cities: [] } };
        }
      }
    }
    const res = await db.query.cities.findMany({ where });
    return { data: { cities: res } };
  },
  async getCategories() {
    const res = await db.query.categories.findMany();
    return { data: { categories: res } };
  },
  async getSubcategories(variables) {
    let where;
    if (variables?.categoryId) {
      if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(variables.categoryId)) {
        where = eq(subcategories.categoryId, variables.categoryId);
      } else {
        const c = await db.query.categories.findFirst({ where: eq(categories.slug, variables.categoryId) });
        if (c) {
          where = eq(subcategories.categoryId, c.id);
        } else {
          return { data: { subcategories: [] } };
        }
      }
    }
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
