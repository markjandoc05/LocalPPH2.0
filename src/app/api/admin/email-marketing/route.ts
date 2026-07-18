import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase-admin";
import { isAdmin, normalizeRole } from "@/lib/auth/roles";
import { databaseProvider } from "@/lib/data-connect/database-provider";
import { sendEmailNotification } from "@/lib/email/notifications";
import { db } from "@/db";
import { emailCampaignRecipients, emailCampaigns } from "@/db/schema";
import { desc, eq, inArray } from "drizzle-orm";
import { SITE_URL } from "@/lib/seo/metadata";

const DEFAULT_SENDER = "support@localpages.ph";
const DEFAULT_SENDER_NAME = "LocalPages.ph Team";
const allowedRoles = new Set(["ADMIN", "MODERATOR", "BUSINESS", "SUBSCRIBER"]);

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const getDerivedCampaignStatus = (sent: number, failed: number, pending: number) => {
  if (pending > 0 && (sent > 0 || failed > 0)) return "IN_PROGRESS";
  if (pending > 0) return "SENDING";
  if (failed > 0 && sent > 0) return "PARTIAL";
  if (failed > 0) return "FAILED";
  return "SENT";
};

const isMissingEmailCampaignTablesError = (error: any) => {
  const message = String(error?.message || error || "").toLowerCase();
  return message.includes("email_campaigns") || message.includes("email_campaign_recipients");
};

const parseRoles = (roles: unknown) => {
  if (!Array.isArray(roles)) return [];
  return Array.from(new Set(roles.map((role) => normalizeRole(String(role))).filter((role) => allowedRoles.has(role))));
};

const parseUserIds = (userIds: unknown) => {
  if (!Array.isArray(userIds)) return [];
  return Array.from(new Set(userIds.map((id) => String(id || "").trim()).filter(Boolean)));
};

const sanitizeEmailName = (value: string) => value.replace(/["<>]/g, "").trim();

const formatSender = (name: string, email: string) => {
  const cleanName = sanitizeEmailName(name || DEFAULT_SENDER_NAME);
  return cleanName ? `"${cleanName}" <${email}>` : email;
};

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

const getFirstName = (user: any) => {
  const explicitFirstName = String(user.firstName || "").trim();
  if (explicitFirstName) return explicitFirstName;

  const displayName = String(user.displayName || "").trim();
  if (displayName) return displayName.split(/\s+/)[0];

  return "there";
};

const getDisplayName = (user: any) => {
  const displayName = String(user.displayName || "").trim();
  if (displayName) return displayName;

  const fullName = [user.firstName, user.lastName]
    .map((value) => String(value || "").trim())
    .filter(Boolean)
    .join(" ");

  return fullName || String(user.email || "").trim();
};

const renderPersonalizedTemplate = (template: string, values: Record<string, string>) =>
  template.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_match, key) => values[key] ?? "");

const getRecipientTemplateValues = (recipient: any) => ({
  first_name: recipient.firstName || "there",
  last_name: recipient.lastName || "",
  name: recipient.name || recipient.email,
  email: recipient.email,
  role: recipient.role,
  create_listing_url: `${SITE_URL}/business/listings/new`,
});

const renderCampaignHtml = (message: string, trackingUrl: string, imageUrl?: string, imageAlt?: string) => {
  const htmlMessage = escapeHtml(message)
    .split(/\r?\n/)
    .map((line) => line || "&nbsp;")
    .join("<br />");
  const imageMarkup = imageUrl
    ? [
        '<div style="margin:0 0 20px;">',
        `<img src="${escapeHtml(imageUrl)}" alt="${escapeHtml(imageAlt || "LocalPages.ph campaign image")}" style="display:block;width:100%;max-width:640px;height:auto;border-radius:12px;border:0;" />`,
        '</div>',
      ].join("")
    : "";

  return [
    '<div style="font-family:Arial,sans-serif;font-size:15px;line-height:1.6;color:#111827;max-width:640px;">',
    imageMarkup,
    htmlMessage,
    '</div>',
    `<img src="${trackingUrl}" width="1" height="1" alt="" style="width:1px;height:1px;opacity:0;overflow:hidden;border:0;outline:none;" />`,
  ].join("");
};

