'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Container, Title, Text, Paper, Stack, Group, Button, Skeleton, SegmentedControl, TextInput } from '@mantine/core';
import { IconArrowLeft, IconChevronRight, IconPlus, IconSearch } from '@tabler/icons-react';
import { useAuth } from '@/app/providers/auth.provider';
import TinyBreadcrumbs from '@/app/components/ui/tiny.breadcrumbs';
import { markketColors } from '@/markket/colors.config';

export default function MeStoresPage() {
  const router = useRouter();
  const { confirmed, stores, fetchStores, isLoading } = useAuth();
  const [isStoresHydrating, setIsStoresHydrating] = useState(true);
  const [sortMode, setSortMode] = useState<'alpha' | 'recent'>('alpha');
  const [storeSearch, setStoreSearch] = useState('');

  const uniqueStores = stores
    .filter((store, index, array) => {
      const identity = store.documentId || store.slug;
      if (!identity) return true;
      return array.findIndex((candidate) => (candidate.documentId || candidate.slug) === identity) === index;
    });

  const filteredStores = uniqueStores.filter((store) => {
    const query = storeSearch.trim().toLowerCase();
    if (!query) return true;

    const title = (store.title || '').toLowerCase();
    const slug = (store.slug || '').toLowerCase();
    return title.includes(query) || slug.includes(query);
  });

  const sortedStores = [...filteredStores].sort((a, b) => {
    if (sortMode === 'recent') {
      const aTime = new Date(a.updatedAt || a.createdAt || 0).getTime();
      const bTime = new Date(b.updatedAt || b.createdAt || 0).getTime();
      return bTime - aTime;
    }

    return (a.title || a.slug || '').localeCompare(b.title || b.slug || '');
  });
  useEffect(() => {
    if (isLoading) return;

    if (!confirmed()) {
      router.replace('/auth/magic?next=/tienda');
      return;
    }

    if (stores.length > 0) {
      // Reuse existing data immediately (e.g. browser back-swipe) and refresh in background.
      setIsStoresHydrating(false);
      fetchStores().catch((error) => {
        console.error('Failed to refresh stores in background:', error);
      });
      return;
    }

    setIsStoresHydrating(true);
    fetchStores({ force: true })
      .finally(() => setIsStoresHydrating(false));
  }, [confirmed, fetchStores, isLoading, router, stores.length]);

  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;

    if (sortedStores.length > 0) {
      console.table(
        sortedStores.map((store) => ({
          slug: store.slug,
          title: store.title,
          updatedAt: store.updatedAt,
        })),
      );
    }
  }, [sortedStores]);

  if (!isLoading && !confirmed()) {
    return null;
  }

  return (
    <Container size="lg" py="lg" className="tech-vhs-surface">
      <Stack gap="md" mb="lg">
        <TinyBreadcrumbs
          items={[
            { label: 'Me', href: '/me' },
            { label: 'Tienda' },
          ]}
        />

        <Group justify="space-between" align="flex-start" wrap="wrap" gap="sm">
          <Stack gap={4}>
            <Title order={2}>Your Stores</Title>
            <Text c="dimmed" size="sm">Choose a store and continue editing.</Text>
          </Stack>

          <Group gap="sm" wrap="wrap" justify="flex-end">
            <Button variant="default" component={Link} href="/me" leftSection={<IconArrowLeft size={16} />} radius="xl">
              Back
            </Button>
            <Button component={Link} href="/me/store/new" leftSection={<IconPlus size={16} />} radius="xl">
              New store
            </Button>
          </Group>
        </Group>

        <Group justify="space-between" align="center" wrap="wrap" gap="xs">
          <Text size="sm" c="dimmed">
            {sortedStores.length} store{sortedStores.length === 1 ? '' : 's'}
          </Text>
          <Group gap="xs" wrap="wrap">
            <TextInput
              size="sm"
              placeholder="Search stores"
              value={storeSearch}
              onChange={(event) => setStoreSearch(event.currentTarget.value)}
              leftSection={<IconSearch size={12} />}
            />
            <SegmentedControl
              size="xs"
              value={sortMode}
              onChange={(value) => setSortMode(value as 'alpha' | 'recent')}
              data={[
                { label: 'A-Z', value: 'alpha' },
                { label: 'Recent', value: 'recent' },
              ]}
            />
          </Group>
        </Group>
      </Stack>

      <Stack>
        {(isLoading || isStoresHydrating) && (
          <Paper
            withBorder
            p="lg"
            radius="xl"
            style={{ background: '#fff' }}
          >
            <Stack gap="md">
              <Group justify="space-between" align="center">
                <Stack gap={6}>
                  <Skeleton height={18} width={180} radius="sm" />
                  <Skeleton height={14} width={260} radius="sm" />
                </Stack>
                <Skeleton height={36} width={110} radius="xl" />
              </Group>
              <Skeleton height={62} radius="lg" />
              <Skeleton height={62} radius="lg" />
              <Skeleton height={62} radius="lg" />
            </Stack>
          </Paper>
        )}
        {!isLoading && !isStoresHydrating && sortedStores.length === 0 && (
          <Paper
            withBorder
            p="lg"
            radius="xl"
            style={{ background: '#fff' }}
          >
            <Stack gap="xs">
              <Text fw={700} style={{ color: markketColors.neutral.charcoal }}>No stores yet</Text>
              <Text c="dimmed" size="sm">Create your first store and start publishing in minutes.</Text>
              <Group>
                <Button component={Link} href="/me/store/new" radius="xl" leftSection={<IconPlus size={16} />}>
                  Create your first store
                </Button>
              </Group>
            </Stack>
          </Paper>
        )}
        {!isLoading && !isStoresHydrating && sortedStores.map((store, index) => (
          <Link
            key={store.documentId || `${store.slug || 'store'}-${index}`}
            href={`/tienda/${store.slug}`}
            className="store-tile-link"
            aria-label={`Enter ${store.title || store.slug}`}
            style={{ textDecoration: 'none', color: 'inherit' }}
          >
            <Paper
              withBorder
              p="md"
              radius="lg"
              className="store-tile-card"
            >
              <Group justify="space-between" align="center" wrap="nowrap">
                <div style={{ minWidth: 0 }}>
                  <Group gap="xs" align="center" mb={2} wrap="wrap">
                    <Title order={4}>{store.title}</Title>
                  </Group>
                  <Text c="dimmed" size="sm" style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, monospace' }}>
                    /{store.slug}
                  </Text>
                </div>
                <Group
                  gap={6}
                  wrap="nowrap"
                  className="store-tile-cta"
                  style={{
                    border: '1px solid rgba(15, 23, 42, 0.16)',
                    color: '#0f172a',
                    background: '#fff',
                    borderRadius: 10,
                    padding: '6px 12px',
                    flexShrink: 0,
                  }}
                  aria-hidden="true"
                >
                  <Text size="xs" fw={700}>Enter</Text>
                  <IconChevronRight size={14} />
                </Group>
              </Group>
            </Paper>
          </Link>
        ))}
      </Stack>
    </Container>
  );
}
