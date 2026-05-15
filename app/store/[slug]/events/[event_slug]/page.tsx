import { Event } from "@/markket/event.d";
import { Store } from "@/markket/store.d";
import { strapiClient } from "@/markket/api.strapi";
import { generateSEOMetadata } from "@/markket/metadata";
import { notFound } from "next/navigation";
import { Container, Button } from "@mantine/core";
import { EventImageGallery } from "@/app/components/events/event.gallery.image";
import EventSchedule from "@/app/components/events/event.schedule.client";
import RSVPModal from "@/app/components/events/event.rsvp.modal";
import Markdown from "@/app/components/ui/page.markdown";
import StoreCrosslinks from '@/app/components/ui/store.crosslinks';

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

export async function generateMetadata({ params }: EventsPageProps) {
  const { slug, event_slug } = await params;
  const response = await strapiClient.getStore(slug);
  const store = response?.data?.[0] as Store;

  const eventResponse = await strapiClient.getEventBySlug(event_slug, slug);
  const event = eventResponse?.data?.[0] as Event;

  const eventName = event?.Name || 'Event';
  const eventDate = event?.startDate ? formatDateTime(event.startDate, event?.timezone) : '';
  const location = '';

  const description = event?.Description
    ? event.Description.substring(0, 160).replace(/<[^>]*>/g, '')
    : `${eventName}${eventDate ? ' on ' + eventDate : ''}${location ? ' at ' + location : ''}. Join us!`;

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
  const event = (eventsResponse?.data?.[0] || []) as Event;

  const hasExternalRsvp = Boolean(event?.SEO?.metaUrl);
  const canRsvpInternal = Boolean(event?.documentId || event?.id);

  const relatedEvents = ((eventsListResponse?.data || []) as Event[])
    .filter((item) => item.slug !== event_slug && new Date(item.startDate) >= new Date())
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
    .slice(0, 3)
    .map((item) => ({
      href: `/${slug}/events/${item.slug}`,
      label: item.Name || item.slug,
    }));

  return (
    <Container size="xl" py="xl">
      <main className="lg:px-8 product-page px-4 py-12 sm:px-6">
        <div className="mx-auto w-full">
          <div className="lg:grid lg:grid-cols-2 lg:gap-x-8 lg:items-start items-start gap-4">
            <div className="flex flex-col">
              <EventImageGallery event={event} />
            </div>
            <div className="lg:mt-0 mt-10 px-4 sm:mt-16 sm:px-0">
              <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
                {event.Name}
              </h1>

              <EventSchedule
                startDate={event?.startDate}
                endDate={event?.endDate}
                timezone={event?.timezone}
              />

              <div className="mt-6">
                <div className="prose space-y-6 text-base text-gray-700 dark:prose-invert">
                  <Markdown content={event?.Description || ""} />
                </div>
              </div>

              <div className="mt-8 space-y-3">
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
                    RSVP at {event.SEO?.metaUrl ? new URL(event.SEO.metaUrl).hostname : event.SEO?.metaUrl}
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
                  <p className="rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4 py-3 text-sm text-gray-600">
                    RSVP options for this event are not available yet.
                  </p>
                )}
              </div>
            </div>
          </div>

          <StoreCrosslinks
            slug={slug}
            store={store}
            currentSection="events"
            items={relatedEvents}
          />
        </div>
      </main>
    </Container>
  );
};
