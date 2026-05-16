'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { Text, Center, Loader, Button, Stack, Group, Card, Box, Badge } from '@mantine/core';
import { IconArrowDown, IconArrowRight, IconCalendar } from '@tabler/icons-react';
import type { Article } from '@/markket/article';
import { richTextToPlainText, stripMarkdown } from '@/markket/richtext.utils';
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
      <Stack gap="lg">
        {posts.map((post, index) => {
          const storeSlug = (post as Article & { store?: { slug?: string } })?.store?.slug;
          const prefix = storeSlug ? `${storeSlug}/blog` : 'docs';
          const isFeatured = index === 0;
          const coverUrl = post?.cover?.formats?.medium?.url || post?.cover?.formats?.small?.url || post?.cover?.url || post.SEO?.socialImage?.formats?.small?.url;
          const firstChild = post?.Content?.[0]?.children?.[0];
          const rawExcerpt = post?.SEO?.metaDescription
            || stripMarkdown(richTextToPlainText(post?.Content))
            || ('text' in (firstChild || {}) ? (firstChild as { text?: string }).text : undefined)
            || 'Read the full story.';
          const excerpt = rawExcerpt.slice(0, 200).trim() + (rawExcerpt.length > 200 ? '…' : '');
          const publishedDate = post.publishedAt ? new Date(post.publishedAt) : null;
          const publishedDateLabel = publishedDate && !Number.isNaN(publishedDate.getTime())
            ? publishedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
            : 'Draft';

          return (
            <Card
              key={post.documentId || post.id}
              component="a"
              href={`/${prefix}/${post.slug}`}
              radius="lg"
              withBorder
              padding={0}
              style={{
                overflow: 'hidden',
                borderColor: markketColors.neutral.lightGray,
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.06)',
                transition: 'transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease',
                textDecoration: 'none',
                color: 'inherit',
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.transform = 'translateY(-3px)';
                el.style.boxShadow = `0 14px 36px ${markketColors.sections.blog.main}18`;
                el.style.borderColor = `${markketColors.sections.blog.main}3a`;
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.transform = '';
                el.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.06)';
                el.style.borderColor = markketColors.neutral.lightGray;
              }}
            >
              <Box
                style={{
                  display: 'grid',
                  gridTemplateColumns: isFeatured ? 'minmax(240px, 420px) minmax(0, 1fr)' : 'minmax(220px, 360px) minmax(0, 1fr)',
                }}
                className="max-md:grid-cols-1"
              >
                <Box
                  style={{
                    minHeight: isFeatured ? 300 : 220,
                    background: coverUrl
                      ? `url(${coverUrl}) center/cover no-repeat`
                      : markketColors.sections.blog.light,
                    position: 'relative',
                  }}
                >
                  {!coverUrl && (
                    <Box
                      style={{
                        position: 'absolute',
                        inset: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Text size="sm" fw={600} c={markketColors.sections.blog.main}>
                        Community story
                      </Text>
                    </Box>
                  )}
                </Box>

                <Stack gap="md" p={{ base: 'md', md: 'xl' }} style={{ justifyContent: 'space-between' }}>
                  <Stack gap="sm">
                    <Group gap="xs" wrap="wrap">
                      <Badge
                        variant="light"
                        radius="md"
                        style={{ background: markketColors.sections.blog.light, color: markketColors.sections.blog.main }}
                      >
                        Blog
                      </Badge>
                      {storeSlug && (
                        <Badge variant="outline" radius="md" style={{ borderColor: markketColors.neutral.lightGray, color: markketColors.neutral.darkGray }}>
                          {storeSlug}
                        </Badge>
                      )}
                    </Group>

                    <Text
                      fw={800}
                      style={{
                        fontSize: isFeatured ? 'clamp(1.6rem, 3vw, 2.4rem)' : 'clamp(1.25rem, 2.4vw, 1.8rem)',
                        lineHeight: 1.08,
                        color: markketColors.neutral.charcoal,
                        letterSpacing: '-0.03em',
                      }}
                    >
                      {post.Title}
                    </Text>

                    <Text size="sm" c="dimmed" style={{ lineHeight: 1.75, maxWidth: 760 }} lineClamp={isFeatured ? 5 : 4}>
                      {excerpt}
                    </Text>
                  </Stack>

                  <Group justify="space-between" align="center" wrap="wrap">
                    <Group gap={4}>
                      <IconCalendar size={12} color={markketColors.neutral.mediumGray} />
                      <Text size="xs" c="dimmed">
                        {publishedDateLabel}
                      </Text>
                    </Group>
                    <Text size="sm" fw={600} style={{ color: markketColors.sections.blog.main, display: 'flex', alignItems: 'center', gap: 4 }}>
                      Read story <IconArrowRight size={14} />
                    </Text>
                  </Group>
                </Stack>
              </Box>
            </Card>
          );
        })}
      </Stack>

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
