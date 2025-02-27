import { Event } from "@/markket/event.d";
import { Store } from "@/markket/store.d";
import { strapiClient } from "@/markket/api";
import { generateSEOMetadata } from "@/markket/metadata";
import { notFound } from "next/navigation";
import { Container } from "@mantine/core";
import { EventImageGallery } from "@/app/components/events/event.gallery.image";
import RSVPModal from "@/app/components/events/event.rsvp.modal";

interface EventsPageProps {
  params: Promise<{ slug: string; event_slug: string }>;
}

export async function generateMetadata({ params }: EventsPageProps) {
  const { slug, event_slug } = await params;
  const response = await strapiClient.getStore(slug);
  const store = response?.data?.[0] as Store;

  const eventResponse = await strapiClient.getEventBySlug(slug, event_slug);
  const event = eventResponse?.data?.[0] as Event;

  return generateSEOMetadata({
    slug,
    entity: {
      SEO: event?.SEO || store?.SEO,
      title: `${event?.Name} | ${store.title} Event`,
      id: store?.id?.toString(),
      url: `/store/${slug}/events/${event_slug}`,
    },
    type: "article",
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
  console.log(event);

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

              {/* Product description */}
              <div className="mt-6">
                <div className="prose space-y-6 text-base text-gray-700 dark:prose-invert">
                  {event.Description.split("\n\n").map((line, index) => (
                    <div key={index} className="">
                      {line}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          {event?.SEO?.metaUrl && (
            <button
              className="mt-8 text-accent-500 dark:text-accent-300 w-full"
              disabled
            >
              <a
                href={event?.SEO?.metaUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                RSVP in external site
              </a>
            </button>
          )}
          {!event?.SEO?.metaUrl && <RSVPModal eventId={event?.id.toString()} />}
        </div>
      </main>
    </Container>
  );
};
