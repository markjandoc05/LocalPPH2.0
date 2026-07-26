import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';

import { db } from '@/db';
import { businesses, users } from '@/db/schema';
import { canManageBusiness, normalizeRole } from '@/lib/auth/roles';
import { adminAuth } from '@/lib/firebase/admin';

const VALID_CATEGORIES = new Set(['logo', 'cover', 'gallery', 'documents']);
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const jsonError = (message: string, status: number) =>
  NextResponse.json({ error: message }, { status });

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

  const businessId =
    typeof body.businessId === 'string' ? body.businessId.trim() : '';
  const category = typeof body.category === 'string' ? body.category : '';

  if (!UUID_PATTERN.test(businessId)) {
    return jsonError('Business ID must be a valid UUID.', 400);
  }
  if (!VALID_CATEGORIES.has(category)) {
    return jsonError('Invalid media category.', 400);
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
        'You do not have permission to upload business media.',
        403,
      );
    }

    const business = await db.query.businesses.findFirst({
      where: eq(businesses.id, businessId),
    });

    if (business && business.ownerId !== userId) {
      return jsonError(
        'You do not have permission to upload files for this business.',
        403,
      );
    }

    return NextResponse.json({
      allowed: true,
      ownerId: userId,
      businessId,
      category,
      uploadPath: `businesses/${userId}/${businessId}/${category}/`,
    });
  } catch (error) {
    console.error('Upload permission check failed.', error);
    return jsonError('Unable to verify upload permission.', 500);
  }
}
