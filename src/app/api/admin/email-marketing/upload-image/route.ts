import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { adminStorage } from "@/lib/firebase/admin";
import { requireActiveAdmin } from '@/lib/auth/server-authorization';

const MAX_IMAGE_SIZE_BYTES = 2 * 1024 * 1024;
const allowedImageTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

const sanitizeFileName = (fileName: string) =>
  fileName
    .replace(/[^a-zA-Z0-9._-]/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 90);

export async function POST(req: NextRequest) {
  try {
    const authResult = await requireActiveAdmin(req);
    if (authResult.error) return authResult.error;

    const formData = await req.formData();
    const file = formData.get("image");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Image file is required." }, { status: 400 });
    }

    if (!allowedImageTypes.has(file.type)) {
      return NextResponse.json({ error: "Upload a JPG, PNG, or WEBP image." }, { status: 400 });
    }

    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      return NextResponse.json({ error: "Image must be 2MB or smaller for reliable email delivery." }, { status: 400 });
    }

    const bytes = Buffer.from(await file.arrayBuffer());
    const token = randomUUID();
    const safeFileName = sanitizeFileName(file.name || "campaign-image");
    const filePath = `email-marketing/${Date.now()}-${safeFileName}`;
    const bucket = adminStorage.bucket();
    const storageFile = bucket.file(filePath);

    await storageFile.save(bytes, {
      contentType: file.type,
      resumable: false,
      metadata: {
        cacheControl: "public, max-age=31536000",
        metadata: {
          firebaseStorageDownloadTokens: token,
        },
      },
    });

    const encodedPath = encodeURIComponent(filePath);
    const url = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodedPath}?alt=media&token=${token}`;

    return NextResponse.json({
      success: true,
      url,
      path: filePath,
      fileName: file.name,
    });
  } catch (error: any) {
    console.error("Email marketing image upload error:", error);
    return NextResponse.json({ error: error.message || "Failed to upload campaign image." }, { status: 500 });
  }
}
