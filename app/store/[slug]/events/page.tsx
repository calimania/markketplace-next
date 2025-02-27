import { Event } from "@/markket/event.d";
import { Store } from "@/markket/store.d";
import { strapiClient } from "@/markket/api";
import { generateSEOMetadata } from "@/markket/metadata";
import { notFound } from "next/navigation";
import { Container, Title, Text, Paper, SimpleGrid, Group } from '@mantine/core';
import Card from '@/app/components/events/event.card';
import { MainImage } from "../products/[page_slug]/ProductDisplay";

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
    type: "article",
  });
}

export default async function StoreEventsPage({ params }: EventsPageProps) {
  const { slug } = await params;
  const storeResponse = await strapiClient.getStore(slug);
  const store = storeResponse?.data?.[0] as Store;

  const response = await strapiClient.getPage('events', slug);
  const eventPage = response?.data?.[0];

  if (!store) {
    notFound();
  }

  const eventsResponse = await strapiClient.getEvents(slug);

  const events = (eventsResponse?.data || []) as Event[];

  return (
    <Container size="lg" py="xl">
      <Paper
        shadow="sm"
        radius="md"
        mb="xl"
        style={{
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Group align="flex-start" wrap="nowrap">
          {eventPage?.SEO?.socialImage && (
            <div style={{
              width: 280,
              height: 200,
              flexShrink: 0,
              position: 'relative',
              overflow: 'hidden',
              borderRadius: 'var(--mantine-radius-md)',
            }}>
              <MainImage
                title={eventPage.Title}
                image={eventPage.SEO.socialImage}
                style={{
                  objectFit: 'cover',
                  width: '100%',
                  height: '100%',
                }}
              />
            </div>
          )}

          <div style={{ flex: 1, padding: 'var(--mantine-spacing-lg)' }}>
            <Title order={1} size="h2" mb="md">
              {eventPage?.Title || `${store?.title} Events`}
            </Title>
            {eventPage?.SEO?.metaDescription && (
              <Text size="lg" c="dimmed" maw={600}>
                {eventPage.SEO.metaDescription}
              </Text>
            )}
          </div>
        </Group>
      </Paper>

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
}
