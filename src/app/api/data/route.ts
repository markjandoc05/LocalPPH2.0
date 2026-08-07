import { NextRequest, NextResponse } from 'next/server';

import { adminAuth } from '@/lib/firebase-admin';
import {
  canInvokeDataApiMethod,
  isDataApiMethod,
  type DataApiMethod,
} from '@/lib/auth/data-api-policy';
import { isAdmin, isAdminOrModerator, normalizeRole, ROLES } from '@/lib/auth/roles';
import { databaseProvider } from '@/lib/data-connect/database-provider';
import { consumeRateLimit, getRequestClientIp } from '@/lib/server/rate-limit';

type Variables = Record<string, any>;

const ACTIVE_ACCOUNT_STATUS = 'ACTIVE';
const MAX_REQUEST_BODY_BYTES = 512 * 1024;
const SELF_MANAGED_ROLES = new Set<string>([ROLES.SUBSCRIBER, ROLES.BUSINESS]);
const REVIEW_STATUSES = new Set([
  'APPROVED',
  'REJECTED',
  'REVISION_REQUESTED',
  'SUSPENDED',
]);
const PROTECTED_BUSINESS_FIELDS = new Set([
  'id',
  'ownerId',
  'status',
  'isFeatured',
  'moderatorNotes',
]);
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const jsonError = (message: string, status: number) =>
  NextResponse.json({ error: message }, { status });

const asVariables = (value: unknown): Variables =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Variables)
    : {};

const requireString = (value: unknown, fieldName: string) => {
  if (typeof value !== 'string' || !value.trim()) {
    throw new ApiRequestError(`${fieldName} is required.`, 400);
  }
  return value.trim();
};

const assertMatchingIdentity = (
  suppliedValue: unknown,
  trustedValue: string,
  fieldName: string,
) => {
  if (
    suppliedValue !== undefined &&
    (typeof suppliedValue !== 'string' || suppliedValue !== trustedValue)
  ) {
    throw new ApiRequestError(`${fieldName} does not match the authenticated user.`, 403);
  }
};

const sanitizeBusinessData = (value: unknown) => {
  const data = asVariables(value);
  return Object.fromEntries(
    Object.entries(data).filter(([key]) => !PROTECTED_BUSINESS_FIELDS.has(key)),
  );
};

class ApiRequestError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiRequestError';
    this.status = status;
  }
}

const getOwnedBusiness = async (
  id: string,
  userId: string,
  role: string,
  allowReviewer: boolean,
) => {
  const result = await databaseProvider.getBusinessById({ id });
  const business = result.data.business;

  if (!business) {
    throw new ApiRequestError('Business listing was not found.', 404);
  }

  const canAccessAnyBusiness =
    isAdmin(role) || (allowReviewer && isAdminOrModerator(role));

  if (!canAccessAnyBusiness && business.ownerId !== userId) {
    throw new ApiRequestError('Access denied.', 403);
  }

  return result;
};

