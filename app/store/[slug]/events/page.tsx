import { Store, Page, Event } from "@/markket";
import { strapiClient } from "@/markket/api.strapi";
import { generateSEOMetadata } from "@/markket/metadata";
import { notFound } from "next/navigation";
import { Container, Text, Paper, SimpleGrid, Stack, Box, Badge, Group } from '@mantine/core';
import { IconCalendar, IconMapPin } from '@tabler/icons-react';
import StorePageHeader from '@/app/components/ui/store.page.header';
import { markketColors } from '@/markket/colors.config';
import Link from 'next/link';
import './events.css';

interface EventsPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: EventsPageProps) {
  const { slug } = await params;
  const response = await strapiClient.getStore(slug);
  const store = response?.data?.[0] as Store;

  const pageResponse = await strapiClient.getPage('events');
  const page = pageResponse?.data?.[0] as Page;

  const eventsResponse = await strapiClient.getEvents(slug);
  const events = (eventsResponse?.data || []) as Event[];

  const eventCount = events.length;
  const eventNames = events.slice(0, 5).map(e => e.Name).filter(Boolean);
  const upcomingEvents = events.filter(e => new Date(e.startDate) > new Date());
  const upcomingCount = upcomingEvents.length;

  return generateSEOMetadata({
    slug,
    entity: {
      SEO: page?.SEO || store?.SEO,
      Title: page?.Title,  // Add page title if exists
      id: store?.id?.toString(),
      url: `/${slug}/events`,
    },
    type: "website",
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
  const storeResponse = await strapiClient.getStore(slug);
  const store = storeResponse?.data?.[0] as Store;

  const response = await strapiClient.getPage('events', slug);
  const eventPage = response?.data?.[0] as Page;

  if (!store) {
    notFound();
  }

  const eventsResponse = await strapiClient.getEvents(slug);

  const events = (eventsResponse?.data || []) as Event[];

  return (
    <Container size="lg" py="xl">
      <Stack gap="xl">
        <StorePageHeader
          icon={<IconCalendar size={48} />}
          title={eventPage?.Title || `${store?.title} Events`}
          description={eventPage?.SEO?.metaDescription}
          page={eventPage}
          backgroundImage={eventPage?.SEO?.socialImage?.url || store?.SEO?.socialImage?.url || store?.Cover?.url}
          iconColor={markketColors.sections.events.main}
        />

        {events.length > 0 ? (
          <SimpleGrid
            cols={{ base: 1, sm: 2, lg: 3 }}
            spacing="lg"
          >
            {events.map((event) => {
              const eventDate = new Date(event.startDate);
              const isUpcoming = eventDate > new Date();
              const image = event.Thumbnail?.url || event.SEO?.socialImage?.url || event.Slides?.[0]?.url;

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
                    {image && (
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
                        {isUpcoming && (
                          <Badge
                            color={markketColors.sections.events.main}
                            size="sm"
                            style={{
                              position: 'absolute',
                              top: 12,
                              right: 12,
                            }}
                          >
                            Upcoming
                          </Badge>
                        )}
                      </Box>
                    )}

                    <Stack gap="sm" p="lg" style={{ flex: 1 }}>
                      <Text
                        size="lg"
                        fw={600}
                        c={markketColors.neutral.charcoal}
                        lineClamp={2}
                      >
                        {event.Name}
                      </Text>

                      <Group gap="xs">
                        <IconCalendar size={16} color={markketColors.neutral.mediumGray} />
                        <Text size="sm" c={markketColors.neutral.mediumGray}>
                          {eventDate.toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </Text>
                      </Group>

                      {event.Description && (
                        <Text
                          size="sm"
                          c={markketColors.neutral.mediumGray}
                          lineClamp={3}
                          style={{ flex: 1 }}
                        >
                          {event.Description.replace(/<[^>]*>/g, '').substring(0, 120)}...
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
              No events scheduled at the moment.
            </Text>
          </Paper>
        )}
      </Stack>
    </Container>
  );
};
