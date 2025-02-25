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
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: () => {},
  logout: () => {},
  isLoading: true,
  refreshUser: async () => { },
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
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

  const logout = () => {
    setUser(null);
    localStorage.removeItem('markket.auth');
    router.push('/auth/login');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
