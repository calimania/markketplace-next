'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { strapiClient } from '@/markket/api';

interface User {
  id: number;
  username: string;
  email: string;
  jwt: string;
  bio?: string;
  displayName?: string;
  createdAt?: string;
  avatar?: {
    url: string;
  };
};

interface AuthContextType {
  user: User | null;
  login: (userData: User) => void;
  logout: () => void;
  isLoading: boolean;
  maybe: () => boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: () => {},
  logout: () => {},
  isLoading: true,
  maybe: () => false,
  refreshUser: async () => { },
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();


  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('markket.auth');
    router.push('/auth/');
  }, [router]);

  const verifyAndRefreshUser = useCallback(async () => {
    try {
      const userData = await strapiClient.me();
      if (userData) {
        const storedAuth = localStorage.getItem('markket.auth');
        const { jwt } = JSON.parse(storedAuth || '{}');
        setUser({ ...userData, jwt });
      }
    } catch (error) {
      console.error('Auth verification failed:', error);
      logout();
    }
  }, [logout]);

  useEffect(() => {
    const initAuth = async () => {
      const storedAuth = localStorage.getItem('markket.auth');
      if (storedAuth) {
        await verifyAndRefreshUser();
      }
      setIsLoading(false);
    };

    initAuth();
  }, [verifyAndRefreshUser]);

  const refreshUser = async () => {
    await verifyAndRefreshUser();
  };

  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem('markket.auth', JSON.stringify(userData));
  };

  const maybe = () => {
    if (!localStorage) {
      return false;
    }

    const _string = localStorage.getItem('markket.auth');

    return !!_string;
  };


  return (
    <AuthContext.Provider value={{ user, login, maybe, logout, isLoading, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
