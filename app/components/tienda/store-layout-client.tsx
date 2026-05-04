'use client';

import { useEffect, useMemo } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Button, Container, Paper, Skeleton, Stack, Text, ThemeIcon } from '@mantine/core';
import { IconLock } from '@tabler/icons-react';
import CompactBreadcrumbs from './compact-breadcrumbs';
import type { Store } from '@/markket/store';
import { useAuth } from '@/app/providers/auth.provider';

interface StoreLayoutClientProps {
  children: React.ReactNode;
  store: Store;
}

/**
 * StoreLayoutClient
 *
 * Client-side wrapper for the store layout, providing:
 * - Compact breadcrumbs in embedded mode
 * - Responsive spacing
 */
export default function StoreLayoutClient({ children, store }: StoreLayoutClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { confirmed, isLoading, stores, fetchStores } = useAuth();

  const isConfirmed = confirmed();
  const isAuthorized = useMemo(() => {
    return stores.some((candidate) => candidate.slug === store.slug || candidate.documentId === store.documentId);
  }, [stores, store.documentId, store.slug]);

  const ownershipLoading = isConfirmed && stores.length === 0;

  useEffect(() => {
    if (!isLoading && isConfirmed && stores.length === 0) {
      fetchStores({ force: true });
    }
  }, [fetchStores, isConfirmed, isLoading, stores.length]);

  useEffect(() => {
    if (isLoading) return;
    if (isConfirmed) return;

    const next = encodeURIComponent(pathname || `/tienda/${store.slug}`);
    router.replace(`/auth?next=${next}`);
  }, [isConfirmed, isLoading, pathname, router, store.slug]);

  if (isLoading || ownershipLoading || !isConfirmed) {
    return (
      <>
        <CompactBreadcrumbs storeSlug={store.slug} />
        <Container size="md" py="xl">
          <Stack gap="md">
            <Paper withBorder radius="md" p="md">
              <Stack gap="sm">
                <Text c="dimmed" size="sm">Checking access...</Text>
                <Skeleton height={14} width="45%" radius="xl" />
                <Skeleton height={10} width="70%" radius="xl" />
              </Stack>
            </Paper>

            <Paper withBorder radius="md" p="md">
              <Stack gap="sm">
                <Skeleton height={16} width="35%" radius="xl" />
                <Skeleton height={12} radius="xl" />
                <Skeleton height={12} width="85%" radius="xl" />
                <Skeleton height={12} width="60%" radius="xl" />
              </Stack>
            </Paper>
          </Stack>
        </Container>
      </>
    );
  }

  if (!isAuthorized) {
    return (
      <Container size="sm" py="xl">
        <Paper withBorder radius="md" p="xl">
          <Stack align="center" gap="sm">
            <ThemeIcon size={52} radius="xl" variant="light" color="red">
              <IconLock size={24} />
            </ThemeIcon>
            <Text fw={700}>You don&apos;t have access to this store</Text>
            <Text size="sm" c="dimmed" ta="center">
              Sign in with the owner account for {store.title || store.slug}, or open one of your own stores.
            </Text>
            <Button variant="light" onClick={() => router.push('/tienda')}>Go to Tienda</Button>
          </Stack>
        </Paper>
      </Container>
    );
  }

  return (
    <>
      <CompactBreadcrumbs storeSlug={store.slug} />
      <Container size="md" py="xl">
        <Stack gap="md">
          {children}
        </Stack>
      </Container>
    </>
  );
}
