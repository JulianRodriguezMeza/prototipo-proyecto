import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type UserRole = 'student' | 'admin' | 'auxiliar';

export type AuthUser = {
  username: string;
  displayName?: string;
  role: UserRole;
};

type AuthContextValue = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isAuthLoading: boolean;
  signIn: (user: AuthUser) => void;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  useEffect(() => {
    const loadSession = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('user_session');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error('Error cargando la sesión', error);
      } finally {
        setIsAuthLoading(false);
      }
    };
    loadSession();
  }, []);

  const signIn = useCallback(async (nextUser: AuthUser) => {
    setUser(nextUser);
    try {
      await AsyncStorage.setItem('user_session', JSON.stringify(nextUser));
    } catch (error) {
      console.error('Error guardando la sesión', error);
    }
  }, []);

  const signOut = useCallback(async () => {
    setUser(null);
    try {
      await AsyncStorage.removeItem('user_session');
    } catch (error) {
      console.error('Error eliminando la sesión', error);
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isAuthLoading,
      signIn,
      signOut,
    }),
    [signIn, signOut, user, isAuthLoading]
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
