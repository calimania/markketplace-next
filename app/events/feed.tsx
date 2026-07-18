'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { Text, Center, Loader, Button, Grid, Group, Card, Box, Badge, Flex, Stack } from '@mantine/core';
import { IconArrowDown, IconCalendar, IconTicket } from '@tabler/icons-react';
import { markketColors } from '@/markket/colors.config';
import { Event } from '@/markket';
import Markdown from "@/app/components/ui/page.markdown";
import { stripMarkdown } from '@/markket/richtext.utils';
import Link from 'next/link';

interface EventFeedProps {
  initialEvents: Event[];
  initialHasMore: boolean;
  pageSize?: number;
}

export default function EventFeed({ initialEvents, initialHasMore, pageSize = 12 }: EventFeedProps) {
  const [events, setEvents] = useState<Event[]>(initialEvents);
  const [page, setPage] = useState(2);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);

    try {
      const res = await fetch(`/api/events?page=${page}&pageSize=${pageSize}`);
      const data = await res.json();
      const next = (data?.data || []) as Event[];
      setEvents((prev) => [...prev, ...next]);
      setPage((p) => p + 1);
      const total = data?.meta?.pagination?.total ?? 0;
      const loaded = events.length + next.length;
      setHasMore(loaded < total);
    } catch {
      // Fail silently
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore, page, events.length]);

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

  if (events.length === 0) {
    return (
      <Center py={80}>
        <Text c="dimmed" fw={500}>No upcoming events found — check back soon.</Text>
      </Center>
    );
  }

  return (
    <Stack gap="xl">
      <Grid gap="md">
        {events.map((event) => {
          const storeSlug = event?.stores?.[0]?.slug;
          const eventSlug = event?.slug || event?.documentId || '';
          const eventHref = `/${storeSlug}/events/${eventSlug}`;

          const coverUrl = event.Thumbnail?.formats?.small?.url || event.SEO?.socialImage?.formats?.small?.url;

          const dateLabel = (() => {
            if (!event.startDate) return 'TBD';
            const date = new Date(event.startDate);
            if (Number.isNaN(date.getTime())) return 'TBD';

            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            const month = months[date.getUTCMonth()];
            const day = date.getUTCDate();
            const year = date.getUTCFullYear();

            return `${month} ${day}, ${year}`;
          })();
          const priceLabel = event.usd_price ? `$${Number(event.usd_price).toFixed(2)}` : '';

          return (
            <Grid.Col key={event.documentId} span={{ base: 12, sm: 6, lg: 4 }}>
              <Card
                withBorder
                padding={0}
                radius="lg"
                href={eventHref}
                component={Link}
                styles={{
                  root: {
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                    backgroundColor: '#fff',
                    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.03)',
                    transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                    borderColor: markketColors.neutral.lightGray,

                    '&:hover': {
                      transform: 'translateY(-6px)',
                      boxShadow: `0 16px 32px ${markketColors.sections.blog.main}12`,
                      borderColor: markketColors.sections.blog.main,
                    }
                  }
                }}
              >
                {/* Image Container */}
                <Box style={{ position: 'relative', overflow: 'hidden', height: 200 }}>
                  {coverUrl ? (
                    <Box
                      style={{
                        width: '100%',
                        height: '100%',
                        background: `url(${coverUrl}) center center / cover no-repeat`,
                        transition: 'transform 0.4s ease',
                      }}
                      className="card-image"
                    />
                  ) : (
                    <Flex
                      align="center"
                      justify="center"
                      style={{
                        width: '100%',
                        height: '100%',
                        background: `linear-gradient(135deg, ${markketColors.sections.blog.light} 0%, #fff 100%)`,
                      }}
                    >
                      <Text fw={600} size="sm" c={markketColors.sections.blog.main}>
                        No Event Image
                      </Text>
                    </Flex>
                  )}

                  {/* Floating Badges inside Image */}
                  <Group gap="xs" style={{ position: 'absolute', top: 12, left: 12, zIndex: 2 }}>
                    <Badge
                      variant="filled"
                      radius="sm"
                      size="sm"
                      style={{
                        background: markketColors.sections.blog.main,
                        color: '#fff',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                      }}
                    >
                      Event
                    </Badge>
                    {storeSlug && (
                      <Badge
                        variant="white"
                        radius="sm"
                        size="sm"
                        style={{
                          color: markketColors.neutral.charcoal,
                          fontWeight: 600,
                          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                        }}
                      >
                        {storeSlug}
                      </Badge>
                    )}
                  </Group>

                  {/* Floating Ticket Price Badge */}
                  <Box
                    style={{
                      position: 'absolute',
                      bottom: 12,
                      right: 12,
                      zIndex: 2,
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      padding: '4px 10px',
                      borderRadius: 6,
                      boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                      backdropFilter: 'blur(4px)',
                    }}
                  >
                    <Group gap={4}>
                      <IconTicket size={12} color={markketColors.sections.blog.main} />
                      <Text size="xs" fw={700} style={{ color: markketColors.neutral.charcoal }}>
                        {priceLabel}
                      </Text>
                    </Group>
                  </Box>
                </Box>

                {/* Text Content */}
                <Stack gap="xs" p="md" style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <Stack gap={6}>
                    {/* Date Row */}
                    <Group gap={4}>
                      <IconCalendar size={13} color={markketColors.neutral.mediumGray} />
                      <Text size="xs" fw={600} c="dimmed" suppressHydrationWarning>
                        {dateLabel}
                      </Text>
                    </Group>

                    {/* Event Title */}
                    <Text
                      fw={700}
                      lineClamp={2}
                      style={{
                        fontSize: '1.1rem',
                        lineHeight: 1.3,
                        color: markketColors.neutral.charcoal,
                      }}
                    >
                      {event.Name}
                    </Text>

                    {/* Short description preview safely wrapped in layout box */}
                    {event.Description && (
                      <Box style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.4 }}>
                        <div className="prose space-y-6 text-xs text-gray-500 dark:prose-invert">
                          <Markdown content={stripMarkdown(event?.Description || "")} />
                        </div>
                      </Box>
                    )}
                  </Stack>

                  {/* Footer Action */}
                  <Group justify="space-between" mt="md" pt="xs" style={{ borderTop: `1px solid ${markketColors.neutral.lightGray}` }}>
                    <Group gap={4}>
                      <Text size="xs" c="dimmed" fw={500}>
                        {storeSlug ? `${storeSlug}` : ' '}
                      </Text>
                    </Group>

                    <Text
                      size="xs"
                      fw={700}
                      style={{
                        color: markketColors.sections.blog.main,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 3,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                      }}
                    >
                      View Details <IconArrowDown size={12} style={{ transform: 'rotate(-90deg)' }} />
                    </Text>
                  </Group>
                </Stack>
              </Card>
            </Grid.Col>
          );
        })}
      </Grid>

      {/* Sentinel for intersection observer */}
      <div ref={sentinelRef} style={{ height: 1 }} />

      {/* Infinite Loading Indicator */}
      {loading && (
        <Center py="xl">
          <Group gap="sm">
            <Loader size="sm" color={markketColors.sections.blog.main} />
            <Text size="sm" c="dimmed" fw={500}>Fetching more events…</Text>
          </Group>
        </Center>
      )}

      {/* Explicit Manual Pagination Button */}
      {!loading && hasMore && (
        <Center mt="lg">
          <Button
            variant="outline"
            radius="xl"
            size="md"
            leftSection={<IconArrowDown size={16} />}
            onClick={loadMore}
            style={{
              borderColor: markketColors.sections.blog.main,
              color: markketColors.sections.blog.main,
              borderWidth: 2,
              fontWeight: 700,
            }}
          >
            Load more events
          </Button>
        </Center>
      )}

      {/* End of Feed Message */}
      {!hasMore && events.length > 0 && (
        <Center py="xl">
          <Text size="sm" c="dimmed" fw={600} style={{ letterSpacing: '0.02em' }}>
            ✨
          </Text>
        </Center>
      )}
    </Stack>
  );
};
