import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminStorage } from "@/lib/firebase/admin";
import { db } from "@/db";
import { businesses } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const token = authHeader.split("Bearer ")[1];
    const decodedToken = await adminAuth.verifyIdToken(token);
    const userId = decodedToken.uid;

    const { filePath } = await req.json();
    if (!filePath) {
      return NextResponse.json({ error: "File path required" }, { status: 400 });
    }

    // Validate path: businesses/{businessId}/{category}/{fileName}
    const pathParts = filePath.split('/');
    if (pathParts.length < 3 || pathParts[0] !== 'businesses') {
      return NextResponse.json({ error: "Invalid file path" }, { status: 400 });
    }
    const businessId = pathParts[1];
    const category = pathParts[2];

    const validCategories = ['logo', 'cover', 'gallery', 'documents'];
    if (!validCategories.includes(category)) {
      return NextResponse.json({ error: "Invalid category" }, { status: 400 });
    }

    // Verify ownership
    const business = await db.query.businesses.findFirst({
      where: and(eq(businesses.id, businessId), eq(businesses.ownerId, userId))
    });

    if (!business) {
      return NextResponse.json({ error: "Forbidden: You do not own this business or file not found" }, { status: 403 });
    }

    // Delete file
    await adminStorage.bucket().file(filePath).delete();

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Delete media error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