const getCampaignReports = async () => {
  const campaigns = await db.select().from(emailCampaigns).orderBy(desc(emailCampaigns.createdAt)).limit(20);
  const campaignIds = campaigns.map((campaign) => campaign.id);

  if (campaignIds.length === 0) return [];

  const recipients = await db
    .select()
    .from(emailCampaignRecipients)
    .where(inArray(emailCampaignRecipients.campaignId, campaignIds));

  return campaigns.map((campaign) => {
    const campaignRecipients = recipients.filter((recipient) => recipient.campaignId === campaign.id);
    const sentCount = campaignRecipients.filter((recipient) => recipient.status === "SENT").length;
    const failedCount = campaignRecipients.filter((recipient) => recipient.status === "FAILED").length;
    const pendingCount = campaignRecipients.filter((recipient) => recipient.status === "PENDING").length;
    const openedRecipients = campaignRecipients.filter((recipient) => recipient.openCount > 0).length;
    const totalRecipients = campaignRecipients.length || campaign.totalRecipients;

    return {
      ...campaign,
      status: getDerivedCampaignStatus(sentCount, failedCount, pendingCount),
      totalRecipients,
      sentCount,
      failedCount,
      openedCount: openedRecipients,
      pendingCount,
      recipients: campaignRecipients.map((recipient) => ({
        id: recipient.id,
        email: recipient.email,
        name: recipient.name,
        role: recipient.role,
        status: recipient.status,
        sentAt: recipient.sentAt,
        firstOpenedAt: recipient.firstOpenedAt,
        lastOpenedAt: recipient.lastOpenedAt,
        openCount: recipient.openCount,
        errorMessage: recipient.errorMessage,
      })),
    };
  });
};

const getCampaignReportsSafely = async () => {
  try {
    return {
      campaigns: await getCampaignReports(),
      reportsReady: true,
      reportsMessage: "",
    };
  } catch (error: any) {
    if (isMissingEmailCampaignTablesError(error)) {
      return {
        campaigns: [],
        reportsReady: false,
        reportsMessage: "Campaign reports are not set up yet. Apply drizzle/0004_email_marketing_reports.sql to enable send reports and open tracking.",
      };
    }

    throw error;
  }
};

const updateCampaignSummary = async (campaignId: string) => {
  const campaignRecipients = await db
    .select()
    .from(emailCampaignRecipients)
    .where(eq(emailCampaignRecipients.campaignId, campaignId));
  const sentCount = campaignRecipients.filter((recipient) => recipient.status === "SENT").length;
  const failedCount = campaignRecipients.filter((recipient) => recipient.status === "FAILED").length;
  const pendingCount = campaignRecipients.filter((recipient) => recipient.status === "PENDING").length;

  await db.update(emailCampaigns)
    .set({
      status: getDerivedCampaignStatus(sentCount, failedCount, pendingCount),
      sentCount,
      failedCount,
      updatedAt: new Date(),
    })
    .where(eq(emailCampaigns.id, campaignId));

  return { sentCount, failedCount, pendingCount };
};

const sendExistingCampaignRecipient = async (campaignId: string, recipientId: string) => {
  const campaign = await db.query.emailCampaigns.findFirst({
    where: eq(emailCampaigns.id, campaignId),
  });

  if (!campaign) {
    return NextResponse.json({ error: "Campaign was not found." }, { status: 404 });
  }

  const recipient = await db.query.emailCampaignRecipients.findFirst({
    where: eq(emailCampaignRecipients.id, recipientId),
  });

  if (!recipient || recipient.campaignId !== campaign.id) {
    return NextResponse.json({ error: "Campaign recipient was not found." }, { status: 404 });
  }

  if (recipient.status === "SENT") {
    return NextResponse.json({ error: "This recipient has already been sent." }, { status: 400 });
  }

  const recipientName = recipient.name || recipient.email;
  const templateValues = getRecipientTemplateValues({
    firstName: recipientName?.split(/\s+/)[0] || "there",
    lastName: "",
    name: recipientName,
    email: recipient.email,
    role: recipient.role || "",
  });
  const personalizedSubject = renderPersonalizedTemplate(campaign.subject, templateValues);
  const personalizedMessage = renderPersonalizedTemplate(campaign.body, templateValues);
  const trackingUrl = `${SITE_URL}/api/email/open/${recipient.id}.gif`;
  const result = await sendEmailNotification({
    to: { email: recipient.email, name: recipient.name },
    subject: personalizedSubject,
    text: personalizedMessage,
    html: renderCampaignHtml(personalizedMessage, trackingUrl),
    from: campaign.fromEmail,
    replyTo: campaign.replyToEmail,
  });

  await db.update(emailCampaignRecipients)
    .set({
      status: result.sent ? "SENT" : "FAILED",
      smtpMessageId: result.messageId || null,
      errorMessage: result.sent ? null : result.message || result.reason || "Email was not accepted by SMTP.",
      sentAt: result.sent ? new Date() : null,
      updatedAt: new Date(),
    })
    .where(eq(emailCampaignRecipients.id, recipient.id));

  const summary = await updateCampaignSummary(campaign.id);

  return NextResponse.json({
    success: result.sent,
    sent: result.sent,
    recipientId: recipient.id,
    email: recipient.email,
    message: result.sent ? "Email sent." : result.message || result.reason || "Email failed.",
    summary,
  }, { status: result.sent ? 200 : 400 });
};

