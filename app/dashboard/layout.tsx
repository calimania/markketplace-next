'use client';

import { markketClient } from '@/markket/api';
import { useEffect, useState } from 'react';
// import { Paper, Select, Group, Avatar, Text } from '@mantine/core';
import { Store } from '@/markket/store';
import { useAuth } from '@/app/providers/auth.provider';
import { useRouter } from 'next/navigation';

type StoreOption = {
  value: string;
  label: string;
  image: string | undefined;
  slug: string;
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [stores, setStores] = useState<Store[]>([]);
  const [selectedStore, setSelectedStore] = useState<string | null>(null);
  const [, setStoreOptions] = useState<StoreOption[]>([]);
  const [, setStore] = useState<Store | null>(null);

  const { confirmed, } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const x = confirmed();

    if (!x) {
      return router.replace('/auth');
    }
  }, [confirmed, router]);

  useEffect(() => {
    setStoreOptions(stores.map((store) => ({
      value: store?.id?.toString(),
      label: store?.title,
      image: store?.Favicon?.url || store?.Logo?.formats?.small?.url,
      slug: store?.slug,
    })));
  }, [stores]);

  useEffect(() => {

    if (!selectedStore) return;

    const store = stores.find((s) => s.id.toString() === selectedStore);

    if (store) {
      setStore(store);
    }
  }, [selectedStore, stores]);

  const getStores = async () => {
    const markket = new markketClient();
    try {
      const stores = await markket.fetch('/api/markket/store', {});
      setStores(stores?.data || []);

      if (stores?.data?.[0]) {
        setSelectedStore(stores.data[0].id.toString());
      }
    } catch (error) {
      console.error('Failed to fetch stores:', error);
    }
  };

  useEffect(() => {
    getStores();
  }, []);

  return (
    <>
      {children}
    </>
  );
};
