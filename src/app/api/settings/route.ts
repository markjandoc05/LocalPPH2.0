import { NextResponse } from "next/server";
import { getSettings } from "@/lib/settings/settings-service";

export async function GET() {
  try {
    const settings = await getSettings();
    return NextResponse.json(settings);
  } catch (error: any) {
    console.error("GET settings error:", error);
    return NextResponse.json({ error: "Failed to load site configurations" }, { status: 500 });
  }
}
