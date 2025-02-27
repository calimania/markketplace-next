import { Event } from "@/markket/event.d";
import { Store } from "@/markket/store.d";
import { strapiClient } from "@/markket/api";
import { generateSEOMetadata } from "@/markket/metadata";
import { notFound } from "next/navigation";
import { Container, Grid } from "@mantine/core";
import Card from "./Card";
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

  const response = await strapiClient.getPage("events", slug);
  const eventPage = response?.data?.[0];
  console.log(eventPage);

  if (!store) {
    notFound();
  }

  const eventsResponse = await strapiClient.getEvents(slug);

  const events = (eventsResponse?.data || []) as Event[];
  console.log(events);

  return (
    <Container size="lg" py="xl">
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
    </Container>
  );
}