const invokeAllowedMethod = async ({
  method,
  variables,
  userId,
  role,
  tokenEmail,
  tokenEmailVerified,
  tokenDisplayName,
  existingUser,
}: {
  method: DataApiMethod;
  variables: Variables;
  userId: string;
  role: string | null;
  tokenEmail?: string;
  tokenEmailVerified: boolean;
  tokenDisplayName?: string;
  existingUser: any | null;
}) => {
  switch (method) {
    case 'createUser': {
      assertMatchingIdentity(variables.id, userId, 'User ID');

      if (!tokenEmail) {
        throw new ApiRequestError(
          'A verified authentication email is required to create an account.',
          400,
        );
      }

      if (
        variables.email !== undefined &&
        (typeof variables.email !== 'string' ||
          variables.email.trim().toLowerCase() !== tokenEmail.toLowerCase())
      ) {
        throw new ApiRequestError(
          'Email does not match the authenticated user.',
          403,
        );
      }

      const requestedRole = normalizeRole(
        typeof variables.role === 'string' ? variables.role : ROLES.SUBSCRIBER,
      );
      if (!SELF_MANAGED_ROLES.has(requestedRole)) {
        throw new ApiRequestError(
          'Only Subscriber and Business accounts can be created through registration.',
          403,
        );
      }

      const displayName =
        (typeof variables.displayName === 'string' && variables.displayName.trim()) ||
        tokenDisplayName ||
        tokenEmail.split('@')[0];
      const photoUrl =
        typeof variables.photoUrl === 'string' ? variables.photoUrl : undefined;

      return databaseProvider.createUser({
        id: userId,
        email: tokenEmail,
        displayName: displayName.slice(0, 100),
        photoUrl,
        role: existingUser ? normalizeRole(existingUser.role) : requestedRole,
        emailVerified: tokenEmailVerified,
      });
    }

    case 'getUserById': {
      const targetUserId =
        typeof variables.id === 'string' && variables.id ? variables.id : userId;
      if (targetUserId !== userId && !isAdmin(role)) {
        throw new ApiRequestError('Access denied.', 403);
      }
      return databaseProvider.getUserById({ id: targetUserId });
    }

    case 'updateUser': {
      assertMatchingIdentity(variables.id, userId, 'User ID');
      return databaseProvider.updateUser({
        id: userId,
        data: {
          ...asVariables(variables.data),
          emailVerified: tokenEmailVerified,
        },
      });
    }

    case 'createSupportTicket':
      return databaseProvider.createSupportTicket({
        ...variables,
        userId,
      } as Parameters<typeof databaseProvider.createSupportTicket>[0]);

    case 'getMySupportTickets':
      return databaseProvider.getMySupportTickets({ userId });

    case 'getMySentBusinessInquiries':
      return databaseProvider.getMySentBusinessInquiries({ userId });

    case 'deleteMyBusinessInquiry':
      return databaseProvider.deleteMyBusinessInquiry({
        ...variables,
        userId,
      } as Parameters<typeof databaseProvider.deleteMyBusinessInquiry>[0]);

    case 'markMyBusinessInquiryRead':
      return databaseProvider.markMyBusinessInquiryRead({
        ...variables,
        userId,
      } as Parameters<typeof databaseProvider.markMyBusinessInquiryRead>[0]);

    case 'replyMyBusinessInquiry':
      return databaseProvider.replyMyBusinessInquiry({
        ...variables,
        userId,
      } as Parameters<typeof databaseProvider.replyMyBusinessInquiry>[0]);

    case 'getMyBusinesses': {
      const ownerId =
        isAdmin(role) && typeof variables.ownerId === 'string'
          ? variables.ownerId
          : userId;
      return databaseProvider.getMyBusinesses({ ownerId });
    }

    case 'getBusinessById': {
      const id = requireString(variables.id, 'Business ID');
      return getOwnedBusiness(id, userId, role || '', true);
    }

    case 'createBusinessDraft': {
      const safeVariables = sanitizeBusinessData(variables);
      if (variables.id !== undefined) {
        const id = requireString(variables.id, 'Business ID');
        if (!UUID_PATTERN.test(id)) {
          throw new ApiRequestError('Business ID must be a valid UUID.', 400);
        }
        safeVariables.id = id;
      }
      return databaseProvider.createBusinessDraft({
        ...safeVariables,
        ownerId: userId,
      });
    }

    case 'updateBusiness': {
      const id = requireString(variables.id, 'Business ID');
      await getOwnedBusiness(id, userId, role || '', false);
      return databaseProvider.updateBusiness({
        id,
        data: sanitizeBusinessData(variables.data),
      });
    }

    case 'submitBusiness': {
      const id = requireString(variables.id, 'Business ID');
      await getOwnedBusiness(id, userId, role || '', false);
      return databaseProvider.submitBusiness({ id });
    }

    case 'getMyBusinessInquiries':
      return databaseProvider.getMyBusinessInquiries({ ownerId: userId });

    case 'respondBusinessInquiry':
      return databaseProvider.respondBusinessInquiry({
        ...variables,
        ownerId: userId,
      } as Parameters<typeof databaseProvider.respondBusinessInquiry>[0]);

    case 'markBusinessInquiryRead':
      return databaseProvider.markBusinessInquiryRead({
        ...variables,
        ownerId: userId,
      } as Parameters<typeof databaseProvider.markBusinessInquiryRead>[0]);

    case 'deleteBusinessInquiry':
      return databaseProvider.deleteBusinessInquiry({
        ...variables,
        ownerId: userId,
      } as Parameters<typeof databaseProvider.deleteBusinessInquiry>[0]);

    case 'getAllBusinesses':
      return databaseProvider.getAllBusinesses(variables);

    case 'updateBusinessStatus': {
      const status =
        typeof variables.status === 'string'
          ? variables.status.toUpperCase()
          : '';
      if (!REVIEW_STATUSES.has(status)) {
        throw new ApiRequestError('Invalid listing review status.', 400);
      }
      return databaseProvider.updateBusinessStatus({
        ...variables,
        id: requireString(variables.id, 'Business ID'),
        status: status as Parameters<typeof databaseProvider.updateBusinessStatus>[0]['status'],
        adminUserId: userId,
      });
    }

    case 'sendBusinessRevisionReminder':
      return databaseProvider.sendBusinessRevisionReminder({
        id: requireString(variables.id, 'Business ID'),
        adminUserId: userId,
      });

    case 'getAllSupportTickets':
      return databaseProvider.getAllSupportTickets();

    case 'updateSupportTicket':
      return databaseProvider.updateSupportTicket({
        ...variables,
        respondedById: userId,
      } as Parameters<typeof databaseProvider.updateSupportTicket>[0]);

    case 'getAllUsers':
      return databaseProvider.getAllUsers();

    case 'updateUserAccountStatus':
      return databaseProvider.updateUserAccountStatus(
        variables as Parameters<typeof databaseProvider.updateUserAccountStatus>[0],
      );

    case 'updateUserRole':
      return databaseProvider.updateUserRole(
        variables as Parameters<typeof databaseProvider.updateUserRole>[0],
      );

    case 'deleteUserAccount': {
      const targetUserId = requireString(variables.id, 'User ID');
      if (targetUserId === userId) {
        throw new ApiRequestError(
          'You cannot delete your own administrator account.',
          400,
        );
      }
      return databaseProvider.deleteUserAccount({ id: targetUserId });
    }

    case 'createBackupSnapshot':
      return databaseProvider.createBackupSnapshot({
        ...variables,
        createdById: userId,
      } as Parameters<typeof databaseProvider.createBackupSnapshot>[0]);

    case 'getBackupSnapshots':
      return databaseProvider.getBackupSnapshots();

    case 'restoreBackupSnapshot':
      return databaseProvider.restoreBackupSnapshot({
        ...variables,
        restoredById: userId,
      } as Parameters<typeof databaseProvider.restoreBackupSnapshot>[0]);

    case 'deleteBackupSnapshot':
      return databaseProvider.deleteBackupSnapshot(
        variables as Parameters<typeof databaseProvider.deleteBackupSnapshot>[0],
      );

    case 'getBackupSchedule':
      return databaseProvider.getBackupSchedule();

    case 'updateBackupSchedule':
      return databaseProvider.updateBackupSchedule({
        ...variables,
        updatedById: userId,
      } as Parameters<typeof databaseProvider.updateBackupSchedule>[0]);

    case 'runDueBackupSchedule':
      return databaseProvider.runDueBackupSchedule({ createdById: userId });

    case 'upsertRegion':
      return databaseProvider.upsertRegion(
        variables as Parameters<typeof databaseProvider.upsertRegion>[0],
      );

    case 'upsertProvince':
      return databaseProvider.upsertProvince(
        variables as Parameters<typeof databaseProvider.upsertProvince>[0],
      );

    case 'upsertCity':
      return databaseProvider.upsertCity(
        variables as Parameters<typeof databaseProvider.upsertCity>[0],
      );

    case 'upsertCategory':
      return databaseProvider.upsertCategory(
        variables as Parameters<typeof databaseProvider.upsertCategory>[0],
      );

    case 'upsertSubcategory':
      return databaseProvider.upsertSubcategory(
        variables as Parameters<typeof databaseProvider.upsertSubcategory>[0],
      );
  }
};

