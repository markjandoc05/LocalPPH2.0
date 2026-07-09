/**
 * User Roles Enum mapping to PostgreSQL roles
 */
export const ROLES = {
  ADMIN: 'ADMIN',
  MODERATOR: 'MODERATOR',
  BUSINESS: 'BUSINESS',
  SUBSCRIBER: 'SUBSCRIBER',
} as const;

export type UserRole = typeof ROLES[keyof typeof ROLES];

// Normalize role from DB/Firebase to standard uppercase ROLES
export function normalizeRole(role?: string | null): string {
  if (!role) return ROLES.SUBSCRIBER;
  const r = role.trim().toUpperCase();
  if (r === 'ADMIN' || r === 'ADMINISTRATOR') return ROLES.ADMIN;
  if (r === 'MODERATOR') return ROLES.MODERATOR;
  if (r === 'BUSINESS' || r === 'BUSINESS ACCOUNT' || r === 'BUSINESS_ACCOUNT') return ROLES.BUSINESS;
  if (r === 'SUBSCRIBER' || r === 'PERSONAL' || r === 'SUBSCRIBER_ACCOUNT') return ROLES.SUBSCRIBER;
  return r; // fallback
}

// Core Role Checks
export const isAdmin = (role?: string | null): boolean => normalizeRole(role) === ROLES.ADMIN;
export const isModerator = (role?: string | null): boolean => normalizeRole(role) === ROLES.MODERATOR;
export const isSubscriber = (role?: string | null): boolean => normalizeRole(role) === ROLES.SUBSCRIBER;
export const isBusiness = (role?: string | null): boolean => normalizeRole(role) === ROLES.BUSINESS;

// Compound Role Checks
export const isAdminOrModerator = (role?: string | null): boolean => isAdmin(role) || isModerator(role);

// Permission Checks
export const canAccessAdmin = (role?: string | null): boolean => isAdminOrModerator(role);
export const canManageBusiness = (role?: string | null): boolean => isBusiness(role) || isAdmin(role);
export const canApproveBusiness = (role?: string | null): boolean => isAdminOrModerator(role);
export const canEditOwnBusiness = (role?: string | null): boolean => isBusiness(role);

export const getRedirectPath = (role?: string | null): string => {
  const r = normalizeRole(role);
  if (canAccessAdmin(r)) return '/admin';
  if (isBusiness(r)) return '/business';
  return '/dashboard';
};
