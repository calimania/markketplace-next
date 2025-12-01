import { Store, Page, Event } from "@/markket";
import { strapiClient } from "@/markket/api.strapi";
import { generateSEOMetadata } from "@/markket/metadata";
import { notFound } from "next/navigation";
import { Container, Text, Paper, SimpleGrid } from '@mantine/core';
import { IconCalendar } from '@tabler/icons-react';
import Card from '@/app/components/events/event.card';
import StorePageHeader from '@/app/components/ui/store.page.header';

interface EventsPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: EventsPageProps) {
  const { slug } = await params;
  const response = await strapiClient.getStore(slug);
  const store = response?.data?.[0] as Store;

  const pageResponse = await strapiClient.getPage('events');
  const page = pageResponse?.data?.[0] as Page;

  return generateSEOMetadata({
    slug,
    entity: {
      SEO: page?.SEO || store?.SEO,
      title: page?.Title || `${store?.title} Events`,
      id: store?.id?.toString(),
      url: `/store/${slug}/events`,
    },
    type: "article",
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
      <StorePageHeader
        icon={<IconCalendar size={48} />}
        title={eventPage?.Title || `${store?.title} Events`}
        description={eventPage?.SEO?.metaDescription}
        page={eventPage}
        backgroundImage={eventPage?.SEO?.socialImage?.url || store?.SEO?.socialImage?.url || store?.Cover?.url}
        iconColor="var(--mantine-color-green-6)"
      />

      <SimpleGrid
        cols={{ base: 1, sm: 2, lg: 3 }}
        spacing="xl"
        verticalSpacing="xl"
        style={{ padding: 'var(--mantine-spacing-md)' }}
      >
        {events.map((event) => (
          <Card
            key={event.id}
            href={`/store/${slug}/events/${event.slug}`}
            tags={event.Tag?.map(tag => tag.Label)}
            image={event.SEO?.socialImage}
            frontmatter={{
              author: store?.title || '',
              title: event.Name || event.SEO?.metaTitle || "---",
              pubDatetime: new Date(event.startDate),
              modDatetime: new Date(event.startDate),
              description: event.SEO?.metaDescription || event.Description || "",
            }}
          />
        ))}
      </SimpleGrid>

      {events.length === 0 && (
        <Paper
          p="xl"
          radius="md"
          ta="center"
          c="dimmed"
        >
          <Text size="lg">No events scheduled at the moment.</Text>
        </Paper>
      )}
    </Container>
  );
};