export async function POST(req: NextRequest) {
  const rateLimit = consumeRateLimit(
    `authenticated-data:${getRequestClientIp(req)}`,
    180,
    60_000,
  );
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again shortly.' },
      {
        status: 429,
        headers: {
          'Retry-After': String(rateLimit.retryAfterSeconds),
          'Cache-Control': 'no-store',
        },
      },
    );
  }

  const contentLength = Number(req.headers.get('content-length') || 0);
  if (contentLength > MAX_REQUEST_BODY_BYTES) {
    return jsonError('Request body is too large.', 413);
  }

  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return jsonError('Unauthorized.', 401);
  }

  const token = authHeader.slice('Bearer '.length).trim();
  if (!token) {
    return jsonError('Unauthorized.', 401);
  }

  let decodedToken;
  try {
    decodedToken = await adminAuth.verifyIdToken(token);
  } catch (error) {
    console.warn('Data API token verification failed.', error);
    return jsonError('Unauthorized. Invalid or expired token.', 401);
  }

  let requestBody: Variables;
  try {
    const rawBody = await req.text();
    if (new TextEncoder().encode(rawBody).byteLength > MAX_REQUEST_BODY_BYTES) {
      return jsonError('Request body is too large.', 413);
    }
    requestBody = asVariables(JSON.parse(rawBody));
  } catch {
    return jsonError('Invalid JSON request body.', 400);
  }

  const method = requestBody.method;
  const variables = asVariables(requestBody.variables);

  if (!isDataApiMethod(method)) {
    return jsonError('Invalid method.', 400);
  }

  try {
    const userId = decodedToken.uid;
    const userResult = await databaseProvider.getUserById({ id: userId });
    const user = userResult.data.user;
    const role = user?.role ? normalizeRole(user.role) : null;

    if (user && method !== 'getUserById' && user.accountStatus !== ACTIVE_ACCOUNT_STATUS) {
      throw new ApiRequestError(
        'Account is not allowed to use the platform.',
        403,
      );
    }

    if (!user && method !== 'createUser' && method !== 'getUserById') {
      throw new ApiRequestError(
        'Complete account registration before using this operation.',
        403,
      );
    }

    if (!canInvokeDataApiMethod(method, role)) {
      throw new ApiRequestError('Access denied.', 403);
    }

    const result = await invokeAllowedMethod({
      method,
      variables,
      userId,
      role,
      tokenEmail: decodedToken.email,
      tokenEmailVerified: Boolean(decodedToken.email_verified),
      tokenDisplayName:
        typeof decodedToken.name === 'string' ? decodedToken.name : undefined,
      existingUser: user,
    });

    return NextResponse.json(result, {
      headers: {
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    if (error instanceof ApiRequestError) {
      return jsonError(error.message, error.status);
    }

    console.error('API Data Error:', error);
    return jsonError('Unable to complete the requested operation.', 500);
  }
}
