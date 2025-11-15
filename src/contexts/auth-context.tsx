/**
 * Authentication context for managing user state across the app
 */

import { createContext, useEffect, useState, type ReactNode } from 'react';
import type { User } from '@/types';
import { onAuthStateChange, getCurrentUser } from '@/services/auth.service';

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isTeacher: boolean;
  refreshUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Subscribe to auth state changes
    const unsubscribe = onAuthStateChange((user) => {
      setUser(user);
      setLoading(false);
    });

    // Cleanup subscription
    return () => unsubscribe();
  }, []);

  const refreshUser = async () => {
    const updatedUser = await getCurrentUser();
    setUser(updatedUser);
  };

  const value: AuthContextType = {
    user,
    loading,
    isAuthenticated: user !== null,
    isAdmin: user?.role === 'admin',
    isTeacher: user?.role === 'teacher',
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
