import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase/admin";
import { db } from "@/db";
import { businesses, users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const token = authHeader.split("Bearer ")[1];
    const decodedToken = await adminAuth.verifyIdToken(token);
    const userId = decodedToken.uid;

    const { businessId, category } = await req.json();

    // Find user in DB
    const user = await db.query.users.findFirst({
        where: eq(users.id, userId)
    });

    console.log("Upload permission check:", { userId, businessId, user: user ? { id: user.id, role: user.role } : 'not found' });

    if (!user) {
        console.error("User not found in DB:", { userId });
        return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Normalize role check
    const normalizedRole = user.role?.toUpperCase().trim();
    const allowedRoles = ['BUSINESS', 'BUSINESS ACCOUNT', 'ADMIN', 'ADMINISTRATOR', 'MODERATOR'];
    
    if (!allowedRoles.includes(normalizedRole || '')) {
        console.error("Invalid role for upload:", { userId: user.id, role: user.role });
        return NextResponse.json({ error: "You do not have permission to upload files for this business." }, { status: 403 });
    }

    const isAdmin = ['ADMIN', 'ADMINISTRATOR', 'MODERATOR'].includes(normalizedRole || '');

    // Verify ownership if business exists and user is not an admin
    const business = businessId ? await db.query.businesses.findFirst({
        where: eq(businesses.id, businessId)
    }) : null;

    console.log("Business check:", { businessId, businessFound: !!business, businessOwnerId: business?.ownerId, userId: user.id, isAdmin });

    // If business exists, user MUST own it (unless admin).
    if (business && !isAdmin && business.ownerId !== user.id) {
        console.error("Ownership mismatch:", { userId: user.id, businessId, ownerId: business.ownerId });
        return NextResponse.json({ error: "You do not have permission to upload files for this business." }, { status: 403 });
    }

    const validCategories = ['logo', 'cover', 'gallery', 'documents'];
    if (!validCategories.includes(category)) {
        return NextResponse.json({ error: "Invalid category" }, { status: 400 });
    }

    return NextResponse.json({
        allowed: true,
        uploadPath: `businesses/${businessId}/${category}/`
    });

  } catch (error) {
    console.error("Permission check error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
