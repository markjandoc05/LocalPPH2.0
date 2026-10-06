import { NextRequest, NextResponse } from "next/server";
import { requireActiveAdmin } from '@/lib/auth/server-authorization';
import { seedMetadata } from "@/lib/data-connect/seed/seeder";

export async function POST(req: NextRequest) {
  try {
    const authorization = await requireActiveAdmin(req);
    if (authorization.error) return authorization.error;

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
