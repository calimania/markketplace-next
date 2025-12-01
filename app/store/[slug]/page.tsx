
import { strapiClient } from '@/markket/api.strapi';
import { notFound } from 'next/navigation';
import { Container, Title, Text, Stack, Paper, Box, Overlay, Grid, Card, Group, Button, GridCol } from "@mantine/core";
import { IconShoppingCart, IconArticle, IconCalendar, IconHome, IconNews } from '@tabler/icons-react';
import PageContent from '@/app/components/ui/page.content';
import { StoreTabs } from '@/app/components/ui/store.tabs';
import Markdown from '@/app/components/ui/page.markdown';

import Albums from '@/app/components/ui/albums.grid';

import { generateSEOMetadata } from '@/markket/metadata';
import { Store } from "@/markket/store.d";
import { StoreVisibilityResponse } from "@/markket/store.visibility.d";
import { Metadata } from "next";
import { Album } from '@/markket/album';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;

  const response = await strapiClient.getStore(slug);
  const store = response?.data?.[0] as Store;

  return generateSEOMetadata({
    slug,
    entity: {
      url: `/${slug}`,
      SEO: store?.SEO,
      id: store?.id?.toString(),
    },
    type: 'article',
  });
};

export default async function StorePage({
  params
}: PageProps) {
  const { slug } = await params;
  const response = await strapiClient.getStore(slug);
  const pageQuery = await strapiClient.getPage('home', slug);
  const homePage = pageQuery?.data?.[0];
  const store = response?.data?.[0];

  if (!store) {
    notFound();
  }

  // Fetch visibility settings
  const visibilityResponse: StoreVisibilityResponse | null = await strapiClient.getStoreVisibility(store.documentId);
  const visibility = visibilityResponse?.data;

  console.log({ visibility })

  // Define section links based on visibility
  const sectionLinks = [
    {
      url: `/store/${slug}/products`,
      icon: <IconShoppingCart size={24} />,
      title: 'Shop',
      description: `Browse ${visibility?.content_summary?.products_count || 0} products`,
      show: visibility ? visibility.show_shop : true,
      color: 'blue',
    },
    {
      url: `/store/${slug}/blog`,
      icon: <IconArticle size={24} />,
      title: 'Blog',
      description: `Read ${visibility?.content_summary?.articles_count || 0} articles`,
      show: visibility ? visibility.show_blog : true,
      color: 'violet',
    },
    {
      url: `/store/${slug}/events`,
      icon: <IconCalendar size={24} />,
      title: 'Events',
      description: visibility?.has_upcoming_events
        ? `${visibility?.content_summary?.upcoming_events_count} upcoming events`
        : `${visibility?.content_summary?.events_count || 0} events`,
      show: visibility ? visibility.show_events : true,
      color: 'green',
    },
    {
      url: `/store/${slug}/about/newsletter`,
      icon: <IconNews size={24} />,
      title: 'Newsletter',
      description: 'Subscribe to updates',
      show: visibility ? visibility.show_newsletter : true,
      color: 'orange',
    },
    {
      url: `/store/${slug}/about`,
      icon: <IconHome size={24} />,
      title: 'About',
      description: 'Learn more about us',
      show: visibility ? visibility.show_about : true,
      color: 'teal',
    },
  ].filter(link => link.show);

  return (
    <div>
      <Box pos="relative" h={300} mb={50}>
        <Box
          style={{
            backgroundImage: `url(${store.Cover?.url || store?.SEO?.socialImage?.url || ''})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            height: '100%',
            width: '100%',
          }}
        >
          <Overlay
            gradient="linear-gradient(180deg, rgba(36, 85, 214, 0.2) 0%, rgba(36, 85, 214, 0.4) 100%)"
            opacity={0.6}
            zIndex={1}
          />
        </Box>

        <Paper
          pos="absolute"
          left="50%"
          style={{ transform: 'translate(-50%, 50%)' }}
          bottom={0}
          shadow="xl"
          p="md"
          withBorder
          radius="md"
          bg="white"
          className="z-10"
        >
          {store?.Logo?.url && (
            <img
              src={store.Logo.url}
              alt={store.SEO?.metaTitle}
              width={150}
              height={150}
              className="rounded-md object-contain"
            />
          )}
        </Paper>
      </Box>

      <Container size="lg" className="pb-20">
        <Stack gap="xl">
          <div className="text-center pt-12">
            <Title className="text-4xl md:text-5xl mb-4">
              {store?.title || store?.SEO?.metaTitle}
            </Title>


            {store?.Description ? (
              <Markdown content={store.Description} />
            ) : (
              <Text size="xl" c="dimmed" className="mx-auto mb-8">
                {store?.SEO?.metaDescription}
              </Text>
            )}
          </div>

          {/* Beautiful Section Links */}
          {sectionLinks.length > 0 && (
            <div>
              <Title order={2} className="mb-6">Explore</Title>
              <Grid gutter="md">
                {sectionLinks.map((link) => (
                  <GridCol span={{ base: 12, sm: 6, md: 4 }} key={link.url}>
                    <Card
                      shadow="sm"
                      padding="lg"
                      radius="md"
                      withBorder
                      component="a"
                      href={link.url}
                      className="transition-all hover:shadow-md hover:-translate-y-1"
                      style={{ cursor: 'pointer' }}
                    >
                      <Group gap="md" mb="xs">
                        <Box style={{ color: `var(--mantine-color-${link.color}-6)` }}>
                          {link.icon}
                        </Box>
                        <div>
                          <Text fw={600} size="lg">
                            {link.title}
                          </Text>
                          <Text size="sm" c="dimmed">
                            {link.description}
                          </Text>
                        </div>
                      </Group>
                      <Button
                        variant="light"
                        color={link.color}
                        fullWidth
                        mt="md"
                        radius="md"
                      >
                        Visit {link.title}
                      </Button>
                    </Card>
                  </GridCol>
                ))}
              </Grid>
            </div>
          )}

          <StoreTabs urls={store?.URLS} />

          {homePage?.Title && <Title order={2}>{homePage.Title}</Title>}
          <PageContent params={{ page: homePage }} />
          <Albums albums={homePage?.albums as Album[]} store_slug={store.slug} />
        </Stack>
      </Container>
    </div>
  );
};
