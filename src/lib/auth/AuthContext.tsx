'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase/config';
import { getUserById } from '../data-connect';
import { normalizeRole, ROLES } from './roles';

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

  return (
    <AuthContext.Provider value={{ user, role, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
