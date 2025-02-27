import { Event } from "@/markket/event.d";
import { Store } from "@/markket/store.d";
import { strapiClient } from "@/markket/api";
import { generateSEOMetadata } from "@/markket/metadata";
import { notFound } from "next/navigation";
import { Container } from "@mantine/core";

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

export const EventMainImage = ({
  image,
  title,
}: {
  image: any;
  title: string;
}) => {
  return (
    <div className="relative overflow-hidden rounded-xl">
      {image?.url && (
        <img
          src={image?.formats?.thumbnail?.url || ""}
          alt={image?.alternativeText || title}
          className="object-cover transform transition-transform h-full w-full"
          loading="eager"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
    </div>
  );
};

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
    <Container size="lg" py="xl">
      <main className="lg:px-8 product-page px-4 py-12 sm:px-6">
        <div className="mx-auto w-full">
          <div className="lg:grid lg:grid-cols-2 lg:gap-x-8 lg:items-start items-start gap-4">
            <div className="flex flex-col">
              <div className="aspect-w-3 aspect-h-4 w-full overflow-hidden rounded-l">
                {event.SEO?.socialImage && (
                  <EventMainImage
                    title={event.Name}
                    image={event.SEO?.socialImage}
                  />
                )}
              </div>
              <div className="flex flex-col">
                {event.Slides?.length > 0 && (
                  <div className="mt-8">
                    <div className="grid grid-cols-6 gap-2">
                      {event?.Slides?.map((slide: any) => (
                        <div
                          key={slide.id}
                          className="product-slide aspect-w-3 aspect-h-4 overflow-hidden rounded-lg"
                        >
                          <img
                            src={slide?.formats?.thumbnail?.url}
                            alt={slide?.alternativeText || ""}
                            data-astro-image={JSON.stringify(
                              slide?.formats?.small
                            )}
                            className="h-full w-full cursor-pointer object-cover object-center transition-opacity hover:opacity-75"
                            aria-label={slide?.caption || ""}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
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
          {/* {!event?.SEO?.metaUrl && (
            <RSVPModal
              eventId={event?.id as string}
              onClose={() => {}}
            />
          )} */}
        </div>
      </main>
    </Container>
  );
}
