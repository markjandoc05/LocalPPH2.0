import { NextRequest, NextResponse } from "next/server";
import { getAdminUser } from "@/lib/auth/admin";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { eq } from "drizzle-orm";

function slugify(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
}

export async function POST(req: NextRequest) {
  const admin = await getAdminUser();
  if (!admin || admin.role !== 'ADMIN') {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { type, data } = await req.json();
  console.log("Import type:", type, "Data length:", data?.length);
  if (!Array.isArray(data)) return NextResponse.json({ error: "Invalid data format" }, { status: 400 });

  let created = 0, updated = 0, skipped = 0, errors = 0;
  let lastError = null;

  for (const row of data) {
    try {
      if (type === 'categories') {
        const { name, description } = row;
        if (!name) throw new Error("Missing name");
        const slug = row.slug || slugify(name);
        const [existing] = await db.select().from(schema.categories).where(eq(schema.categories.slug, slug));
        if (existing) {
          await db.update(schema.categories).set({ name, description }).where(eq(schema.categories.slug, slug));
          updated++;
        } else {
          await db.insert(schema.categories).values({ name, slug, description });
          created++;
        }
      } else if (type === 'subcategories') {
        const { name, categorySlug } = row;
        if (!name || !categorySlug) throw new Error("Missing name or categorySlug");
        const [category] = await db.select().from(schema.categories).where(eq(schema.categories.slug, categorySlug));
        if (!category) throw new Error(`Category not found: ${categorySlug}`);
        const slug = row.slug || slugify(name);
        const [existing] = await db.select().from(schema.subcategories).where(eq(schema.subcategories.slug, slug));
        if (existing) {
          await db.update(schema.subcategories).set({ name, categoryId: category.id }).where(eq(schema.subcategories.slug, slug));
          updated++;
        } else {
          await db.insert(schema.subcategories).values({ name, slug, categoryId: category.id });
          created++;
        }
      } else if (type === 'regions') {
        const { name } = row;
        if (!name) throw new Error("Missing name");
        const slug = row.slug || slugify(name);
        const [existing] = await db.select().from(schema.regions).where(eq(schema.regions.slug, slug));
        if (existing) {
          await db.update(schema.regions).set({ name }).where(eq(schema.regions.slug, slug));
          updated++;
        } else {
          await db.insert(schema.regions).values({ name, slug });
          created++;
        }
      } else if (type === 'provinces') {
        const { name, regionSlug } = row;
        if (!name || !regionSlug) throw new Error("Missing name or regionSlug");
        const [region] = await db.select().from(schema.regions).where(eq(schema.regions.slug, regionSlug));
        if (!region) throw new Error(`Region not found: ${regionSlug}`);
        const slug = row.slug || slugify(name);
        const [existing] = await db.select().from(schema.provinces).where(eq(schema.provinces.slug, slug));
        if (existing) {
          await db.update(schema.provinces).set({ name, regionId: region.id }).where(eq(schema.provinces.slug, slug));
          updated++;
        } else {
          await db.insert(schema.provinces).values({ name, slug, regionId: region.id });
          created++;
        }
      } else if (type === 'cities') {
        const { name, provinceSlug } = row;
        if (!name || !provinceSlug) throw new Error("Missing name or provinceSlug");
        const [province] = await db.select().from(schema.provinces).where(eq(schema.provinces.slug, provinceSlug));
        if (!province) throw new Error(`Province not found: ${provinceSlug}`);
        const slug = row.slug || slugify(name);
        const [existing] = await db.select().from(schema.cities).where(eq(schema.cities.slug, slug));
        if (existing) {
          await db.update(schema.cities).set({ name, provinceId: province.id }).where(eq(schema.cities.slug, slug));
          updated++;
        } else {
          await db.insert(schema.cities).values({ name, slug, provinceId: province.id });
          created++;
        }
      } else {
        throw new Error("Invalid import type");
      }
    } catch (e: any) {
      console.error(e);
      errors++;
      lastError = e.message;
    }
  }

  return NextResponse.json({ message: "Import processed", summary: { created, updated, skipped, errors }, lastError });
}
