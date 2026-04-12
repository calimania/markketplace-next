'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { SimpleGrid, Text, Center, Loader, Button, Stack, Group } from '@mantine/core';
import { IconArrowDown } from '@tabler/icons-react';
import { BlogPostCard } from '@/app/components/docs/card';
import type { Article } from '@/markket/article';
import { markketColors } from '@/markket/colors.config';

interface BlogFeedProps {
  initialPosts: Article[];
  initialHasMore: boolean;
}

export default function BlogFeed({ initialPosts, initialHasMore }: BlogFeedProps) {
  const [posts, setPosts] = useState<Article[]>(initialPosts);
  const [page, setPage] = useState(2);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/blog?page=${page}&pageSize=12`);
      const data = await res.json();
      const next = (data?.data || []) as Article[];
      setPosts((prev) => [...prev, ...next]);
      setPage((p) => p + 1);
      const total = data?.meta?.pagination?.total ?? 0;
      const loaded = posts.length + next.length;
      setHasMore(loaded < total);
    } catch {
      // fail silently, user can retry
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore, page, posts.length]);

  // Intersection observer for auto-load
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore();
      },
      { rootMargin: '200px' },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [loadMore]);

  if (posts.length === 0) {
    return (
      <Center py={80}>
        <Text c="dimmed">No posts yet — check back soon.</Text>
      </Center>
    );
  }

  return (
    <Stack gap="xl">
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg">
        {posts.map((post) => {
          const storeSlug = (post as Article & { store?: { slug?: string } })?.store?.slug;
          const prefix = storeSlug ? `${storeSlug}/blog` : 'docs';
          return (
            <BlogPostCard key={post.documentId || post.id} post={post} prefix={prefix} showStore />
          );
        })}
      </SimpleGrid>

      {/* Sentinel for intersection observer */}
      <div ref={sentinelRef} style={{ height: 1 }} />

      {loading && (
        <Center py="xl">
          <Group gap="sm">
            <Loader size="sm" color={markketColors.sections.blog.main} />
            <Text size="sm" c="dimmed">Loading more stories…</Text>
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
            style={{ borderColor: markketColors.sections.blog.main, color: markketColors.sections.blog.main }}
          >
            Load more
          </Button>
        </Center>
      )}

      {!hasMore && posts.length > 0 && (
        <Center py="md">
          <Text size="sm" c="dimmed">You've read it all ✨</Text>
        </Center>
      )}
    </Stack>
  );
}
