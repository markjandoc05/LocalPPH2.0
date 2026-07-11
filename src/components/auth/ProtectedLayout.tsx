'use client';

import { useAuth } from '@/lib/auth/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { ROLES, normalizeRole } from '@/lib/auth/roles';

export const ProtectedLayout = ({ 
  children, 
  allowedRoles = [ROLES.ADMIN, ROLES.MODERATOR, ROLES.BUSINESS, ROLES.SUBSCRIBER]
}: { 
  children: React.ReactNode; 
  allowedRoles?: string[]; 
}) => {
  const { user, role, loading } = useAuth();
  const router = useRouter();
  const normalizedAllowedRoles = allowedRoles.map(normalizeRole);
  const allowedRolesKey = normalizedAllowedRoles.join('|');

  useEffect(() => {
    const canAccessRole = role ? allowedRolesKey.split('|').includes(normalizeRole(role)) : false;

    if (!loading && !user) {
      router.replace('/auth/login');
    } else if (!loading && user && role && !canAccessRole) {
      // If user is authenticated but doesn't have the required role, redirect to a reasonable place
      router.replace('/dashboard');
    }
  }, [user, role, loading, router, allowedRolesKey]);

  if (loading || (user && !role)) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!user || (role && !normalizedAllowedRoles.includes(normalizeRole(role)))) {
    return null;
  }

  return <>{children}</>;
};
