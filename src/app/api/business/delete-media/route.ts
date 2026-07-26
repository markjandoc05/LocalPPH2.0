import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';

import { db } from '@/db';
import { businesses, users } from '@/db/schema';
import { canManageBusiness, normalizeRole } from '@/lib/auth/roles';
import { adminAuth, adminStorage } from '@/lib/firebase/admin';

const VALID_CATEGORIES = new Set(['logo', 'cover', 'gallery', 'documents']);
const SAFE_FILE_NAME_PATTERN = /^[a-zA-Z0-9][a-zA-Z0-9._-]{0,199}$/;

const jsonError = (message: string, status: number) =>
  NextResponse.json({ error: message }, { status });

type ParsedMediaPath = {
  ownerId: string | null;
  businessId: string;
  category: string;
  fileName: string;
  legacy: boolean;
};

const parseMediaPath = (filePath: string): ParsedMediaPath | null => {
  const parts = filePath.split('/');

  if (parts.length === 5 && parts[0] === 'businesses') {
    return {
      ownerId: parts[1],
      businessId: parts[2],
      category: parts[3],
      fileName: parts[4],
      legacy: false,
    };
  }

  if (parts.length === 4 && parts[0] === 'businesses') {
    return {
      ownerId: null,
      businessId: parts[1],
      category: parts[2],
      fileName: parts[3],
      legacy: true,
    };
  }

  return null;
};

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return jsonError('Unauthorized.', 401);
  }

  let decodedToken;
  try {
    decodedToken = await adminAuth.verifyIdToken(
      authHeader.slice('Bearer '.length).trim(),
    );
  } catch {
    return jsonError('Unauthorized. Invalid or expired token.', 401);
  }

  let body: Record<string, unknown>;
  try {
    const parsed = await req.json();
    body = parsed && typeof parsed === 'object' && !Array.isArray(parsed)
      ? parsed as Record<string, unknown>
      : {};
  } catch {
    return jsonError('Invalid JSON request body.', 400);
  }

  const filePath = typeof body.filePath === 'string' ? body.filePath : '';
  const parsedPath = parseMediaPath(filePath);

  if (
    !parsedPath ||
    !VALID_CATEGORIES.has(parsedPath.category) ||
    !SAFE_FILE_NAME_PATTERN.test(parsedPath.fileName)
  ) {
    return jsonError('Invalid media file path.', 400);
  }

  try {
    const userId = decodedToken.uid;
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (
      !user ||
      user.accountStatus !== 'ACTIVE' ||
      !canManageBusiness(normalizeRole(user.role))
    ) {
      return jsonError(
        'You do not have permission to delete business media.',
        403,
      );
    }

    if (!parsedPath.legacy && parsedPath.ownerId !== userId) {
      return jsonError('You do not own this media file.', 403);
    }

    const business = await db.query.businesses.findFirst({
      where: eq(businesses.id, parsedPath.businessId),
    });

    if (
      (business && business.ownerId !== userId) ||
      (parsedPath.legacy && !business)
    ) {
      return jsonError(
        'You do not own this business or media file.',
        403,
      );
    }

    await adminStorage.bucket().file(filePath).delete();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete media failed.', error);
    return jsonError('Unable to delete the media file.', 500);
  }
}
