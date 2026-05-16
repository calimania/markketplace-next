import { Event } from "@/markket/event.d";
import { Store } from "@/markket/store.d";
import { strapiClient } from "@/markket/api.strapi";
import { generateSEOMetadata } from "@/markket/metadata";
import { notFound } from "next/navigation";
import { Container, Button, Paper, SimpleGrid, Stack, Text, Badge, Group } from "@mantine/core";
import { EventImageGallery } from "@/app/components/events/event.gallery.image";
import EventSchedule from "@/app/components/events/event.schedule.client";
import RSVPModal from "@/app/components/events/event.rsvp.modal";
import Markdown from "@/app/components/ui/page.markdown";
import StoreCrosslinks from '@/app/components/ui/store.crosslinks';
import StorePageHeader from '@/app/components/ui/store.page.header';
import { IconCalendarEvent } from '@tabler/icons-react';
import { markketColors } from '@/markket/colors.config';
import { richTextToPlainText, stripMarkdown } from '@/markket/richtext.utils';

interface EventsPageProps {
  params: Promise<{ slug: string; event_slug: string }>;
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

function formatDateTime(value?: string, timezone?: string) {
  if (!value) return 'Not set';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;

  const options: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  };

  if (hasValidTimeZone(timezone)) {
    options.timeZone = timezone;
    options.timeZoneName = 'short';
  }

  return new Intl.DateTimeFormat('en-US', options).format(parsed);
}

function toExcerpt(value?: unknown, max = 180) {
  if (!value) return '';
  const plain = stripMarkdown(richTextToPlainText(value as string));
  if (!plain) return '';
  return plain.length > max ? `${plain.slice(0, max - 1)}...` : plain;
}

function getHostLabel(url?: string) {
  if (!url) return '';
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
}

export async function generateMetadata({ params }: EventsPageProps) {
  const { slug, event_slug } = await params;
  const response = await strapiClient.getStore(slug);
  const store = response?.data?.[0] as Store;

  const eventResponse = await strapiClient.getEventBySlug(event_slug, slug);
  const event = eventResponse?.data?.[0] as Event;

  const eventName = event?.Name || 'Event';
  const eventDate = event?.startDate ? formatDateTime(event.startDate, event?.timezone) : '';
  const location = '';

  const description = event?.SEO?.metaDescription
    || toExcerpt(event?.Description, 160)
    || `${eventName}${eventDate ? ' on ' + eventDate : ''}${location ? ' at ' + location : ''}. Join us!`;

  return generateSEOMetadata({
    slug,
    entity: {
      SEO: event?.SEO || store?.SEO,
      Name: event?.Name || event?.SEO?.metaTitle,
      Description: description,
      id: event?.id?.toString(),
      url: `/${slug}/events/${event_slug}`,
    },
    type: "article",
    defaultTitle: event?.SEO?.metaTitle || eventName || 'Event',
    keywords: [
      'event',
      'workshop',
      'meetup',
      eventName,
      ...(event?.Tag?.map(t => t.Label) || []),
    ],
  });
}

export default async function StoreEventPage({ params }: EventsPageProps) {
  const { slug, event_slug } = await params;
  const [storeResponse, eventsListResponse] = await Promise.all([
    strapiClient.getStore(slug),
    strapiClient.getEvents(slug),
  ]);
  const store = storeResponse?.data?.[0] as Store;

  if (!store) {
    notFound();
  }

  const eventsResponse = await strapiClient.getEventBySlug(event_slug, slug);
  const event = eventsResponse?.data?.[0] as Event | undefined;

  if (!event) {
    notFound();
  }

  const hasExternalRsvp = Boolean(event?.SEO?.metaUrl);
  const canRsvpInternal = Boolean(event?.documentId || event?.id);
  const externalHostLabel = getHostLabel(event?.SEO?.metaUrl);
  const excerpt = event?.SEO?.metaDescription || toExcerpt(event?.Description, 220);

  const relatedEvents = ((eventsListResponse?.data || []) as Event[])
    .filter((item) => item.slug !== event_slug && new Date(item.startDate) >= new Date())
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
    .slice(0, 3)
    .map((item) => ({
      href: `/${slug}/events/${item.slug}`,
      label: item.Name || item.slug,
    }));

  return (
    <Container size="lg" py="xl">
      <Stack gap="xl">
        <StorePageHeader
          icon={<IconCalendarEvent size={48} />}
          title={event?.Name || `${store?.title} Event`}
          description={excerpt || `Event details for ${store?.title || 'this store'}.`}
          backgroundImage={event?.SEO?.socialImage?.url || event?.Thumbnail?.url || store?.Cover?.url}
          iconColor={markketColors.sections.events.main}
        />

        <SimpleGrid cols={{ base: 1, md: 2 }} spacing="xl">
          <EventImageGallery event={event} />

          <Stack gap="md">
            <Group gap="xs">
              <Badge
                radius="sm"
                variant="light"
                style={{
                  background: markketColors.sections.events.light,
                  color: markketColors.sections.events.main,
                }}
              >
                Event
              </Badge>
              {hasExternalRsvp && (
                <Badge radius="sm" variant="outline" color="gray">External RSVP</Badge>
              )}
            </Group>

            <EventSchedule
              startDate={event?.startDate}
              endDate={event?.endDate}
              timezone={event?.timezone}
            />

            <Paper withBorder radius="lg" p="lg" style={{ borderColor: `${markketColors.sections.events.main}22` }}>
              <div className="prose space-y-6 text-base text-gray-700 dark:prose-invert">
                <Markdown content={event?.Description || ""} />
              </div>
            </Paper>

            <Stack gap="sm" mt="xs">
              {hasExternalRsvp && (
                <Button
                  component="a"
                  href={event.SEO?.metaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  fullWidth
                  size="lg"
                  radius="md"
                  color="pink"
                >
                  RSVP at {externalHostLabel}
                </Button>
              )}

              {canRsvpInternal && !hasExternalRsvp && (
                <RSVPModal
                  eventId={event?.documentId || event?.id?.toString()}
                  eventName={event?.Name}
                  eventStartDate={event?.startDate}
                  eventEndDate={event?.endDate}
                  eventTimezone={event?.timezone}
                  storeName={store?.title}
                  storeSlug={slug}
                  eventSlug={event_slug}
                  storeDocumentId={store?.documentId}
                />
              )}

              {!hasExternalRsvp && !canRsvpInternal && (
                <Text
                  size="sm"
                  style={{
                    border: `1px dashed ${markketColors.neutral.mediumGray}`,
                    borderRadius: 12,
                    background: markketColors.neutral.offWhite,
                    padding: '12px 14px',
                    color: markketColors.neutral.darkGray,
                  }}
                >
                  RSVP options for this event are not available yet.
                </Text>
              )}
            </Stack>
          </Stack>
        </SimpleGrid>

        <StoreCrosslinks
          slug={slug}
          store={store}
          currentSection="events"
          items={relatedEvents}
        />
      </Stack>
    </Container>
  );
};
