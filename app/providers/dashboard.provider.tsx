import { createContext  } from 'react';
import { Store, StripeAccount } from '@/markket';
import { useState, useEffect } from 'react';
import { markketConfig } from '@/markket/config';

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
  const [stripe, setAccount] = useState<StripeAccount | undefined>(undefined);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [lastId, setLastId] = useState<string | null>(null);

  useEffect(() => {
    const getAccountData = async (store_id: string) => {
      if (lastId === store_id) {
        return;
      }

      setLastId(store_id);
      setIsLoading(true);

      try {
        const response = await fetch(new URL('/api/markket', markketConfig.api), {
          body: JSON.stringify({
            action: 'stripe.account',
            store_id: store_id,
          }),
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        const { data } = await response.json();
        setAccount(data);
      } catch (error) {
        console.error('Failed to fetch Stripe account:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (store?.documentId) {
      getAccountData(store.documentId);
    }
  }, [store?.documentId, lastId]);

  return (
    <DashboardContext.Provider value={{ store: store as Store, stripe, isLoading }}>
      {children}
    </DashboardContext.Provider>
  );
}
