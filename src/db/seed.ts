import { db } from "./index";
import { regions, provinces, cities, categories } from "./schema";
import { eq } from "drizzle-orm";

async function seed() {
  console.log("🌱 Starting intelligent database seed...");

  try {
    // 1. Seed Regions
    console.log("Processing regions...");
    const regionData = [
      { name: "National Capital Region", slug: "ncr" },
      { name: "CALABARZON", slug: "calabarzon" },
    ];

    const regionMap: Record<string, string> = {};
    for (const r of regionData) {
      const existing = await db.query.regions.findFirst({
        where: eq(regions.slug, r.slug)
      });
      if (existing) {
        regionMap[r.slug] = existing.id;
        console.log(`- Region "${r.name}" already exists.`);
      } else {
        const [inserted] = await db.insert(regions).values(r).returning();
        regionMap[r.slug] = inserted.id;
        console.log(`+ Inserted region "${r.name}".`);
      }
    }

    // 2. Seed Provinces
    console.log("Processing provinces...");
    const provinceData = [
      { regionSlug: "ncr", name: "Metro Manila", slug: "metro-manila" },
      { regionSlug: "calabarzon", name: "Rizal", slug: "rizal" },
    ];

    const provinceMap: Record<string, string> = {};
    for (const p of provinceData) {
      const existing = await db.query.provinces.findFirst({
        where: eq(provinces.slug, p.slug)
      });
      if (existing) {
        provinceMap[p.slug] = existing.id;
        console.log(`- Province "${p.name}" already exists.`);
      } else {
        const [inserted] = await db.insert(provinces).values({
          name: p.name,
          slug: p.slug,
          regionId: regionMap[p.regionSlug]
        }).returning();
        provinceMap[p.slug] = inserted.id;
        console.log(`+ Inserted province "${p.name}".`);
      }
    }

    // 3. Seed Cities
    console.log("Processing cities...");
    const cityData = [
      { provinceSlug: "metro-manila", name: "Manila", slug: "manila" },
      { provinceSlug: "metro-manila", name: "Quezon City", slug: "quezon-city" },
      { provinceSlug: "metro-manila", name: "Makati", slug: "makati" },
      { provinceSlug: "rizal", name: "Antipolo", slug: "antipolo" },
    ];

    for (const c of cityData) {
      const existing = await db.query.cities.findFirst({
        where: eq(cities.slug, c.slug)
      });
      if (existing) {
        console.log(`- City "${c.name}" already exists.`);
      } else {
        await db.insert(cities).values({
          name: c.name,
          slug: c.slug,
          provinceId: provinceMap[c.provinceSlug]
        });
        console.log(`+ Inserted city "${c.name}".`);
      }
    }

    // 4. Seed Categories
    console.log("Processing categories...");
    const categoryData = [
      { name: "Food & Beverage", slug: "food-beverage" },
      { name: "Retail", slug: "retail" },
      { name: "Services", slug: "services" },
      { name: "Health & Wellness", slug: "health-wellness" },
    ];

    for (const cat of categoryData) {
      const existing = await db.query.categories.findFirst({
        where: eq(categories.slug, cat.slug)
      });
      if (existing) {
        console.log(`- Category "${cat.name}" already exists.`);
      } else {
        await db.insert(categories).values(cat);
        console.log(`+ Inserted category "${cat.name}".`);
      }
    }

    console.log("✨ Intelligent seeding completed successfully!");
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
}

seed();
