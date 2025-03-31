import { createContext  } from 'react';
import { Store, StripeAccount } from '@/markket';
import { useState, useEffect } from 'react';
import { markketConfig } from '@/markket/config';

export type DashboardContextType = { store: Store, stripe: StripeAccount, isLoading: boolean, setSelectedStore: (store: Store) => void };

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
export const DashboardContext = createContext({ isLoading: false, store: {}, stripe: {} } as DashboardContextType);

export function DashboardProvider({ children, store }: { children: React.ReactNode, store?: Store }) {
  const [stripe, setAccount] = useState<StripeAccount>({} as StripeAccount);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [lastId, setLastId] = useState<string | null>(null);

  const [selectedStore, setSelectedStore] = useState<Store>(store as Store);

  useEffect(() => {
    if (store) {
      setSelectedStore(store);
    }
  }, [store]);

  useEffect(() => {
    const getAccountData = async (store_id: string) => {
      if (lastId === store_id) {
        setIsLoading(false);
        return;
      }

      setLastId(store_id);
      setIsLoading(true);

      try {
        const response = await fetch(new URL('/api/markket?stripe', markketConfig.api), {
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
      }

      setIsLoading(false);

    };

    if (store?.STRIPE_CUSTOMER_ID && store?.documentId) {
      getAccountData(store.documentId);
    }
  }, [store, lastId]);

  return (
    <DashboardContext.Provider value={{ store: selectedStore as Store, stripe, isLoading, setSelectedStore }}>
      {children}
    </DashboardContext.Provider>
  );
}
