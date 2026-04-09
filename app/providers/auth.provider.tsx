'use client';

import { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
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
  const pathname = usePathname();
  const [stores, setStores] = useState<Store[]>([]);
  const storesRequestInFlightRef = useRef<Promise<void> | null>(null);
  const lastStoresFetchAtRef = useRef(0);

  const getStorage = useCallback((): Storage | null => {
    if (typeof window === 'undefined') return null;

    const storage = window.localStorage as Storage | undefined;
    if (!storage) return null;
    if (typeof storage.getItem !== 'function') return null;
    if (typeof storage.setItem !== 'function') return null;
    if (typeof storage.removeItem !== 'function') return null;

    return storage;
  }, []);

  const shouldPrefetchStores = useCallback((path: string) => {
    return path.includes('/dashboard') || path.includes('/me') || path.includes('/tienda');
  }, []);


  const clearLocalStorage = (next: string) => {
    const storage = getStorage();
    storage?.removeItem('markket.auth');
    router.push(`/auth?next=${next}`);
  }

  const readLocalStorage = () => {
    const storage = getStorage();
    if (!storage) return null;

    const storedAuth = storage.getItem('markket.auth');

    if (storedAuth) {
      try {
        const parsedAuth = JSON.parse(storedAuth);
        setUser(parsedAuth);
        return parsedAuth;
      } catch (error) {
        console.error('Failed to parse stored auth data:', error);
        storage.removeItem('markket.auth');
      }
    }
    return null;
  }

  const maybe = useCallback(() => {
    const storage = getStorage();
    if (!storage) return false;

    const _string = storage.getItem('markket.auth');

    return !!_string;
  }, [getStorage]);

  const confirmed = useCallback(() => {
    const storage = getStorage();
    if (!storage) return false;

    const _string = storage.getItem('markket.auth');

    const _json = JSON.parse(_string || '{}');

    return !!_json?.jwt;
  }, [getStorage]);

  const fetchStores = useCallback(async () => {
    if (!maybe()) return;

    const now = Date.now();
    // Prevent rapid duplicate calls from StrictMode and multiple consumers.
    if (now - lastStoresFetchAtRef.current < 10_000) return;

    if (storesRequestInFlightRef.current) {
      return storesRequestInFlightRef.current;
    }

    const run = async () => {
      try {
        const client = new markketClient();
        const response = await client.fetch('/api/markket/store', {
          cache: 'no-store'
        });

        setStores(response?.data || []);
        lastStoresFetchAtRef.current = Date.now();
      } catch (error) {
        console.error('Failed to fetch stores:', error);
      } finally {
        storesRequestInFlightRef.current = null;
      }
    };

    storesRequestInFlightRef.current = run();
    return storesRequestInFlightRef.current;
  }, [maybe]);

  const logout = useCallback(() => {
    setUser(null);
    const storage = getStorage();
    storage?.removeItem('markket.auth');
    router.push('/auth/');
  }, [getStorage, router]);

  const verifyAndRefreshUser = useCallback(async () => {
    try {
      readLocalStorage();
      const userData = await strapiClient.me();

      if (userData?.status == 401) {
        clearLocalStorage(`/dashboard`);
        console.error('401:redirecting');
        return;
      }

      if (userData) {
        const storage = getStorage();
        const storedAuth = storage?.getItem('markket.auth');
        const { jwt } = JSON.parse(storedAuth || '{}');
        setUser({ ...userData, jwt });

        // Set stores from user data if available
        // Handle both direct stores and nested data.stores from API
        const storesArray = userData.stores || userData.data?.stores || [];
        if (storesArray.length > 0) {
          setStores(storesArray);
        }
      }
    } catch (error) {
      console.error('Auth verification failed:', error);
      logout();
    }
  }, [getStorage, logout]);

  useEffect(() => {
    const initAuth = async () => {
      await verifyAndRefreshUser();
      setIsLoading(false);
    };

    initAuth();
  }, [verifyAndRefreshUser]);

  useEffect(() => {
    if (!user?.id) return;
    if (!shouldPrefetchStores(pathname)) return;

    fetchStores();
  }, [fetchStores, pathname, shouldPrefetchStores, user?.id]);

  const refreshUser = useCallback(async () => {
    await verifyAndRefreshUser();
  }, [verifyAndRefreshUser]);

  const login = useCallback((userData: User) => {
    setUser(userData);
    const storage = getStorage();
    storage?.setItem('markket.auth', JSON.stringify(userData));
  }, [getStorage]);

  const value = useMemo(() => ({
    user,
    login,
    maybe,
    logout,
    confirmed,
    isLoading,
    refreshUser,
    stores,
    fetchStores,
  }), [user, login, maybe, logout, confirmed, isLoading, refreshUser, stores, fetchStores]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
