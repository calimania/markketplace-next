'use client';

import { useContext } from 'react';
import { DashboardContext } from '@/app/providers/dashboard.provider';
import ViewItem from '@/app/components/dashboard/actions/item.view';

export default function StoreDashboardPage() {
  const { store, } = useContext(DashboardContext);

  if (store) {
    return <ViewItem item={store} store={store} singular="store" />;
  }
};
