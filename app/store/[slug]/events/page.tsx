import { Event } from "@/markket/event.d";
import { Store } from "@/markket/store.d";
import { strapiClient } from "@/markket/api";
import { generateSEOMetadata } from "@/markket/metadata";
import { notFound } from "next/navigation";
<<<<<<< HEAD
import { Container, Grid } from "@mantine/core";
import Card from "./Card";
import { MainImage } from "../products/[page_slug]/ProductDisplay";
=======
import { Container, Title, Text, Paper, SimpleGrid, Group } from '@mantine/core';
import Card from '@/app/components/events/event.card';
import { EventMainImage } from "@/app/components/events/event.main.image";
>>>>>>> 2316a6155036eb6a18065ebe1222122b608d4756

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

<<<<<<< HEAD
  const response = await strapiClient.getPage("events", slug);
  const eventPage = response?.data?.[0];
  console.log(eventPage);
=======
  const response = await strapiClient.getPage('events', slug);
  const eventPage = response?.data?.[0];
>>>>>>> 2316a6155036eb6a18065ebe1222122b608d4756

  if (!store) {
    notFound();
  }

  const eventsResponse = await strapiClient.getEvents(slug);

  const events = (eventsResponse?.data || []) as Event[];

  return (
    <Container size="lg" py="xl">
<<<<<<< HEAD
      <section
        id="about"
        className="mb-10 mx-auto prose-img:border-0 max-w-4xl"
      >
        {eventPage.SEO?.socialImage && (
          <MainImage
            title={eventPage.Title}
            image={eventPage.SEO?.socialImage}
          />
        )}
        <h1 className="mt-2 text-2xl tracking-wider sm:text-3xl">
          {eventPage.Title || store.title}
        </h1>
        <p>{eventPage.SEO?.metaDescription}</p>
      </section>
      <Grid>
        <ul className="mt-5 flex flex-wrap">
          {events.map((event) => (
            <Card
              key={event.id}
              href={`/store/${slug}/events/${event.slug}`}
              tags={[]}
              image={event.SEO?.socialImage}
              frontmatter={{
                author: "x",
                title: event.Name || event.SEO?.metaTitle || "---",
                pubDatetime: new Date(event.startDate),
                modDatetime: new Date(event.startDate),
                description:
                  event.SEO?.metaDescription || event.Description || "",
              }}
            />
          ))}
        </ul>
      </Grid>
=======
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
              <EventMainImage
                title={eventPage.Title}
                image={eventPage.SEO.socialImage}
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
>>>>>>> 2316a6155036eb6a18065ebe1222122b608d4756
    </Container>
  );
}
