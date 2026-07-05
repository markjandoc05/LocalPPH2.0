import { NextRequest, NextResponse } from "next/server";
import { getAdminUser } from "@/lib/auth/admin";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { eq, ilike, or, asc } from "drizzle-orm";

function slugify(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ table: string }> }) {
  const admin = await getAdminUser();
  if (!admin || admin.role !== 'ADMIN') return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const { action, data } = await req.json();
  const { table } = await params;
  const tableKey = table as keyof typeof schema;
  const dbTable = schema[tableKey] as any;

  if (!dbTable) return NextResponse.json({ error: "Invalid table" }, { status: 400 });

  try {
    if (action === 'list') {
      let query = db.select().from(dbTable).orderBy(asc(dbTable.name));
      
      // Add joins based on table
      if (table === 'subcategories') {
          query = db.select({
              id: schema.subcategories.id,
              name: schema.subcategories.name,
              slug: schema.subcategories.slug,
              status: schema.subcategories.status,
              categoryName: schema.categories.name
          }).from(schema.subcategories).leftJoin(schema.categories, eq(schema.subcategories.categoryId, schema.categories.id)) as any;
      } else if (table === 'provinces') {
          query = db.select({
              id: schema.provinces.id,
              name: schema.provinces.name,
              slug: schema.provinces.slug,
              status: schema.provinces.status,
              regionName: schema.regions.name
          }).from(schema.provinces).leftJoin(schema.regions, eq(schema.provinces.regionId, schema.regions.id)) as any;
      } else if (table === 'cities') {
        query = db.select({
            id: schema.cities.id,
            name: schema.cities.name,
            slug: schema.cities.slug,
            provinceName: schema.provinces.name,
            regionName: schema.regions.name
        }).from(schema.cities)
        .leftJoin(schema.provinces, eq(schema.cities.provinceId, schema.provinces.id))
        .leftJoin(schema.regions, eq(schema.provinces.regionId, schema.regions.id)) as any;
      } else {
        query = (query as any).orderBy(asc(dbTable.name));
      }

      const results = await query;
      return NextResponse.json(results);
    } else if (action === 'options') {
        const results = await db.select({ id: dbTable.id, name: dbTable.name }).from(dbTable).where(eq(dbTable.status, true));
        return NextResponse.json(results);
    } else if (action === 'create') {
      const slug = data.slug || slugify(data.name);
      await db.insert(dbTable).values({ ...data, slug });
      return NextResponse.json({ success: true });
    } else if (action === 'update') {
      const { id, ...updateData } = data;
      await db.update(dbTable).set(updateData).where(eq(dbTable.id, id));
      return NextResponse.json({ success: true });
    } else if (action === 'toggle-status') {
      const { id, status } = data;
      await db.update(dbTable).set({ status }).where(eq(dbTable.id, id));
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
