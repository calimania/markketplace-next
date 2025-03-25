'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { strapiClient, markketClient } from '@/markket/api';
import { Store } from '@/markket/store'

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
  stores: Store[];
  fetchStores: () => Promise<void>;
  confirmed: () => boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: () => {},
  logout: () => {},
  isLoading: true,
  maybe: () => false,
  refreshUser: async () => { },
  stores: [],
  fetchStores: async () => { },
  confirmed: () => false,
});

/**
 * Provider to manage authentication state, and stores associated with the user
 *
 * @param props
 * @returns
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const [stores, setStores] = useState<Store[]>([]);

  const fetchStores = useCallback(async () => {
    if (!maybe()) return;

    try {
      const client = new markketClient();
      const response = await client.fetch('/api/markket/store', {});
      const { data } = response;
      setStores(data || []);
    } catch (error) {
      console.error('Failed to fetch stores:', error);
    }
  }, []);

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

  useEffect(() => {
    if (user?.id) {
      fetchStores();
    }

  }, [user?.id, fetchStores]);

  const refreshUser = async () => {
    await verifyAndRefreshUser();
  };

  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem('markket.auth', JSON.stringify(userData));
  };

  const maybe = () => {
    if (typeof localStorage == 'undefined') {
      return false;
    }

    const _string = localStorage.getItem('markket.auth');

    return !!_string;
  };

  const confirmed = () => {
    if (typeof localStorage == 'undefined') {
      return false;
    }

    const _string = localStorage.getItem('markket.auth');

    const _json = JSON.parse(_string || '{}');

    return !!_json?.jwt;
  };

  const value = {
    user,
    login,
    maybe,
    logout,
    confirmed,
    isLoading,
    refreshUser,
    stores,
    fetchStores,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
