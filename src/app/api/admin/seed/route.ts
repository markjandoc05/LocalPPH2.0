import { NextRequest, NextResponse } from "next/server";
import { getAdminUser } from "@/lib/auth/admin";
import { seedMetadata } from "@/lib/data-connect/seed/seeder";

export async function POST(req: NextRequest) {
  try {
    const admin = await getAdminUser();
    if (!admin || admin.role !== 'ADMIN') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const result = await seedMetadata();
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Seed API Error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
