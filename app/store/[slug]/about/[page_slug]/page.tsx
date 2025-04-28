import { Container, Title, Stack } from '@mantine/core';
import { strapiClient } from '@/markket/api.strapi';
import { notFound } from 'next/navigation';
import PageContent from '@/app/components/ui/page.content';
import { generateSEOMetadata } from '@/markket/metadata';
import { Page, Album } from "@/markket";
import { Metadata } from "next";
import Albums from '@/app/components/ui/albums.grid';

interface PageProps {
  params: Promise<{ page_slug: string, slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug, page_slug } = await params;

  const response = await strapiClient.getPage(page_slug, slug);
  const page = response?.data?.[0] as Page;

  return generateSEOMetadata({
    slug,
    entity: {
      url: `/${slug}`,
      SEO: page?.SEO,
    },
    type: 'article',
  });
};

export default async function AboutPage({ params }: PageProps) {
  const { page_slug, slug } = await params;
  const response = await strapiClient.getPage(page_slug, slug);
  const page = response?.data?.[0];

  if (!page) {
    notFound();
  }

  return (
    <Container size="md">
      <Stack gap="xl">
        {page.SEO?.socialImage && (
          <img
            src={page.SEO.socialImage.url}
            alt={page.Title}
            style={{
              width: '100%',
              height: '300px',
              objectFit: 'cover',
              borderRadius: '8px',
            }}
          />
        )}

        <Title order={1}>{page.Title}</Title>

        <PageContent params={{ page }} />

        <div className="mb-6">
          {page?.albums && page.albums.length > 0 && (
            <div className="py-10">
              <Title order={2} size="h2" ta="left" mb="xl">
                Related
              </Title>
              <Albums albums={page.albums as Album[]} store_slug={slug as ''} />
            </div>
          )}
        </div>
      </Stack>
    </Container>
  );
};
