import { createContext  } from 'react';
import { Store, StripeAccount } from '@/markket';
import { useState } from 'react';

/**
 * DashboardContext
 * This context is used to provide account information to the dashboard components
 *
 * Each dashboard page must be related to a store, and stores are tied to users via their accounts,
 * SuperAdmins can attach users to stores, and users can have multiple stores
 *
 *
 * @returns {React.Context<null | { store: Store }>} - The DashboardContext
 */
export const DashboardContext = createContext(null as (null | { store: Store, stripe?: StripeAccount, isLoading?: boolean }));

export function DashboardProvider({ children, store }: { children: React.ReactNode, store?: Store }) {
  const [stripe, setStripe] = useState<StripeAccount | undefined>(undefined);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  return (
    <DashboardContext.Provider value={{ store: store as Store, stripe, isLoading }}>
      {children}
    </DashboardContext.Provider>
  );
}
