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

  // const handleStoreChange = (storeId: string | null) => {
  //   if (!storeId) return;

  //   setSelectedStore(storeId);
  //   const store = stores.find(s => s.id.toString() === storeId);
  //   if (store) {
  //     // Update URL with store slug
  //     const newPath = pathname.replace(/\/dashboard\/(.+)/, `/dashboard/${store.slug}/$1`);
  //     router.push(newPath);
  //   }
  // };

  useEffect(() => {
    getStores();
  }, []);

  return (
    <>
      {/* {stores.length > 0 && (
        <Paper shadow="sm" p="md" withBorder mb="xl">
          <Group justify="end" >
            <Text size="sm" fw={500} c="dimmed">
              {store?.title} |
              Select Store
            </Text>
            <Select
              value={selectedStore}
              onChange={(value) => {
                setSelectedStore(value);
              }}
              data={storeOptions}
              placeholder="Choose store"
              clearable={false}
              maxDropdownHeight={400}
              comboboxProps={{ withinPortal: true }}
              renderOption={(item) => {
                const storeItem = item as unknown as StoreOption;
                return (
                  <Group gap="sm">
                    <Avatar
                      src={storeItem.image}
                      size={20}
                      radius="xl"
                    />
                    <span>{storeItem.label}</span>
                  </Group>
                );
              }}
            />
          </Group>
        </Paper>
      )} */}
      {children}
    </>
  );
};
