'use client';

import DashboardCMS from '@/app/components/dashboard/cms';
import { useContext, useEffect } from 'react';
import { DashboardContext } from '@/app/providers/dashboard.provider';
import { useAuth } from '@/app/providers/auth.provider';

const StoreListPage = () => {
  const { store , isLoading,} = useContext(DashboardContext);
  const { stores, fetchStores } = useAuth()

  useEffect(() => {
    fetchStores()
  }, [fetchStores]);

  return (
    <DashboardCMS
      singular="store"
      plural="stores"
      items={stores}
      loading={isLoading}
      description={'Electromechanical eCommerce Stores'}
      store={store}
    ></DashboardCMS>
  );
};

export default StoreListPage;
