import { Store, Page, Event } from "@/markket";
import { strapiClient } from "@/markket/api.strapi";
import { generateSEOMetadata } from "@/markket/metadata";
import { notFound } from "next/navigation";
import { Container, Text, Paper, SimpleGrid, Stack, Box, Badge, Group } from '@mantine/core';
import { IconCalendar, IconMapPin } from '@tabler/icons-react';
import StorePageHeader from '@/app/components/ui/store.page.header';
import { markketColors } from '@/markket/colors.config';
import Link from 'next/link';
import PageContent from '@/app/components/ui/page.content';
import { richTextToPlainText, stripMarkdown } from '@/markket/richtext.utils';
import type { RichTextValue, StoredRichText } from '@/markket/richtext';
import { cache } from 'react';
import './events.css';

const getStoreCached = cache((slug: string) => strapiClient.getStore(slug));
const getEventsPageCached = cache((slug: string) => strapiClient.getPage('events', slug));
const getEventsCached = cache((slug: string) => strapiClient.getEvents(slug));

interface EventsPageProps {
  params: Promise<{ slug: string }>;
}

function hasValidTimeZone(value?: string) {
  if (!value) return false;
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: value }).format(new Date());
    return true;
  } catch {
    return false;
  }
}

function formatEventDate(value?: string, timeZone?: string) {
  if (!value) return 'Date TBD';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;

  const options: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  };

  if (hasValidTimeZone(timeZone)) {
    options.timeZone = timeZone;
  }

  return new Intl.DateTimeFormat('en-US', options).format(parsed);
}

function getEventExcerpt(value?: string | RichTextValue | StoredRichText, max = 120): string {
  if (!value) return '';
  const plain = stripMarkdown(richTextToPlainText(value));
  if (!plain) return '';
  return plain.length > max ? `${plain.slice(0, max - 1)}...` : plain;
}

export async function generateMetadata({ params }: EventsPageProps) {
  const { slug } = await params;
  const response = await getStoreCached(slug);
  const store = response?.data?.[0] as Store;

  const pageResponse = await getEventsPageCached(slug);
  const page = pageResponse?.data?.[0] as Page;

  const eventsResponse = await getEventsCached(slug);
  const events = (eventsResponse?.data || []) as Event[];

  const eventCount = events.length;
  const eventNames = events.slice(0, 5).map((e) => e.Name).filter(Boolean);
  const upcomingEvents = events.filter((e) => new Date(e.startDate) > new Date());
  const upcomingCount = upcomingEvents.length;

  return generateSEOMetadata({
    slug,
    entity: {
      SEO: page?.SEO || store?.SEO,
      Title: page?.Title,
      id: store?.id?.toString(),
      url: `/${slug}/events`,
    },
    type: 'website',
    defaultTitle: 'Events',
    defaultDescription: upcomingCount > 0
      ? `Join us for ${upcomingCount} upcoming events: ${eventNames.slice(0, 3).join(', ')}${eventNames.length > 3 ? ' and more' : ''}.`
      : eventCount > 0
        ? `Explore ${eventCount} events: ${eventNames.slice(0, 3).join(', ')}${eventNames.length > 3 ? ' and more' : ''}.`
        : 'Discover our events, workshops, and gatherings.',
    keywords: ['events', 'calendar', 'workshops', 'meetups', ...eventNames.slice(0, 5)],
  });
}

