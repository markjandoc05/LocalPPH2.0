import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { users } from '@/db/schema';
import { adminAuth } from '@/lib/firebase-admin';
import { normalizeRole, ROLES, type UserRole } from './roles';

type AuthorizationResult =
  | { user: typeof users.$inferSelect; error?: never }
  | { error: NextResponse; user?: never };

const invalidTokenCodes = new Set([
  'auth/argument-error', 'auth/invalid-argument', 'auth/invalid-id-token',
  'auth/id-token-expired', 'auth/id-token-revoked', 'auth/user-disabled', 'auth/user-not-found',
]);
const denied = (message: string, status: number): AuthorizationResult => ({
  error: NextResponse.json({ error: message }, { status, headers: { 'Cache-Control': 'no-store' } }),
});

export async function requireActiveUser(
  request: Pick<Request, 'headers'>,
  allowedRoles: readonly UserRole[] = Object.values(ROLES),
): Promise<AuthorizationResult> {
  const authorization = request.headers.get('Authorization');
  const token = authorization?.startsWith('Bearer ') ? authorization.slice(7).trim() : '';
  if (!token) return denied('Unauthorized.', 401);

  let decodedToken;
  try {
    decodedToken = await adminAuth.verifyIdToken(token);
  } catch (error) {
    const code = error && typeof error === 'object' && 'code' in error ? error.code : undefined;
    return invalidTokenCodes.has(String(code))
      ? denied('Unauthorized. Invalid or expired token.', 401)
      : denied('Authorization service is unavailable.', 503);
  }
  if (!decodedToken.uid) return denied('Unauthorized.', 401);

  try {
    const user = await db.query.users.findFirst({ where: eq(users.id, decodedToken.uid) });
    if (!user || user.id !== decodedToken.uid || user.accountStatus !== 'ACTIVE') {
      return denied('Account is not allowed to use this operation.', 403);
    }
    if (!allowedRoles.some((role) => role === normalizeRole(user.role))) {
      return denied('Access denied.', 403);
    }
    return { user };
  } catch {
    return denied('Authorization service is unavailable.', 503);
  }
}

export const requireActiveAdmin = (request: Pick<Request, 'headers'>) =>
  requireActiveUser(request, [ROLES.ADMIN]);
