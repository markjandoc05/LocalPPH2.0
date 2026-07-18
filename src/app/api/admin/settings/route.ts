import { NextRequest, NextResponse } from "next/server";
import { getSettings, saveSettings } from "@/lib/settings/settings-service";
import { adminAuth } from "@/lib/firebase-admin";
import { databaseProvider } from "@/lib/data-connect/database-provider";
import { isAdmin } from "@/lib/auth/roles";

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
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const token = authHeader.split(" ")[1];
    
    let decodedToken;
    try {
      decodedToken = await adminAuth.verifyIdToken(token);
    } catch (authError) {
      console.warn("Token verification failed in GET settings:", authError);
      return NextResponse.json({ error: "Unauthorized. Invalid or expired token." }, { status: 401 });
    }

    const userId = decodedToken.uid;
    const userRes = await databaseProvider.getUserById({ id: userId });
    const role = userRes?.data?.user?.role || null;

    if (!isAdmin(role)) {
      return NextResponse.json({ error: "Access denied. Administrator privileges required." }, { status: 403 });
    }

    const settings = await getSettings();
    return NextResponse.json(redactSettings(settings));
  } catch (error: any) {
    console.error("GET admin settings error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch settings" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const token = authHeader.split(" ")[1];
    
    let decodedToken;
    try {
      decodedToken = await adminAuth.verifyIdToken(token);
    } catch (authError) {
      console.warn("Token verification failed in POST settings:", authError);
      return NextResponse.json({ error: "Unauthorized. Invalid or expired token." }, { status: 401 });
    }

    const userId = decodedToken.uid;
    const userRes = await databaseProvider.getUserById({ id: userId });
    const role = userRes?.data?.user?.role || null;

    if (!isAdmin(role)) {
      return NextResponse.json({ error: "Access denied. Administrator privileges required." }, { status: 403 });
    }

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
    return NextResponse.json({ success: true, settings: redactSettings(nextSettings) });
  } catch (error: any) {
    console.error("POST admin settings error:", error);
    return NextResponse.json({ error: error.message || "Failed to save settings" }, { status: 500 });
  }
}
