import { Event } from "@/markket/event.d";
import { Store } from "@/markket/store.d";
import { strapiClient } from "@/markket/api";
import Link from "next/link";
import { generateSEOMetadata } from "@/markket/metadata";
import { notFound } from "next/navigation";
import { Container, Grid } from '@mantine/core';

interface EventsPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: EventsPageProps) {
  const { slug } = await params;
  const response = await strapiClient.getStore(slug);
  const store = response?.data?.[0] as Store;


  return generateSEOMetadata({

    slug,
    entity: {
      SEO: store?.SEO,
      title: `${store?.title} Events`,
      id: store?.id?.toString(),
      url: `/store/${slug}/events`,
    },
    type: 'article',
  });
};

export default async function StoreEventsPage({ params }: EventsPageProps) {
  const { slug } = await params;
  const storeResponse = await strapiClient.getStore(slug);
  const store = storeResponse?.data?.[0] as Store;

  if (!store) {
    notFound();
  }

  const eventsResponse = await strapiClient.getEvents(slug);

  const events = (eventsResponse?.data || []) as Event[];

  return (
    <Container size="lg" py="xl">
      <Grid >
        {events.map((event) => (
          <Link key={event.id} href={`/store/${slug}/events/${event.slug}`}>
            {event.Name}
          </Link>
        ))}
      </Grid>
    </Container>
  );
};
