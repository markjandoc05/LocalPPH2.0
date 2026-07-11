'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../firebase/config';
import { createUser, getUserById } from '../data-connect';
import { normalizeRole, ROLES } from './roles';
import { isProfileComplete } from './profile-completion';
import { BANNED_ACCOUNT_MESSAGE, BLOCKED_ACCOUNT_MESSAGE } from './auth-utils';

interface AuthContextType {
  user: User | null;
  userData: any | null;
  role: string | null;
  profileComplete: boolean;
  loading: boolean;
  refreshUserProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userData: null,
  role: null,
  profileComplete: false,
  loading: true,
  refreshUserProfile: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<any | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [profileComplete, setProfileComplete] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadUserProfile = async (firebaseUser: User) => {
    const fallbackRole = firebaseUser.email === 'markjandoc@gmail.com' ? ROLES.ADMIN : ROLES.SUBSCRIBER;

    try {
      const response = await getUserById({ id: firebaseUser.uid });
      let dbUser = response?.data?.user || null;

      if (!dbUser) {
        await createUser({
          id: firebaseUser.uid,
          email: firebaseUser.email || '',
          displayName: firebaseUser.displayName || firebaseUser.email || 'User',
          photoUrl: firebaseUser.photoURL || undefined,
          role: fallbackRole,
        });

        const refreshedResponse = await getUserById({ id: firebaseUser.uid });
        dbUser = refreshedResponse?.data?.user || null;
      }

      if (dbUser?.accountStatus && dbUser.accountStatus !== 'ACTIVE') {
        if (typeof window !== 'undefined') {
          window.sessionStorage.setItem(
            'localpages.authMessage',
            dbUser.accountStatus === 'BANNED' ? BANNED_ACCOUNT_MESSAGE : BLOCKED_ACCOUNT_MESSAGE,
          );
        }
        await signOut(auth);
        setUser(null);
        setUserData(null);
        setRole(null);
        setProfileComplete(false);
        return;
      }

      const nextRole = firebaseUser.email === 'markjandoc@gmail.com'
        ? ROLES.ADMIN
        : normalizeRole(dbUser?.role || fallbackRole);

      setUserData(dbUser);
      setRole(nextRole);
      setProfileComplete(isProfileComplete(dbUser));
    } catch (error) {
      console.warn("Failed to fetch user profile", error);
      setUserData(null);
      setRole(fallbackRole);
      setProfileComplete(false);
    }
  };

  const refreshUserProfile = async () => {
    if (!auth.currentUser) return;
    await loadUserProfile(auth.currentUser);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        await loadUserProfile(firebaseUser);
        setLoading(false);
      } else {
        setUser(null);
        setUserData(null);
        setRole(null);
        setProfileComplete(false);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, userData, role, profileComplete, loading, refreshUserProfile }}>
      {children}
    </AuthContext.Provider>
  );
};
