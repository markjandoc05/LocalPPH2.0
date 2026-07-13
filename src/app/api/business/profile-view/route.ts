import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { businessProfileViews } from "@/db/schema";
import { count, eq } from "drizzle-orm";
import { createHash } from "crypto";

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const getUniqueViewCount = async (businessId: string) => {
  const rows = await db
    .select({ value: count() })
    .from(businessProfileViews)
    .where(eq(businessProfileViews.businessId, businessId));

  return Number(rows[0]?.value || 0);
};

const normalizeVisitorKey = (visitorKey: unknown) => {
  return typeof visitorKey === "string" ? visitorKey.trim() : "";
};

const createRequestVisitorKey = (req: NextRequest) => {
  const forwardedFor = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "";
  const realIp = req.headers.get("x-real-ip") || "";
  const userAgent = req.headers.get("user-agent") || "";
  const language = req.headers.get("accept-language") || "";
  const source = [forwardedFor || realIp, userAgent, language].join("|");

  return `request:${createHash("sha256").update(source).digest("hex")}`;
};

export async function GET(req: NextRequest) {
  try {
    const businessId = req.nextUrl.searchParams.get("businessId") || "";
    if (!uuidPattern.test(businessId)) {
      return NextResponse.json({ error: "Valid business ID is required" }, { status: 400 });
    }

    return NextResponse.json({ uniqueViews: await getUniqueViewCount(businessId) });
  } catch (error) {
    console.error("Profile view count error:", error);
    return NextResponse.json({ error: "Failed to load profile views" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { businessId, visitorKey } = await req.json();
    const normalizedVisitorKey = normalizeVisitorKey(visitorKey) || createRequestVisitorKey(req);

    if (!uuidPattern.test(businessId || "")) {
      return NextResponse.json({ error: "Valid business ID is required" }, { status: 400 });
    }

    if (normalizedVisitorKey.length < 16 || normalizedVisitorKey.length > 128) {
      return NextResponse.json({ error: "Valid visitor key is required" }, { status: 400 });
    }

    await db
      .insert(businessProfileViews)
      .values({
        businessId,
        visitorKey: normalizedVisitorKey,
        lastViewedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: [businessProfileViews.businessId, businessProfileViews.visitorKey],
        set: {
          lastViewedAt: new Date(),
        },
      });

    return NextResponse.json({ uniqueViews: await getUniqueViewCount(businessId) });
  } catch (error) {
    console.error("Profile view tracking error:", error);
    return NextResponse.json({ error: "Failed to track profile view" }, { status: 500 });
  }
}