const requireAdmin = async (req: NextRequest) => {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  const token = authHeader.split(" ")[1];
  const decodedToken = await adminAuth.verifyIdToken(token);
  const adminUserRes = await databaseProvider.getUserById({ id: decodedToken.uid });
  const adminUser = adminUserRes?.data?.user;

  if (!isAdmin(adminUser?.role)) {
    return { error: NextResponse.json({ error: "Access denied. Administrator privileges required." }, { status: 403 }) };
  }

  return { adminUser };
};

export async function GET(req: NextRequest) {
  try {
    const authResult = await requireAdmin(req);
    if (authResult.error) return authResult.error;

    const usersRes = await databaseProvider.getAllUsers();
    const users = (usersRes?.data?.users || [])
      .filter((user: any) => user.accountStatus !== "BANNED" && user.accountStatus !== "DELETED")
      .filter((user: any) => Boolean(String(user.email || "").trim()))
      .map((user: any) => ({
        id: user.id,
        email: String(user.email).trim(),
        displayName: user.displayName || user.firstName || user.email,
        role: normalizeRole(user.role),
      }))
      .sort((a: any, b: any) => String(a.displayName || a.email).localeCompare(String(b.displayName || b.email)));

    const reports = await getCampaignReportsSafely();

    return NextResponse.json({ users, ...reports });
  } catch (error: any) {
    console.error("Email marketing users error:", error);
    return NextResponse.json({ error: error.message || "Failed to load email marketing users." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const authResult = await requireAdmin(req);
    if (authResult.error) return authResult.error;

    const body = await req.json();
    if (body.action === "sendRecipient") {
      const campaignId = String(body.campaignId || "").trim();
      const recipientId = String(body.recipientId || "").trim();

      if (!campaignId || !recipientId) {
        return NextResponse.json({ error: "Campaign ID and recipient ID are required." }, { status: 400 });
      }

      return await sendExistingCampaignRecipient(campaignId, recipientId);
    }

    const roles = parseRoles(body.roles);
    const userIds = parseUserIds(body.userIds);
    const subject = String(body.subject || "").trim();
    const message = String(body.body || "").trim();
    const fromName = sanitizeEmailName(String(body.fromName || DEFAULT_SENDER_NAME));
    const imageUrl = String(body.imageUrl || "").trim();
    const imageAlt = String(body.imageAlt || "").trim();
    const intervalSeconds = Math.min(Math.max(Number(body.intervalSeconds || 0), 0), 60);

    if (roles.length === 0 && userIds.length === 0) {
      return NextResponse.json({ error: "Select at least one user role or registered user." }, { status: 400 });
    }

    if (!subject || !message) {
      return NextResponse.json({ error: "Email subject and body are required." }, { status: 400 });
    }

    if (!fromName) {
      return NextResponse.json({ error: "Sender display name is required." }, { status: 400 });
    }

    const usersRes = await databaseProvider.getAllUsers();
    const uniqueRecipients = new Map<string, any>();
    (usersRes?.data?.users || [])
      .filter((user: any) => roles.includes(normalizeRole(user.role)) || userIds.includes(user.id))
      .filter((user: any) => user.accountStatus !== "BANNED" && user.accountStatus !== "DELETED")
      .filter((user: any) => Boolean(String(user.email || "").trim()))
      .forEach((user: any) => {
        const email = String(user.email).trim().toLowerCase();
        if (!uniqueRecipients.has(email)) {
          uniqueRecipients.set(email, {
            id: user.id,
            email: String(user.email).trim(),
            firstName: getFirstName(user),
            lastName: String(user.lastName || "").trim(),
            name: getDisplayName(user),
            role: normalizeRole(user.role),
          });
        }
      });
    const recipients = Array.from(uniqueRecipients.values());

    if (recipients.length === 0) {
      return NextResponse.json({ error: "No active users with email addresses matched the selected recipients." }, { status: 400 });
    }

    let campaign;
    try {
      const campaignRows = await db.insert(emailCampaigns)
        .values({
          subject,
          body: message,
          targetRoles: JSON.stringify(roles),
          targetUserIds: JSON.stringify(userIds),
          fromEmail: formatSender(fromName, DEFAULT_SENDER),
          replyToEmail: formatSender("LocalPages.ph Support", DEFAULT_SENDER),
          intervalSeconds,
          totalRecipients: recipients.length,
          createdById: authResult.adminUser?.id,
        })
        .returning();
      campaign = campaignRows[0];
    } catch (error: any) {
      console.error("Email campaign record create error:", error);
      return NextResponse.json({
        error: isMissingEmailCampaignTablesError(error)
          ? "Email Marketing reports are not set up yet. Please apply drizzle/0004_email_marketing_reports.sql before sending campaigns."
          : "Could not create the email campaign report.",
      }, { status: 500 });
    }

    let recipientRows;
    try {
      recipientRows = await db.insert(emailCampaignRecipients)
        .values(recipients.map((recipient) => ({
          campaignId: campaign.id,
          userId: recipient.id,
          email: recipient.email,
          name: recipient.name,
          role: recipient.role,
        })))
        .returning();
    } catch (error: any) {
      console.error("Email campaign recipient create error:", error);
      return NextResponse.json({
        error: isMissingEmailCampaignTablesError(error)
          ? "Email Marketing reports are not set up yet. Please apply drizzle/0004_email_marketing_reports.sql before sending campaigns."
          : "Could not create the email campaign recipient report.",
      }, { status: 500 });
    }

    const results: Array<{ email: string; sent: boolean; reason?: string; message?: string; messageId?: string }> = [];

    for (const [index, recipientRow] of recipientRows.entries()) {
      const recipient = recipients[index];
      const templateValues = getRecipientTemplateValues(recipient);
      const personalizedSubject = renderPersonalizedTemplate(subject, templateValues);
      const personalizedMessage = renderPersonalizedTemplate(message, templateValues);
      const personalizedText = imageUrl
        ? `${personalizedMessage}\n\nCampaign image: ${imageUrl}`
        : personalizedMessage;
      const trackingUrl = `${SITE_URL}/api/email/open/${recipientRow.id}.gif`;
      const result = await sendEmailNotification({
        to: { email: recipientRow.email, name: recipientRow.name },
        subject: personalizedSubject,
        text: personalizedText,
        html: renderCampaignHtml(personalizedMessage, trackingUrl, imageUrl, imageAlt),
        from: formatSender(fromName, DEFAULT_SENDER),
        replyTo: formatSender("LocalPages.ph Support", DEFAULT_SENDER),
      });

      await db.update(emailCampaignRecipients)
        .set({
          status: result.sent ? "SENT" : "FAILED",
          smtpMessageId: result.messageId || null,
          errorMessage: result.sent ? null : result.message || result.reason || "Email was not accepted by SMTP.",
          sentAt: result.sent ? new Date() : null,
          updatedAt: new Date(),
        })
        .where(eq(emailCampaignRecipients.id, recipientRow.id));

      results.push({
        email: recipientRow.email,
        sent: result.sent,
        reason: result.reason,
        message: result.message,
        messageId: result.messageId,
      });

      await updateCampaignSummary(campaign.id);

      if (intervalSeconds > 0 && index < recipients.length - 1) {
        await wait(intervalSeconds * 1000);
      }
    }

    const sent = results.filter((result) => result.sent).length;
    const failed = results.length - sent;

    await updateCampaignSummary(campaign.id);

    return NextResponse.json({
      success: sent > 0,
      sent,
      failed,
      total: results.length,
      campaignId: campaign.id,
      from: formatSender(fromName, DEFAULT_SENDER),
      replyTo: formatSender("LocalPages.ph Support", DEFAULT_SENDER),
      results,
    });
  } catch (error: any) {
    console.error("Email marketing send error:", error);
    return NextResponse.json({ error: error.message || "Failed to send email marketing campaign." }, { status: 500 });
  }
}
