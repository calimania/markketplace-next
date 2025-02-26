import { Container } from "@mantine/core";
import { strapiClient } from "@/markket/api";
import { notFound } from "next/navigation";
import { generateSEOMetadata } from "@/markket/metadata";
import { Page } from "@/markket/page";
import { Metadata } from "next";
import { Slide } from "@/markket/product";
// import Card from "./Card";

interface AboutPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: AboutPageProps): Promise<Metadata> {
  const { slug } = await params;

  const response = await strapiClient.getPage("events", slug);
  const page = response?.data?.[0] as Page;

  return generateSEOMetadata({
    slug,
    entity: {
        SEO: page?.SEO,
        title: page?.Title || 'Event',
        id: page?.id?.toString(),
        url: `/store/${slug}/events`,
    },
    type: "article",
    defaultTitle: `${page?.Title}` || 'Event',
  });
}

export default async function EventPage({ params }: AboutPageProps) {
  const { slug } = await params;
  const storeResponse = await strapiClient.getStore(slug);
  const store = storeResponse?.data?.[0];

  if (!store) {
    notFound();
  }


  const eventPageResponse = await strapiClient.getPage("events", slug);
  const eventPage = eventPageResponse?.data?.[0];

  const events = await strapiClient.getEvents();
  console.log(eventPage)
  console.log(events)

  return (
    <Container size="lg" py="xl">
      <section id="about" className="mb-10 mx-auto prose-img:border-0 max-w-4xl">
        {eventPage.SEO?.socialImage && (
          <MainImage
            title={eventPage.Title}
            image={eventPage.SEO?.socialImage}
          />
        )}
        <h1 className="text-2xl tracking-wider sm:text-3xl">
          {eventPage.Title || store.title}
        </h1>
        <p>{eventPage.SEO?.metaDescription}</p>
      </section>

      <ul className="-mx-4 flex flex-wrap">
        {/* {events.map(({ data }) => (
          <Card
            key={data.id}
            href={`/events/${data.slug || slugifyStr("2025" + data.title)}`}
            tags={[]}
            image={data.Thumbnail || data.SEO?.socialImage}
            frontmatter={{
              author: "x",
              title: data.Name || data.SEO?.metaTitle || "---",
              pubDatetime: new Date(data.startDate),
              modDatetime: new Date(data.startDate),
              description: data.SEO?.metaDescription || data.Description || "",
            }}
          />
        ))} */}
      </ul>
    </Container>
  );
}

function MainImage({ image, title }: { image: Slide; title: string }) {
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
}
