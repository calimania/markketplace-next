
import { strapiClient } from '@/markket/api.strapi';
import { notFound } from 'next/navigation';
import { Container, Title, Text, Stack, Paper, Box, Overlay, Grid, Card, Button, GridCol, Divider } from "@mantine/core";
import { IconShoppingCart, IconArticle, IconCalendar, IconHome, IconNews, IconMail } from '@tabler/icons-react';
import PageContent from '@/app/components/ui/page.content';
import { StoreTabs } from '@/app/components/ui/store.tabs';
import Markdown from '@/app/components/ui/page.markdown';
import { markketColors } from '@/markket/colors.config';

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
      color: markketColors.sections.shop.main,
      bgColor: markketColors.sections.shop.light,
    },
    {
      url: `/store/${slug}/blog`,
      icon: <IconArticle size={24} />,
      title: 'Blog',
      description: `Read ${visibility?.content_summary?.articles_count || 0} articles`,
      show: visibility ? visibility.show_blog : true,
      color: markketColors.sections.blog.main,
      bgColor: markketColors.sections.blog.light,
    },
    {
      url: `/store/${slug}/events`,
      icon: <IconCalendar size={24} />,
      title: 'Events',
      description: visibility?.has_upcoming_events
        ? `${visibility?.content_summary?.upcoming_events_count} upcoming events`
        : `${visibility?.content_summary?.events_count || 0} events`,
      show: visibility ? visibility.show_events : true,
      color: markketColors.sections.events.main,
      bgColor: markketColors.sections.events.light,
    },
    {
      url: `/store/${slug}/about`,
      icon: <IconHome size={24} />,
      title: 'About',
      description: 'Learn more about us',
      show: visibility ? visibility.show_about : true,
      color: markketColors.sections.about.main,
      bgColor: markketColors.sections.about.light,
    },
    {
      url: `/store/${slug}/about/newsletter`,
      icon: <IconNews size={24} />,
      title: 'Newsletter',
      description: 'Subscribe to updates',
      show: visibility ? visibility.show_newsletter : true,
      color: markketColors.sections.newsletter.main,
      bgColor: markketColors.sections.newsletter.light,
    },
  ].filter(link => link.show);

  return (
    <div>
      <Box pos="relative" h={350} mb={60}>
        <Box
          style={{
            backgroundImage: `url(${store.Cover?.url || store?.SEO?.socialImage?.url || ''})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            height: '100%',
            width: '100%',
            filter: 'brightness(0.95)',
          }}
        >
          <Overlay
            gradient="linear-gradient(180deg, rgba(0, 0, 0, 0.3) 0%, rgba(0, 0, 0, 0.6) 100%)"
            opacity={0.7}
            zIndex={1}
          />
        </Box>

        <Paper
          pos="absolute"
          left="50%"
          style={{ transform: 'translate(-50%, 50%)' }}
          bottom={0}
          shadow="xl"
          p="lg"
          withBorder
          radius="lg"
          bg="white"
          className="z-10"
        >
          {store?.Logo?.url && (
            <img
              src={store.Logo.url}
              alt={store.SEO?.metaTitle}
              width={150}
              height={150}
              className="rounded-lg object-contain"
              style={{
                filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.1))',
              }}
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
              <Title order={2} className="mb-6" ta="center">Explore</Title>
              <Grid gutter="md">
                {sectionLinks.map((link) => (
                  <GridCol span={{ base: 12, sm: 6, md: 4 }} key={link.url}>
                    <Card
                      shadow="none"
                      padding="lg"
                      radius="md"
                      component="a"
                      href={link.url}
                      style={{
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        background: markketColors.neutral.white,
                        borderWidth: '1px',
                        borderColor: markketColors.neutral.gray,
                      }}
                      className="hover:shadow-sm"
                    >
                      <Stack gap="md" align="center">
                        <Box
                          style={{
                            width: 48,
                            height: 48,
                            borderRadius: '8px',
                            background: markketColors.neutral.offWhite,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'background 0.2s ease',
                          }}
                        >
                          <Box style={{ color: link.color }}>
                            {link.icon}
                          </Box>
                        </Box>

                        <div style={{ textAlign: 'center' }}>
                          <Text fw={500} size="md" mb={4} style={{ color: markketColors.neutral.charcoal }}>
                            {link.title}
                          </Text>
                          <Text size="xs" style={{ color: markketColors.neutral.mediumGray }}>
                            {link.description}
                          </Text>
                        </div>
                      </Stack>
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

          {/* Newsletter CTA */}
          {(visibility ? visibility.show_newsletter : true) && (
            <>
              <Divider my="xl" />
              <Paper
                p="xl"
                radius="md"
                style={{
                  background: markketColors.neutral.offWhite,
                  borderWidth: '1px',
                  borderColor: markketColors.neutral.gray,
                }}
              >
                <Stack align="center" gap="md">
                  <Box
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: '8px',
                      background: markketColors.rosa.light,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <IconMail size={28} color={markketColors.rosa.main} stroke={1.5} />
                  </Box>
                  <Title order={3} ta="center" fw={500} style={{ color: markketColors.neutral.charcoal }}>
                    Stay Updated
                  </Title>
                  <Text size="sm" ta="center" maw={500} style={{ color: markketColors.neutral.mediumGray, lineHeight: 1.5 }}>
                    Subscribe to our newsletter and be the first to know about new products, events, and exclusive offers.
                  </Text>
                  <Button
                    component="a"
                    href={`/store/${slug}/about/newsletter`}
                    size="md"
                    radius="md"
                    style={{
                      background: markketColors.rosa.main,
                      color: 'white',
                      fontWeight: 500,
                    }}
                    leftSection={<IconMail size={18} />}
                  >
                    Subscribe to Newsletter
                  </Button>
                </Stack>
              </Paper>
            </>
          )}
        </Stack>
      </Container>
    </div>
  );
};
