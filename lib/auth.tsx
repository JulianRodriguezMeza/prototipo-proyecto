import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

export type UserRole = 'student' | 'admin' | 'auxiliar';

export type AuthUser = {
  username: string;
  displayName?: string;
  role: UserRole;
};

type AuthContextValue = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  signIn: (user: AuthUser) => void;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);

  const signIn = useCallback((nextUser: AuthUser) => {
    setUser(nextUser);
  }, []);

  const signOut = useCallback(() => {
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      signIn,
      signOut,
    }),
    [signIn, signOut, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export function inferRoleFromUsername(username: string): UserRole {
  const normalized = username.trim().toLowerCase();
  if (!normalized) return 'student';
  if (normalized.includes('admin') || normalized.startsWith('adm')) return 'admin';
  if (normalized.includes('auxiliar') || normalized.startsWith('aux')) return 'auxiliar';
  return 'student';
}
