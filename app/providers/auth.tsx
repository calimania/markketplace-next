"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useRouter } from "next/navigation";
import { strapiClient, markketClient } from "@/markket/api";
import { Store } from "@/markket/store";

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
}

interface AuthContextType {
  user: User | null;
  login: (userData: User) => void;
  logout: () => void;
  isLoading: boolean;
  isLoggedIn: () => boolean; // Function to check if user is logged in
  maybe: () => boolean;
  refreshUser: () => Promise<void>;
  stores: Store[];
  fetchStores: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: () => {},
  logout: () => {},
  isLoading: true,
  isLoggedIn: () => false,
  maybe: () => false,
  refreshUser: async () => {},
  stores: [],
  fetchStores: async () => {},
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
  const [isClient, setIsClient] = useState(false); // Track client-side rendering
  const router = useRouter();
  const [stores, setStores] = useState<Store[]>([]);

  const fetchStores = useCallback(async () => {
    if (!maybe()) return;

    try {
      const client = new markketClient();
      const response = await client.fetch("/api/markket/store", {});
      const { data } = response;
      setStores(data || []);
    } catch (error) {
      console.error("Failed to fetch stores:", error);
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem("markket.auth");
    router.push("/auth/");
  }, [router]);

  const verifyAndRefreshUser = useCallback(async () => {
    try {
      const userData = await strapiClient.me();
      if (userData) {
        const storedAuth = localStorage.getItem("markket.auth");
        const { jwt } = JSON.parse(storedAuth || "{}");
        setUser({ ...userData, jwt });
      }
    } catch (error) {
      console.error("Auth verification failed:", error);
      logout();
    }
  }, [logout]);

  useEffect(() => {
    // Check if we are in the client-side
    setIsClient(true);

    // Check for stored auth data on mount (client-side only)
    const storedAuth = localStorage.getItem("markket.auth");
    if (storedAuth) {
      const parsedUser: User = JSON.parse(storedAuth);
      setUser(parsedUser);
    }

    setIsLoading(false);
    const initAuth = async () => {
      const storedAuth = localStorage.getItem("markket.auth");
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
    localStorage.setItem("markket.auth", JSON.stringify(userData));
  };

  const maybe = () => {
    if (!localStorage) {
      return false;
    }

    const _string = localStorage.getItem("markket.auth");

    return !!_string;
  };

  // Function to check if user is logged in
  const isLoggedIn = (): boolean => {
    if (isClient) {
      return !!localStorage.getItem("markket.auth");
    }
    return false;
  };

  const value = {
    user,
    login,
    maybe,
    logout,
    isLoading,
    refreshUser,
    stores,
    fetchStores,
    isLoggedIn,
  };

  <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
