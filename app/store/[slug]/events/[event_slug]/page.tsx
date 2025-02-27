import { Event } from "@/markket/event.d";
import { Store } from "@/markket/store.d";
import { strapiClient } from "@/markket/api";
import { generateSEOMetadata } from "@/markket/metadata";
import { notFound } from "next/navigation";
import { Container, Grid } from '@mantine/core';

interface EventsPageProps {
  params: Promise<{ slug: string, event_slug: string }>;
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
    type: 'article',
  });
};

export default async function StoreEventPage({ params }: EventsPageProps) {
  const { slug, event_slug } = await params;
  const storeResponse = await strapiClient.getStore(slug);
  const store = storeResponse?.data?.[0] as Store;

  if (!store) {
    notFound();
  }

  const eventsResponse = await strapiClient.getEventBySlug(event_slug, slug);

  const event = eventsResponse?.data?.[0] as Event;

  return (
    <Container size="lg" py="xl">
      <Grid >
        EVENT: {event.Name}
      </Grid>
    </Container>
  );
};
