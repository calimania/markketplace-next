'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: number;
  username: string;
  email: string;
  jwt: string;
}

interface AuthContextType {
  user: User | null;
  login: (userData: User) => void;
  logout: () => void;
  isLoading: boolean;
  isLoggedIn: () => boolean; // Function to check if user is logged in
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: () => {},
  logout: () => {},
  isLoading: true,
  isLoggedIn: () => false,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);  // Track client-side rendering
  const router = useRouter();

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
  }, []);

  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem('markket.auth', JSON.stringify(userData));
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
    <AuthContext.Provider value={{ user, login, logout, isLoading, isLoggedIn }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
