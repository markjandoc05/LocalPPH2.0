import { NextRequest, NextResponse } from "next/server";
import { getSettings, saveSettings } from "@/lib/settings/settings-service";
import { requireActiveAdmin } from '@/lib/auth/server-authorization';

const SMTP_PASSWORD_PLACEHOLDER = "********";

const redactSettings = (settings: any) => ({
  ...settings,
  smtp: settings?.smtp ? {
    ...settings.smtp,
    password: settings.smtp.password ? SMTP_PASSWORD_PLACEHOLDER : "",
    hasPassword: Boolean(settings.smtp.password),
  } : settings?.smtp,
});

export async function GET(req: NextRequest) {
  try {
    const authorization = await requireActiveAdmin(req);
    if (authorization.error) return authorization.error;

    const settings = await getSettings();
    return NextResponse.json(redactSettings(settings), { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    console.error("GET admin settings error:", error);
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500, headers: { 'Cache-Control': 'no-store' } });
  }
}

export async function POST(req: NextRequest) {
  try {
    const authorization = await requireActiveAdmin(req);
    if (authorization.error) return authorization.error;

    const body = await req.json();
    const currentSettings = await getSettings();
    const nextSettings = {
      ...body,
      smtp: {
        ...body.smtp,
        password:
          body.smtp?.password && body.smtp.password !== SMTP_PASSWORD_PLACEHOLDER
            ? body.smtp.password
            : currentSettings.smtp?.password || "",
      },
    };

    await saveSettings(nextSettings);
    return NextResponse.json({ success: true, settings: redactSettings(nextSettings) }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    console.error("POST admin settings error:", error);
    return NextResponse.json({ error: "Failed to save settings" }, { status: 500, headers: { 'Cache-Control': 'no-store' } });
  }
}
