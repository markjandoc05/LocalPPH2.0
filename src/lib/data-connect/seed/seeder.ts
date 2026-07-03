import { provider } from "../provider";
import { regions, provinces, cities } from "./locations";
import { categories } from "./categories";

export interface SeedingResult {
  success: boolean;
  message: string;
  details?: unknown;
}

export const seedMetadata = async (): Promise<SeedingResult> => {
  console.log("🚀 Starting metadata seeding...");
  
  try {
    // 1. Seed Regions
    console.log("📍 Seeding Regions...");
    const regionIdMap: Record<string, string> = {};
    for (const r of regions) {
      const res = await provider.upsertRegion({ name: r.name, slug: r.slug });
      regionIdMap[r.slug] = res.data.region_upsert;
    }
    
    // 2. Seed Provinces
    console.log("📍 Seeding Provinces...");
    const provinceIdMap: Record<string, string> = {};
    for (const p of provinces) {
      const regionId = regionIdMap[p.regionSlug];
      if (regionId) {
        const res = await provider.upsertProvince({ 
          name: p.name, 
          slug: p.slug, 
          regionId 
        });
        provinceIdMap[p.slug] = res.data.province_upsert;
      }
    }
    
    // 3. Seed Cities
    console.log("📍 Seeding Cities...");
    for (const c of cities) {
      const provinceId = provinceIdMap[c.provinceSlug];
      if (provinceId) {
        await provider.upsertCity({ 
          name: c.name, 
          slug: c.slug, 
          provinceId 
        });
      }
    }
    
    // 4. Seed Categories & Subcategories
    console.log("📂 Seeding Categories & Subcategories...");
    for (const cat of categories) {
      const catRes = await provider.upsertCategory({ 
        name: cat.name, 
        slug: cat.slug 
      });
      const categoryId = catRes.data.category_upsert;
      
      for (const sub of cat.subcategories) {
        await provider.upsertSubcategory({ 
          name: sub.name, 
          slug: sub.slug, 
          categoryId 
        });
      }
    }
    
    console.log("✅ Seeding completed successfully!");
    return {
      success: true,
      message: "Metadata seeding completed successfully.",
    };
  } catch (error: any) {
    console.error("❌ Seeding failed:", error);
    return {
      success: false,
      message: `Seeding failed: ${error.message}`,
      details: error,
    };
  }
};
