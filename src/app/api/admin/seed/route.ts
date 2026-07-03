import { NextResponse } from "next/server";
import { seedMetadata } from "@/lib/data-connect/seed/seeder";

export async function POST() {
  try {
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
