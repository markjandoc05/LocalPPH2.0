'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase/config';
import { getUserById } from '../data-connect';
import { useRouter, usePathname } from 'next/navigation';
import { canAccessAdmin, canManageBusiness, isBusiness, isSubscriber, normalizeRole, ROLES } from './roles';

interface AuthContextType {
  user: User | null;
  role: string | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  role: null,
  loading: true,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        
        try {
          let userRole: string = ROLES.SUBSCRIBER;
          if (firebaseUser.email === 'markjandoc@gmail.com') {
            userRole = ROLES.ADMIN;
          } else {
            const userData = await getUserById({ id: firebaseUser.uid });
            userRole = normalizeRole(userData?.data?.user?.role || ROLES.SUBSCRIBER);
          }
          setRole(userRole);
        } catch (error) {
          console.error("Failed to fetch user role", error);
          const userRole = firebaseUser.email === 'markjandoc@gmail.com' ? ROLES.ADMIN : ROLES.SUBSCRIBER;
          setRole(userRole);
        } finally {
          setLoading(false);
        }
      } else {
        setUser(null);
        setRole(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Route Protection Logic
  useEffect(() => {
    if (loading) return;

    const isAuthRoute = pathname.startsWith('/auth/');
    
    if (!user && !isAuthRoute && pathname !== '/') {
      // Not logged in, trying to access protected route -> go to login
      // router.push('/auth/login');
      // For now, let's just protect specific paths
      if (pathname.startsWith('/admin') || pathname.startsWith('/dashboard') || pathname.startsWith('/business/listings') || pathname === '/business' || pathname.startsWith('/profile')) {
        router.push('/auth/login');
      }
    } else if (user && isAuthRoute) {
      // Logged in, trying to access auth pages -> redirect to correct dashboard
      if (canAccessAdmin(role)) {
        router.push('/admin');
      } else if (isBusiness(role)) {
        router.push('/business');
      } else {
        router.push('/dashboard');
      }
    } else if (user) {
      // Check role-based access
      if (pathname.startsWith('/admin') && !canAccessAdmin(role)) {
        if (isBusiness(role)) router.push('/business');
        else router.push('/dashboard');
      } else if ((pathname.startsWith('/business/listings') || pathname === '/business') && !canManageBusiness(role)) {
        router.push('/dashboard');
      } else if (pathname.startsWith('/dashboard') && !isSubscriber(role)) {
        // Business and Admin have their own dashboards
        if (isBusiness(role)) router.push('/business');
        if (canAccessAdmin(role)) router.push('/admin');
      }
    }
  }, [user, role, loading, pathname, router]);

  return (
    <AuthContext.Provider value={{ user, role, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
