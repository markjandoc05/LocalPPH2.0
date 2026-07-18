import { NextResponse } from "next/server";
import { getSettings } from "@/lib/settings/settings-service";

const toPublicSettings = (settings: Awaited<ReturnType<typeof getSettings>>) => {
  const publicSettings = { ...settings };
  delete (publicSettings as Partial<typeof settings>).emailTemplates;
  return publicSettings;
};

export async function GET() {
  try {
    const settings = await getSettings();
    return NextResponse.json(toPublicSettings(settings));
  } catch (error: any) {
    console.error("GET settings error:", error);
    return NextResponse.json({ error: "Failed to load site configurations" }, { status: 500 });
  }
}
