import { NextRequest, NextResponse } from "next/server";
import { requireActiveUser } from '@/lib/auth/server-authorization';
import { ROLES } from '@/lib/auth/roles';
import { db } from "@/db";
import { businesses } from "@/db/schema";
import { eq, and, notInArray } from "drizzle-orm";
import { invalidatePublicBusinessCache } from '@/lib/data-connect/public-cache-invalidation';

export async function POST(req: NextRequest) {
  try {
    const authorization = await requireActiveUser(req, [ROLES.BUSINESS, ROLES.ADMIN]);
    if (authorization.error) return authorization.error;
    const userId = authorization.user.id;

    const { businessId } = await req.json();
    if (!businessId) {
      return NextResponse.json({ error: "Business ID required" }, { status: 400 });
    }

    // Verify ownership
    const business = await db.query.businesses.findFirst({
      where: and(eq(businesses.id, businessId), eq(businesses.ownerId, userId))
    });

    if (!business) {
      return NextResponse.json({ error: "Forbidden: You do not own this business" }, { status: 403 });
    }
    if (business.status === 'REJECTED' || business.status === 'SUSPENDED') {
      return NextResponse.json({ error: 'This listing has a review decision and is retained for reconsideration. Request a review instead of deleting it.' }, { status: 409 });
    }

    // Delete business
    const deleted = await db.delete(businesses)
      .where(and(eq(businesses.id, businessId), eq(businesses.ownerId, userId), notInArray(businesses.status, ['REJECTED', 'SUSPENDED'])))
      .returning({ id: businesses.id });
    if (!deleted.length) {
      return NextResponse.json({ error: "Forbidden: You do not own this business" }, { status: 403 });
    }

    invalidatePublicBusinessCache();

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Delete business error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
