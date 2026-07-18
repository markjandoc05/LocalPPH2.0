import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase-admin";
import { isAdmin } from "@/lib/auth/roles";
import { databaseProvider } from "@/lib/data-connect/database-provider";
import { getSmtpDiagnostics, sendEmailNotification } from "@/lib/email/notifications";

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const decodedToken = await adminAuth.verifyIdToken(token);
    const userId = decodedToken.uid;
    const userRes = await databaseProvider.getUserById({ id: userId });
    const adminUser = userRes?.data?.user;

    if (!isAdmin(adminUser?.role)) {
      return NextResponse.json({ error: "Access denied. Administrator privileges required." }, { status: 403 });
    }

    if (!adminUser?.email) {
      return NextResponse.json({ error: "No registered email address found for this administrator." }, { status: 400 });
    }

    const result = await sendEmailNotification({
      to: {
        email: adminUser.email,
        name: adminUser.displayName || adminUser.email,
      },
      subject: "LocalPages.ph SMTP test email",
      text: [
        "This is a LocalPages.ph SMTP test email.",
        "",
        "If you received this, the deployed app can connect to SMTP and send notifications from the configured sender.",
      ].join("\n"),
    });

    return NextResponse.json({
      success: result.sent,
      ...result,
      recipient: adminUser.email,
      diagnostics: result.diagnostics || await getSmtpDiagnostics(),
    });
  } catch (error: any) {
    console.error("Admin email test error:", error);
    return NextResponse.json({ error: error.message || "Failed to send SMTP test email." }, { status: 500 });
  }
}