export default async function StoreEventsPage({ params }: EventsPageProps) {
  const { slug } = await params;
  const storeResponse = await getStoreCached(slug);
  const store = storeResponse?.data?.[0] as Store;

  const response = await getEventsPageCached(slug);
  const eventPage = response?.data?.[0] as Page;

  if (!store) {
    notFound();
  }

  const eventsResponse = await getEventsCached(slug);
  const events = (eventsResponse?.data || []) as Event[];
  const now = new Date();
  const upcomingEvents = events
    .filter((e) => new Date(e.startDate).getTime() >= now.getTime())
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
  const pastEvents = events
    .filter((e) => new Date(e.startDate).getTime() < now.getTime())
    .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());

  return (
    <Container size="lg" py="xl">
      <Stack gap="xl">
        <StorePageHeader
          icon={<IconCalendar size={48} />}
          title={eventPage?.Title || `${store?.title} Events`}
          description={eventPage?.SEO?.metaDescription || `Upcoming gatherings, launches, and calendar moments from ${store?.title || 'this store'}.`}
          page={eventPage}
          backgroundImage={eventPage?.SEO?.socialImage?.url || store?.SEO?.socialImage?.url || store?.Cover?.url}
          iconColor={markketColors.sections.events.main}
        />

        {events.length > 0 ? (
          <>
            {upcomingEvents.length > 0 && (
              <Stack gap="md">
                <Group gap="xs" align="center">
                  <Badge
                    size="sm"
                    radius="md"
                    style={{
                      background: markketColors.sections.events.light,
                      color: markketColors.sections.events.main,
                      border: `1px solid ${markketColors.sections.events.main}44`,
                    }}
                  >
                    {upcomingEvents.length} Upcoming
                  </Badge>
                </Group>

                <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg">
                  {upcomingEvents.map((event) => {
                    const image = event.Thumbnail?.url || event.SEO?.socialImage?.url || event.Slides?.[0]?.url;
                    const excerpt = getEventExcerpt(event.Description);

                    return (
                      <Link
                        key={event.id}
                        href={`/${slug}/events/${event.slug}`}
                        style={{ textDecoration: 'none' }}
                      >
                        <Paper
                          radius="lg"
                          style={{
                            overflow: 'hidden',
                            border: `1px solid ${markketColors.neutral.lightGray}`,
                            transition: 'all 0.2s ease',
                            cursor: 'pointer',
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                          }}
                          className="event-card"
                        >
                          {image ? (
                            <Box
                              style={{
                                width: '100%',
                                height: 200,
                                backgroundImage: `url(${image})`,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                                position: 'relative',
                              }}
                            >
                              <></>
                            </Box>
                          ) : (
                            <Box
                              style={{
                                width: '100%',
                                height: 200,
                                background: `linear-gradient(135deg, ${markketColors.sections.events.light} 0%, #ffffff 100%)`,
                                borderBottom: `1px solid ${markketColors.sections.events.main}33`,
                              }}
                            />
                          )}

                          <Stack gap="sm" p="lg" style={{ flex: 1 }}>
                            <Text size="lg" fw={600} c={markketColors.neutral.charcoal} lineClamp={2}>
                              {event.Name}
                            </Text>

                            <Group gap="xs">
                              <IconCalendar size={16} color={markketColors.neutral.mediumGray} />
                              <Text size="sm" c={markketColors.neutral.mediumGray}>
                                {formatEventDate(event.startDate, event.timezone)}
                              </Text>
                            </Group>

                            {excerpt && (
                              <Text
                                size="sm"
                                c={markketColors.neutral.mediumGray}
                                lineClamp={3}
                                style={{ flex: 1 }}
                              >
                                {excerpt}
                              </Text>
                            )}

                            {event.SEO?.metaUrl && (
                              <Group gap="xs" mt="auto">
                                <IconMapPin size={14} color={markketColors.sections.events.main} />
                                <Text size="xs" c={markketColors.sections.events.main} fw={500}>
                                  External Event
                                </Text>
                              </Group>
                            )}
                          </Stack>
                        </Paper>
                      </Link>
                    );
                  })}
                </SimpleGrid>
              </Stack>
            )}

            {pastEvents.length > 0 && (
              <Stack gap="md">
                {upcomingEvents.length > 0 && (
                  <Box
                    style={{
                      borderTop: `2px solid ${markketColors.neutral.lightGray}`,
                      paddingTop: 'md',
                    }}
                  />
                )}

                <Group gap="xs" align="center">
                  <Badge
                    size="sm"
                    radius="md"
                    variant="outline"
                    style={{
                      borderColor: markketColors.neutral.mediumGray,
                      color: markketColors.neutral.mediumGray,
                    }}
                  >
                    {pastEvents.length} Past
                  </Badge>
                </Group>

                <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg">
                  {pastEvents.map((event) => {
                    const image = event.Thumbnail?.url || event.SEO?.socialImage?.url || event.Slides?.[0]?.url;
                    const excerpt = getEventExcerpt(event.Description);

                    return (
                      <Link
                        key={event.id}
                        href={`/${slug}/events/${event.slug}`}
                        style={{ textDecoration: 'none' }}
                      >
                        <Paper
                          radius="lg"
                          style={{
                            overflow: 'hidden',
                            border: `1px solid ${markketColors.neutral.lightGray}`,
                            transition: 'all 0.2s ease',
                            cursor: 'pointer',
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            opacity: 0.75,
                          }}
                          className="event-card event-card--past"
                        >
                          {image ? (
                            <Box
                              style={{
                                width: '100%',
                                height: 200,
                                backgroundImage: `url(${image})`,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                                position: 'relative',
                                filter: 'grayscale(40%)',
                              }}
                            >
                              <Badge
                                color="gray"
                                size="sm"
                                style={{
                                  position: 'absolute',
                                  top: 12,
                                  right: 12,
                                }}
                              >
                                Past
                              </Badge>
                            </Box>
                          ) : (
                            <Box
                              style={{
                                width: '100%',
                                height: 200,
                                background: `linear-gradient(135deg, ${markketColors.neutral.lightGray} 0%, ${markketColors.neutral.offWhite} 100%)`,
                                borderBottom: `1px solid ${markketColors.neutral.mediumGray}33`,
                              }}
                            />
                          )}

                          <Stack gap="sm" p="lg" style={{ flex: 1 }}>
                            <Text size="lg" fw={600} c={markketColors.neutral.charcoal} lineClamp={2}>
                              {event.Name}
                            </Text>

                            <Group gap="xs">
                              <IconCalendar size={16} color={markketColors.neutral.mediumGray} />
                              <Text size="sm" c={markketColors.neutral.mediumGray}>
                                {formatEventDate(event.startDate, event.timezone)}
                              </Text>
                            </Group>

                            {excerpt && (
                              <Text
                                size="sm"
                                c={markketColors.neutral.mediumGray}
                                lineClamp={3}
                                style={{ flex: 1 }}
                              >
                                {excerpt}
                              </Text>
                            )}

                            {event.SEO?.metaUrl && (
                              <Group gap="xs" mt="auto">
                                <IconMapPin size={14} color={markketColors.neutral.mediumGray} />
                                <Text size="xs" c={markketColors.neutral.mediumGray} fw={500}>
                                  External Event
                                </Text>
                              </Group>
                            )}
                          </Stack>
                        </Paper>
                      </Link>
                    );
                  })}
                </SimpleGrid>
              </Stack>
            )}
          </>
        ) : (
          <Paper
            p="xl"
              radius="lg"
              ta="center"
              style={{
                backgroundColor: markketColors.neutral.offWhite,
                border: 'none',
              }}
            >
            <Text size="lg" c={markketColors.neutral.mediumGray}>
                No events are scheduled yet.
              </Text>
              <Text size="sm" c={markketColors.neutral.mediumGray} mt={6}>
                Check back soon for workshops, launches, and community meetups.
            </Text>
          </Paper>
        )}

        <PageContent params={{ page: eventPage }} />
      </Stack>
    </Container>
  );
}
