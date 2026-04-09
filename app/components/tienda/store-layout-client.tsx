'use client';

import { Container, Stack } from '@mantine/core';
import CompactBreadcrumbs from './compact-breadcrumbs';
import type { Store } from '@/markket/store';

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
