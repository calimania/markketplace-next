'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Button, Center, Group, Loader, Stack, Text } from '@mantine/core';
import { IconArrowDown } from '@tabler/icons-react';
import type { Store } from '@/markket/store.d';
import StoreGrid from '@/app/components/stores/grid';
import { strapiClient } from '@/markket/api.strapi';
import { markketColors } from '@/markket/colors.config';

interface StoresFeedProps {
  initialStores: Store[];
  initialHasMore: boolean;
  pageSize: number;
}

export default function StoresFeed({ initialStores, initialHasMore, pageSize }: StoresFeedProps) {
  const [stores, setStores] = useState<Store[]>(initialStores);
  const [page, setPage] = useState(2);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);

    try {
      const response = await strapiClient.getStores(
        { page, pageSize },
        { filter: {}, sort: 'active:desc,updatedAt:desc' },
      );

      const nextStores = (response?.data || []) as Store[];
      const total = response?.meta?.pagination?.total ?? 0;

      setStores((prev) => {
        const merged = [...prev, ...nextStores];
        setHasMore(merged.length < total);
        return merged;
      });

      setPage((current) => current + 1);
    } catch {
      // Keep the existing list visible and let the user retry.
    } finally {
      setLoading(false);
    }
  }, [hasMore, loading, page, pageSize]);

  useEffect(() => {
    const el = sentinelRef.current;

    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          loadMore();
        }
      },
      { rootMargin: '220px' },
    );

    observer.observe(el);

    return () => observer.disconnect();
  }, [loadMore]);

  if (stores.length === 0) {
    return (
      <Center py={80}>
        <Text c="dimmed">No stores yet. Check back soon.</Text>
      </Center>
    );
  }

  return (
    <Stack gap="lg">
      <StoreGrid stores={stores} />

      <div ref={sentinelRef} style={{ height: 1 }} />

      {loading && (
        <Center py="xl">
          <Group gap="sm">
            <Loader size="sm" color={markketColors.sections.shop.main} />
            <Text size="sm" c="dimmed">
              Loading more stores…
            </Text>
          </Group>
        </Center>
      )}

      {!loading && hasMore && (
        <Center>
          <Button
            variant="outline"
            radius="xl"
            leftSection={<IconArrowDown size={16} />}
            onClick={loadMore}
            style={{ borderColor: markketColors.sections.shop.main, color: markketColors.sections.shop.main }}
          >
            Load more stores
          </Button>
        </Center>
      )}

      {!hasMore && stores.length > 0 && (
        <Center py="md">
          <Text size="sm" c="dimmed">
            You&apos;ve reached the end of the store list.
          </Text>
        </Center>
      )}
    </Stack>
  );
}