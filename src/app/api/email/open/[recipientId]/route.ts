import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { emailCampaignRecipients, emailCampaigns } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const transparentGif = Uint8Array.from(
  Buffer.from("R0lGODlhAQABAPAAAP///wAAACH5BAAAAAAALAAAAAABAAEAAAICRAEAOw==", "base64"),
);

const buildPixelResponse = () =>
  new NextResponse(transparentGif, {
    headers: {
      "Content-Type": "image/gif",
      "Cache-Control": "private, no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
      Pragma: "no-cache",
      Expires: "0",
      "X-Robots-Tag": "noindex, nofollow",
    },
  });

const trackOpen = async (recipientId: string) => {
  const cleanRecipientId = recipientId.replace(/\.gif$/i, "");
  const existingRecipient = await db.query.emailCampaignRecipients.findFirst({
    where: eq(emailCampaignRecipients.id, cleanRecipientId),
  });

  if (!existingRecipient) {
    console.warn("Email open tracking skipped: recipient not found.", { recipientId: cleanRecipientId });
    return;
  }

  const isFirstOpen = existingRecipient.openCount === 0;

  await db.update(emailCampaignRecipients)
    .set({
      openCount: sql`${emailCampaignRecipients.openCount} + 1`,
      firstOpenedAt: sql`COALESCE(${emailCampaignRecipients.firstOpenedAt}, now())`,
      lastOpenedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(emailCampaignRecipients.id, cleanRecipientId));

  if (isFirstOpen) {
    await db.update(emailCampaigns)
      .set({
        openedCount: sql`${emailCampaigns.openedCount} + 1`,
        updatedAt: new Date(),
      })
      .where(eq(emailCampaigns.id, existingRecipient.campaignId));
  }
};

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ recipientId: string }> },
) {
  try {
    const { recipientId } = await params;
    await trackOpen(recipientId);
  } catch (error) {
    console.error("Email open tracking error:", error);
  }

  return buildPixelResponse();
}

export async function HEAD(
  req: NextRequest,
  { params }: { params: Promise<{ recipientId: string }> },
) {
  try {
    const { recipientId } = await params;
    await trackOpen(recipientId);
  } catch (error) {
    console.error("Email open tracking HEAD error:", error);
  }

  return new NextResponse(null, {
    headers: {
      "Content-Type": "image/gif",
      "Cache-Control": "private, no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
      Pragma: "no-cache",
      Expires: "0",
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
}
