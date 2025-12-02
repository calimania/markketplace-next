import { Event } from "@/markket/event.d";
import { Store } from "@/markket/store.d";
import { strapiClient } from "@/markket/api.strapi";
import { generateSEOMetadata } from "@/markket/metadata";
import { notFound } from "next/navigation";
import { Container, Button } from "@mantine/core";
import { EventImageGallery } from "@/app/components/events/event.gallery.image";
import RSVPModal from "@/app/components/events/event.rsvp.modal";
import Markdown from "@/app/components/ui/page.markdown";

interface EventsPageProps {
  params: Promise<{ slug: string; event_slug: string }>;
}

export async function generateMetadata({ params }: EventsPageProps) {
  const { slug, event_slug } = await params;
  const response = await strapiClient.getStore(slug);
  const store = response?.data?.[0] as Store;

  const eventResponse = await strapiClient.getEventBySlug(slug, event_slug);
  const event = eventResponse?.data?.[0] as Event;

  const eventName = event?.Name || 'Event';
  const eventDate = event?.startDate ? new Date(event.startDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '';
  const location = '';

  const description = event?.Description
    ? event.Description.substring(0, 160).replace(/<[^>]*>/g, '')
    : `${eventName}${eventDate ? ' on ' + eventDate : ''}${location ? ' at ' + location : ''}. Join us!`;

  return generateSEOMetadata({
    slug,
    entity: {
      SEO: event?.SEO || store?.SEO,
      Name: event?.Name,  // Pass real value, not fallback
      Description: description,
      id: event?.id?.toString(),
      url: `/${slug}/events/${event_slug}`,
    },
    type: "article",
    defaultTitle: 'Event',
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
  const storeResponse = await strapiClient.getStore(slug);
  const store = storeResponse?.data?.[0] as Store;

  if (!store) {
    notFound();
  }

  const eventsResponse = await strapiClient.getEventBySlug(event_slug, slug);

  const event = (eventsResponse?.data?.[0] || []) as Event;

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

              <div className="mt-6">
                <div className="prose space-y-6 text-base text-gray-700 dark:prose-invert">
                  <Markdown content={event?.Description || ""} />
                </div>
              </div>
            </div>
          </div>
          {!event?.SEO?.metaUrl && <RSVPModal eventId={event?.id.toString()} />}
          {event?.SEO?.metaUrl && (
            <Button
              className="mt-8 text-accent-500 dark:text-accent-300 w-full cursor-pointer"
            >
              <a
                href={event?.SEO?.metaUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                RSVP in {(new URL(event?.SEO?.metaUrl)?.hostname)}
              </a>
            </Button>
          )}
        </div>
      </main>
    </Container>
  );
};
