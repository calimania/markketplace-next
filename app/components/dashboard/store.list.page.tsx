'use client';

import DashboardCMS from '@/app/components/dashboard/cms';
import { useContext } from 'react';
import { DashboardContext } from '@/app/providers/dashboard.provider';
import { useAuth } from '@/app/providers/auth.provider';

const StoreListPage = () => {
  const { store , isLoading,} = useContext(DashboardContext);
  const { stores } = useAuth()

  console.log({ isLoading, stores })
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
