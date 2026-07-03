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

// Core Role Checks
export const isAdmin = (role?: string | null): boolean => role === ROLES.ADMIN;
export const isModerator = (role?: string | null): boolean => role === ROLES.MODERATOR;
export const isSubscriber = (role?: string | null): boolean => role === ROLES.SUBSCRIBER;
export const isBusiness = (role?: string | null): boolean => role === ROLES.BUSINESS;

// Compound Role Checks
export const isAdminOrModerator = (role?: string | null): boolean => isAdmin(role) || isModerator(role);

// Permission Checks
export const canAccessAdmin = (role?: string | null): boolean => isAdminOrModerator(role);
export const canManageBusiness = (role?: string | null): boolean => isBusiness(role) || isAdmin(role);
export const canApproveBusiness = (role?: string | null): boolean => isAdminOrModerator(role);
export const canEditOwnBusiness = (role?: string | null): boolean => isBusiness(role);
