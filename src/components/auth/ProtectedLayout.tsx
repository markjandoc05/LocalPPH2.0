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

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    } else if (!loading && user && role && !allowedRoles.includes(normalizeRole(role))) {
      // If user is authenticated but doesn't have the required role, redirect to a reasonable place
      router.push('/dashboard'); 
    }
  }, [user, role, loading, router, allowedRoles]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!user || (role && !allowedRoles.includes(normalizeRole(role)))) {
    return null;
  }

  return <>{children}</>;
};
