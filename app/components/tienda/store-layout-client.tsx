'use client';

import { useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Button, Container, Group, Paper, ScrollArea, Skeleton, Stack, Text, ThemeIcon, UnstyledButton } from '@mantine/core';
import { IconLock, IconHome, IconNews, IconShoppingCart, IconCalendarEvent, IconUsers, IconSettings } from '@tabler/icons-react';
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
const STORE_NAV = [
  { label: 'Overview', icon: IconHome, path: '' },
  { label: 'Blog', icon: IconNews, path: '/blog' },
  { label: 'Products', icon: IconShoppingCart, path: '/products' },
  { label: 'Events', icon: IconCalendarEvent, path: '/events' },
  { label: 'CRM', icon: IconUsers, path: '/crm' },
  { label: 'Store', icon: IconSettings, path: '/store' },
];

function MobileStoreSectionNav({ storeSlug, pathname }: { storeSlug: string; pathname: string }) {
  const router = useRouter();
  return (
    <Paper
      withBorder
      radius={0}
      hiddenFrom="sm"
      style={{
        borderTop: 'none',
        borderLeft: 'none',
        borderRight: 'none',
        position: 'sticky',
        top: 'var(--store-mobile-nav-top, 0px)',
        zIndex: 100,
        background: 'var(--mantine-color-body)',
      }}
    >
      <ScrollArea scrollbarSize={0} offsetScrollbars={false}>
        <Group gap={0} wrap="nowrap" py={6} px={8}>
          {STORE_NAV.map((item) => {
            const href = `/tienda/${storeSlug}${item.path}`;
            const isActive = item.path === ''
              ? pathname === `/tienda/${storeSlug}`
              : pathname.startsWith(href);
            const Icon = item.icon;
            return (
              <UnstyledButton
                key={item.path}
                onClick={() => router.push(href)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 2,
                  padding: '6px 10px',
                  borderRadius: 8,
                  minWidth: 56,
                  background: isActive ? 'var(--mantine-color-blue-0)' : 'transparent',
                  color: isActive ? 'var(--mantine-color-blue-7)' : 'var(--mantine-color-dimmed)',
                  fontWeight: isActive ? 700 : 400,
                  flexShrink: 0,
                }}
              >
                <Icon size={18} />
                <Text size="10px" fw={isActive ? 700 : 400} style={{ whiteSpace: 'nowrap' }}>{item.label}</Text>
              </UnstyledButton>
            );
          })}
        </Group>
      </ScrollArea>
    </Paper>
  );
}

export default function StoreLayoutClient({ children, store }: StoreLayoutClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { confirmed, isLoading, stores, fetchStores } = useAuth();
  const [ownershipResolved, setOwnershipResolved] = useState(false);

  const isConfirmed = confirmed();
  const isAuthorized = useMemo(() => {
    return stores.some((candidate) => candidate.slug === store.slug || candidate.documentId === store.documentId);
  }, [stores, store.documentId, store.slug]);

  const ownershipLoading = false;
  const shouldShowUnauthorized = isConfirmed && ownershipResolved && stores.length > 0 && !isAuthorized;

  useEffect(() => {
    let active = true;

    if (!isConfirmed) {
      setOwnershipResolved(false);
      return () => {
        active = false;
      };
    }

    if (isLoading) {
      return () => {
        active = false;
      };
    }

    const resolveOwnership = async () => {
      if (stores.length > 0) {
        if (active) setOwnershipResolved(true);
        return;
      }

      try {
        await fetchStores({ force: true });
      } finally {
        if (active) setOwnershipResolved(true);
      }
    };

    resolveOwnership();

    return () => {
      active = false;
    };
  }, [fetchStores, isConfirmed, isLoading, stores.length]);

  useEffect(() => {
    if (isLoading) return;
    if (isConfirmed) return;

    const next = encodeURIComponent(pathname || `/tienda/${store.slug}`);
    router.replace(`/auth/magic?next=${next}`);
  }, [isConfirmed, isLoading, pathname, router, store.slug]);

  if (isLoading || ownershipLoading || !isConfirmed) {
    return (
      <>
        <CompactBreadcrumbs storeSlug={store.slug} />
        <Container size="md" py="xl" className="tech-vhs-surface">
          <Stack gap="md">
            <Paper withBorder radius="md" p="md" className="tienda-panel">
              <Stack gap="sm">
                <Skeleton height={14} width="38%" radius={0} />
                <Skeleton height={10} width="64%" radius={0} />
              </Stack>
            </Paper>

            <Paper withBorder radius="md" p="md" className="tienda-panel">
              <Stack gap="sm">
                <Skeleton height={16} width="28%" radius={0} />
                <Skeleton height={11} radius={0} />
                <Skeleton height={11} width="88%" radius={0} />
                <Skeleton height={11} width="62%" radius={0} />
              </Stack>
            </Paper>

            <Paper withBorder radius="md" p="md" className="tienda-panel">
              <Stack gap="xs">
                <Skeleton height={12} width="22%" radius={0} />
                <Skeleton height={56} radius={0} />
                <Skeleton height={56} radius={0} />
              </Stack>
            </Paper>
          </Stack>
        </Container>
      </>
    );
  }

  if (shouldShowUnauthorized) {
    return (
      <Container size="sm" py="xl" className="tech-vhs-surface">
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
      <MobileStoreSectionNav storeSlug={store.slug} pathname={pathname || ''} />
      <Container size="md" py="xl" className="tech-vhs-surface">
        <Stack gap="md">
          {children}
        </Stack>
      </Container>
    </>
  );
}
