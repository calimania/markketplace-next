import { Container, Title, Stack, Group, Text, Badge, Card, CardSection, Box, rem } from '@mantine/core';
import { strapiClient } from '@/markket/api.strapi';
import { notFound } from 'next/navigation';
import PageContent from '@/app/components/ui/page.content';
import { generateSEOMetadata } from '@/markket/metadata';
import { Page, Album } from "@/markket";
import { Metadata } from "next";
import Albums from '@/app/components/ui/albums.grid';
import { markketColors } from '@/markket/colors.config';
import Link from 'next/link';

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
      url: `/${slug}/about/${page_slug}`,
      SEO: page?.SEO,
      Title: page?.Title,  // Use page title from database
    },
    type: 'article',
    defaultTitle: 'About',
  });
};

export default async function AboutPage({ params }: PageProps) {
  const { page_slug, slug } = await params;
  const [response, storeResponse, relatedPagesResponse] = await Promise.all([
    strapiClient.getPage(page_slug, slug),
    strapiClient.getStore(slug),
    strapiClient.getPages(slug),
  ]);
  const page = response?.data?.[0];
  const store = storeResponse?.data?.[0];
  const relatedPages = (relatedPagesResponse?.data || []) as Page[];
  const otherPages = relatedPages.filter((p) => p.slug !== page_slug && !['home', 'about'].includes(p.slug || ''));

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

        {/* Store info + other pages */}
        {(store || otherPages.length > 0) && (
          <Box
            mt="xl"
            pt="xl"
            style={{ borderTop: `2px solid ${markketColors.sections.about.light}` }}
          >
            {store && (
              <Link href={`/${slug}`} style={{ textDecoration: 'none' }}>
                <Card
                  withBorder
                  radius="lg"
                  mb={otherPages.length > 0 ? 'lg' : 0}
                  style={{
                    borderColor: markketColors.sections.about.light,
                    background: markketColors.sections.about.light,
                  }}
                >
                  <Group gap="md">
                    {store.Logo?.url && (
                      <img
                        src={store.Logo.url}
                        alt={store.Title || slug}
                        style={{ width: rem(48), height: rem(48), objectFit: 'cover', borderRadius: rem(8) }}
                      />
                    )}
                    <Stack gap={2}>
                      <Text fw={600} size="sm" c="dark">{store.Title || slug}</Text>
                      <Badge size="xs" variant="light" color="cyan">View store</Badge>
                    </Stack>
                  </Group>
                </Card>
              </Link>
            )}

            {otherPages.length > 0 && (
              <Stack gap="xs">
                <Text size="xs" tt="uppercase" fw={600} c="dimmed" mb={4}>More from this store</Text>
                <Group gap="xs" wrap="wrap">
                  {otherPages.map((p) => (
                    <Link key={p.slug} href={`/${slug}/about/${p.slug}`} style={{ textDecoration: 'none' }}>
                      <Badge
                        variant="light"
                        color="cyan"
                        size="md"
                        radius="md"
                        style={{ cursor: 'pointer' }}
                      >
                        {p.Title || p.slug}
                      </Badge>
                    </Link>
                  ))}
                </Group>
              </Stack>
            )}
          </Box>
        )}
      </Stack>
    </Container>
  );
};
