'use client';

import { useContext, useEffect, useState } from 'react';
import { DashboardContext } from '@/app/providers/dashboard.provider';
import ViewItem from '@/app/components/dashboard/actions/item.view';
import { Skeleton } from '@mantine/core';

export default function StoreDashboardPage() {
  const { store, } = useContext(DashboardContext);
  const [isLoading, setIsLoading] = useState(0);

  useEffect(() => {
    setIsLoading(store?.id);

    setTimeout(() => {
      setIsLoading(0);
    }, 160);
  }, [store?.id])

  if (isLoading) {
    return (
      <>
        <Skeleton height={50} circle mb="xl" />
        <Skeleton height={8} radius="xl" />
        <Skeleton height={8} mt={6} radius="xl" />
        <Skeleton height={8} mt={6} width="70%" radius="xl" />
      </>
    );
  }

  if (store) {
    return <ViewItem item={store} store={store} singular="store" previewUrl={`/store/${store.slug}`} />;
  }
};
