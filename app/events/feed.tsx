'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { Text, Center, Loader, Button, Grid, Group, Card, Box, Badge, Flex, Stack } from '@mantine/core';
import { IconArrowDown, IconCalendar, IconMapPin, IconTicket } from '@tabler/icons-react';
import Link from 'next/link';
import { markketColors } from '@/markket/colors.config';
import { Event } from '@/markket';
import Markdown from "@/app/components/ui/page.markdown";

interface EventFeedProps {
  initialEvents: Event[];
  initialHasMore: boolean;
}

export default function EventFeed({ initialEvents, initialHasMore }: EventFeedProps) {
  const [events, setEvents] = useState<Event[]>(initialEvents);
  const [page, setPage] = useState(2);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);

    try {
      const res = await fetch(`/api/events?page=${page}&pageSize=12`);
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
      {/* Responsive Grid Layout */}
      <Grid gutter={{ base: 'md', md: 'lg' }}>
        {events.map((event, index) => {
          const storeSlug = (event as Event & { store?: { slug?: string } })?.store?.slug;
          const eventSlug = event?.slug || event?.documentId || '';
          const eventHref = `/${storeSlug}/events/${eventSlug}`;

          // Beautiful cover fallbacks or direct URLs
          const coverUrl = event.Thumbnail?.formats?.small?.url || event.SEO?.socialImage?.formats?.small?.url;

          // Format Event Start Date nicely (e.g. "Jul 17, 2026")
          const eventStartDate = event.startDate ? new Date(event.startDate) : null;
          const dateLabel = eventStartDate && !Number.isNaN(eventStartDate.getTime())
            ? eventStartDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
            : 'TBD';

          // Render nicely formatted price
          const priceLabel = event.usd_price ? `$${Number(event.usd_price).toFixed(2)}` : '';

          return (
            <Grid.Col key={event.documentId} span={{ base: 12, sm: 6, lg: 4 }}>
              <Link
                href={eventHref}
                style={{ textDecoration: 'none', color: 'inherit', display: 'block', height: '100%' }}
              >
                <Card
                  withBorder
                  padding={0}
                  radius="lg"
                  style={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                    backgroundColor: '#fff',
                    borderColor: markketColors.neutral.lightGray,
                    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.03)',
                    transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                  onMouseEnter={(e) => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.transform = 'translateY(-6px)';
                    el.style.boxShadow = `0 16px 32px ${markketColors.sections.blog.main}12`;
                    el.style.borderColor = markketColors.sections.blog.main;
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.transform = '';
                    el.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.03)';
                    el.style.borderColor = markketColors.neutral.lightGray;
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
                      // Geometric fallback background with subtle branding colors
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
                        <Text size="xs" fw={600} c="dimmed">
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

                      {/* Short description if available */}
                      {event.Description && (
                        <Text size="xs" c="dimmed" lineClamp={2} style={{ lineHeight: 1.4 }}>
                          <div className="prose space-y-6 text-base text-gray-700 dark:prose-invert">
                            <Markdown content={event?.Description || ""} />
                          </div>
                        </Text>
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
              </Link>
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
