import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';

import { db } from '@/db';
import { businesses } from '@/db/schema';
import { ROLES } from '@/lib/auth/roles';
import { requireActiveUser } from '@/lib/auth/server-authorization';
import { OWNER_EDITABLE_STATUSES } from '@/lib/listing-policy';

const VALID_CATEGORIES = new Set(['logo', 'cover', 'gallery', 'documents']);
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const jsonError = (message: string, status: number) =>
  NextResponse.json({ error: message }, { status });

export async function POST(req: NextRequest) {
  const authorization = await requireActiveUser(req, [ROLES.BUSINESS, ROLES.ADMIN]);
  if (authorization.error) return authorization.error;

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
    const userId = authorization.user.id;

    const business = await db.query.businesses.findFirst({
      where: eq(businesses.id, businessId),
    });

    if (business && business.ownerId !== userId) {
      return jsonError(
        'You do not have permission to upload files for this business.',
        403,
      );
    }
    if (business && !OWNER_EDITABLE_STATUSES.includes(business.status)) {
      return jsonError('Media changes require an editable draft or requested revision. Use the listing review request form.', 409);
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
