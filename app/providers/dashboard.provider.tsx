import { createContext  } from 'react';
import { Store } from '@/markket/store';

/**
 * DashboardContext
 * This context is used to provide the store to the dashboard components
 *
 * Each dashboard page must be related to a store, and stores are tied to users via their accounts,
 * SuperAdmins can attach users to stores, and users can have multiple stores
 *
 * @TODO: users can invite other users to their stores, and they can accept or reject the invitation
 *
 * @returns {React.Context<null | { store: Store }>} - The DashboardContext
 */
export const DashboardContext = createContext(null as (null | { store: Store }));

