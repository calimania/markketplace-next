'use client';

import { useContext, useEffect, useState } from 'react';
import { DashboardContext } from '@/app/providers/dashboard.provider';
import ViewItem from '@/app/components/dashboard/actions/item.view';
import { Skeleton, Container, Stack, Group, Button, } from '@mantine/core';
import { useRouter } from 'next/navigation';
import { IconBuildingStore } from '@tabler/icons-react';

export default function StoreDashboardPage() {
  const { store, } = useContext(DashboardContext);
  const [isLoading, setIsLoading] = useState(0);
  const router = useRouter();

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
    return (<>
      <Container size="lg" pt="md" pb="xs">
        <Stack gap="sm">
          <Group justify="space-between">
            <Button
              variant="light"
              leftSection={<IconBuildingStore size={16} />}
              onClick={() => router.push(`/dashboard/stores`)}
            >
              Your stores
            </Button>
          </Group>
        </Stack>
      </Container>
      <ViewItem item={store} store={store} singular="store" previewUrl={`/store/${store.slug}`} />
    </>);
  }
};
