import { NextRequest, NextResponse } from "next/server";
import { requireActiveAdmin } from '@/lib/auth/server-authorization';
import { getSmtpDiagnostics, sendEmailNotification } from "@/lib/email/notifications";

export async function POST(req: NextRequest) {
  try {
    const authorization = await requireActiveAdmin(req);
    if (authorization.error) return authorization.error;
    const adminUser = authorization.user;

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
