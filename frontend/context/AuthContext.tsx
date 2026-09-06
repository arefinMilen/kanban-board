'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  fetchApi,
  setAccessToken,
  setRefreshToken,
  getRefreshToken,
  clearTokens,
  getAccessToken,
} from '@/lib/api';

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt?: string;
}

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    async function initAuth() {
      const refreshToken = getRefreshToken();
      if (refreshToken) {
        try {
          const data = await fetchApi<{ accessToken: string; refreshToken: string }>('/auth/refresh', {
            method: 'POST',
            body: JSON.stringify({ refreshToken }),
            skipAuth: true,
          });

          setAccessToken(data.accessToken);
          if (data.refreshToken) {
            setRefreshToken(data.refreshToken);
          }
          setToken(data.accessToken);

          // Fetch logged in user profile
          const profile = await fetchApi<User>('/auth/me');
          setUser(profile);
        } catch (e) {
          console.error('Session restore failed:', e);
          clearTokens();
          setUser(null);
          setToken(null);
        }
      }
      setIsLoading(false);
    }

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const data = await fetchApi<{
      user: User;
      accessToken: string;
      refreshToken: string;
    }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
      skipAuth: true,
    });

    setAccessToken(data.accessToken);
    setRefreshToken(data.refreshToken);
    setToken(data.accessToken);
    setUser(data.user);

    router.push('/boards');
  };

  const register = async (email: string, password: string, name: string) => {
    const data = await fetchApi<{
      user: User;
      accessToken: string;
      refreshToken: string;
    }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
      skipAuth: true,
    });

    setAccessToken(data.accessToken);
    setRefreshToken(data.refreshToken);
    setToken(data.accessToken);
    setUser(data.user);

    router.push('/boards');
  };

  const logout = () => {
    clearTokens();
    setUser(null);
    setToken(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken: token,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
