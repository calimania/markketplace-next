'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
// import { strapiClient } from '@/markket/api';

interface User {
  id: number;
  username: string;
  email: string;
  jwt: string;
  bio?: string;
  displayName?: string;
  avatar?: {
    url: string;
  };
}

interface AuthContextType {
  user: User | null;
  login: (userData: User) => void;
  logout: () => void;
  isLoading: boolean;
  isLoggedIn: () => boolean; // Function to check if user is logged in
  maybe: () => boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: () => {},
  logout: () => {},
  isLoading: true,
  isLoggedIn: () => false,
  maybe: () => false,
  refreshUser: async () => { },
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);  // Track client-side rendering
  const router = useRouter();

  const verifyAndRefreshUser = async () => {
    // try {
    //   const isValid = await strapiClient.verifyToken();
    //   if (!isValid) {
    //     logout();
    //     return;
    //   }

    //   const userData = await strapiClient.getMe();
    //   if (userData) {
    //     const storedAuth = localStorage.getItem('markket.auth');
    //     const { jwt } = JSON.parse(storedAuth || '{}');
    //     setUser({ ...userData, jwt });
    //   }
    // } catch (error) {
    //   console.error('Auth verification failed:', error);
    //   logout();
    // }
  };

  useEffect(() => {
    // Check if we are in the client-side
    setIsClient(true);

    // Check for stored auth data on mount (client-side only)
    const storedAuth = localStorage.getItem('markket.auth');
    if (storedAuth) {
      const parsedUser: User = JSON.parse(storedAuth);
      setUser(parsedUser);
    }

    setIsLoading(false);
    const initAuth = async () => {
      const storedAuth = localStorage.getItem('markket.auth');
      if (storedAuth) {
        await verifyAndRefreshUser();
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const refreshUser = async () => {
    await verifyAndRefreshUser();
  };

  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem('markket.auth', JSON.stringify(userData));
  };

  const maybe = () => {
    const _string = localStorage.getItem('markket.auth');

    return !!_string;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('markket.auth');
    router.push('/auth/login');
  };

  // Function to check if user is logged in
  const isLoggedIn = (): boolean => {
    if (isClient) {
      return !!localStorage.getItem('markket.auth');
    }
    return false;
  };

  return (
    <AuthContext.Provider value={{ user, login, maybe, logout, isLoading, refreshUser, isLoggedIn }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
