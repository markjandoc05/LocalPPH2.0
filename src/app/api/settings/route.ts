import { NextResponse } from "next/server";
import { getSettings } from "@/lib/settings/settings-service";
import { toPublicSettings } from "@/lib/settings/public-settings";

const publicSettingsHeaders = { 'Cache-Control': 'no-store' };

export async function GET() {
  try {
    const settings = await getSettings();
    return NextResponse.json(toPublicSettings(settings), { headers: publicSettingsHeaders });
  } catch (error) {
    console.error("GET settings error:", error);
    return NextResponse.json({ error: "Failed to load site configurations" }, { status: 500, headers: publicSettingsHeaders });
  }
}
