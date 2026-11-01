import React, {
  createContext, useContext, useState, useEffect, type ReactNode,
} from 'react';
import type { User } from '@/types';
import { getCurrentUser, logout as logoutApi } from '@/services/api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: User, token: string) => void;
  updateUser: (user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(() => Boolean(localStorage.getItem('token')));

  useEffect(() => {
    if (!localStorage.getItem('token')) {
      localStorage.removeItem('user');
      setIsLoading(false);
      return;
    }
    let active = true;
    getCurrentUser().then((currentUser) => {
      if (!active) return;
      setUser(currentUser);
      localStorage.setItem('user', JSON.stringify(currentUser));
      setIsLoading(false);
    }).catch(() => {
      if (!active) return;
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      setUser(null);
      setIsLoading(false);
    });
    return () => { active = false; };
  }, []);

  const login = (u: User, token: string) => {
    setUser(u);
    localStorage.setItem('user', JSON.stringify(u));
    localStorage.setItem('token', token);
    setIsLoading(false);
  };

  const updateUser = (u: User) => {
    setUser(u);
    localStorage.setItem('user', JSON.stringify(u));
  };

  const logout = () => {
    logoutApi().catch((error: unknown) => console.error('Could not revoke the server session:', error));
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, updateUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
}
