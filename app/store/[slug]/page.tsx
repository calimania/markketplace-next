
import { strapiClient } from '@/markket/api.strapi';
import { notFound } from 'next/navigation';
import { Container, Title, Text, Stack, Paper, Box, Overlay, Button, Divider, Group, Badge } from "@mantine/core";
import { IconShoppingCart, IconArticle, IconCalendar, IconHome, IconNews, IconMail, IconArrowRight, IconSparkles } from '@tabler/icons-react';
import PageContent from '@/app/components/ui/page.content';
import { StoreTabs } from '@/app/components/ui/store.tabs';
import { StoreSectionLinks } from '@/app/components/ui/store.section.links';
import RichTextContent from '@/app/components/ui/richtext.content';
import { markketColors } from '@/markket/colors.config';
import Albums from '@/app/components/ui/albums.grid';
import { generateSEOMetadata } from '@/markket/metadata';
import { Store } from "@/markket/store.d";
import { StoreVisibilityResponse } from "@/markket/store.visibility.d";
import { Metadata } from "next";
import { Album } from '@/markket/album';
import { richTextToPlainText } from '@/markket/richtext.utils';

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
      Description: store?.Description || undefined,
      Logo: store?.Logo,
      id: store?.id?.toString(),
    },
    type: 'website',
    defaultDescription: `Welcome to ${store?.title || 'our store'}`,
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

  const visibilityResponse: StoreVisibilityResponse | null = await strapiClient.getStoreVisibility(store.documentId);
  const visibility = visibilityResponse?.data;

  const descriptionText = richTextToPlainText(store.Description);

  const sectionLinks = [
    {
      url: `/${slug}/products`,
      icon: <IconShoppingCart size={26} stroke={1.5} />,
      title: 'Shop',
      description: `${visibility?.content_summary?.products_count || 0} products`,
      show: visibility ? visibility.show_shop : true,
      color: markketColors.sections.shop.main,
      bgColor: markketColors.sections.shop.light,
    },
    {
      url: `/${slug}/blog`,
      icon: <IconArticle size={26} stroke={1.5} />,
      title: 'Blog',
      description: `${visibility?.content_summary?.articles_count || 0} articles`,
      show: visibility ? visibility.show_blog : true,
      color: markketColors.sections.blog.main,
      bgColor: markketColors.sections.blog.light,
    },
    {
      url: `/${slug}/events`,
      icon: <IconCalendar size={26} stroke={1.5} />,
      title: 'Events',
      description: visibility?.has_upcoming_events
        ? `${visibility?.content_summary?.upcoming_events_count} upcoming`
        : `${visibility?.content_summary?.events_count || 0} events`,
      show: visibility ? visibility.show_events : true,
      color: markketColors.sections.events.main,
      bgColor: markketColors.sections.events.light,
    },
    {
      url: `/${slug}/about`,
      icon: <IconHome size={26} stroke={1.5} />,
      title: 'About',
      description: 'Learn more about us',
      show: visibility ? visibility.show_about : true,
      color: markketColors.sections.about.main,
      bgColor: markketColors.sections.about.light,
    },
    {
      url: `/${slug}/about/newsletter`,
      icon: <IconNews size={26} stroke={1.5} />,
      title: 'Newsletter',
      description: 'Subscribe to updates',
      show: visibility ? visibility.show_newsletter : true,
      color: markketColors.sections.newsletter.main,
      bgColor: markketColors.sections.newsletter.light,
    },
  ].filter(link => link.show);

  return (
    <div>
      {/* Hero */}
      <Box pos="relative" h={380} mb={80}>
        <Box
          style={{
            backgroundImage: store.Cover?.url || store?.SEO?.socialImage?.url
              ? `url(${store.Cover?.url || store?.SEO?.socialImage?.url})`
              : markketColors.gradients.hero,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            height: '100%',
            width: '100%',
          }}
        />
        <Overlay
          gradient={markketColors.gradients.overlay}
          opacity={store.Cover?.url ? 0.55 : 0.15}
          zIndex={1}
        />

        {/* Floating logo card */}
        <Paper
          pos="absolute"
          left="50%"
          style={{ transform: 'translate(-50%, 50%)', zIndex: 10 }}
          bottom={0}
          shadow="xl"
          p="md"
          withBorder
          radius="xl"
          bg="white"
        >
          {store?.Logo?.url ? (
            <img
              src={store.Logo.url}
              alt={store.SEO?.metaTitle || store.title}
              width={120}
              height={120}
              style={{
                display: 'block',
                borderRadius: '12px',
                objectFit: 'contain',
                filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.08))',
              }}
            />
          ) : (
              <Box
                style={{
                  width: 120,
                  height: 120,
                  borderRadius: 12,
                  background: markketColors.gradients.hero,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '2.5rem',
                  fontWeight: 700,
                  color: 'white',
                  letterSpacing: '-1px',
                }}
              >
                {(store.title || store.slug).charAt(0).toUpperCase()}
              </Box>
          )}
        </Paper>
      </Box>

      <Container size="lg" pb="xl">
        <Stack gap="xl">
          {/* Store identity */}
          <Stack align="center" gap="sm" pt={16}>
            <Title order={1} ta="center" style={{ fontSize: 'clamp(1.8rem, 5vw, 3rem)', letterSpacing: '-0.5px' }}>
              {store?.title || store?.SEO?.metaTitle}
            </Title>

            {store?.URLS?.length > 0 && (
              <StoreTabs urls={store.URLS} basePath={`/${slug}`} />
            )}

            {descriptionText ? (
              <Text
                size="md"
                c="dimmed"
                ta="center"
                maw={600}
                lh={1.7}
                lineClamp={4}
                style={{ fontSize: '1.05rem' }}
              >
                {descriptionText}
              </Text>
            ) : store?.SEO?.metaDescription ? (
              <Text size="md" c="dimmed" ta="center" maw={600} lh={1.7}>
                {store.SEO.metaDescription}
              </Text>
            ) : null}
          </Stack>

          {/* Home page rich content (if set) */}
          {!homePage?.Title && store?.Description && (
            <Box maw={720} mx="auto" w="100%">
              <RichTextContent content={store.Description} />
            </Box>
          )}

          {/* Section navigation */}
          {sectionLinks.length > 0 && (
            <Stack gap="md">
              <Group justify="center" gap="xs">
                <IconSparkles size={18} color={markketColors.rosa.main} />
                <Text fw={600} ta="center" size="sm" tt="uppercase" style={{ letterSpacing: '0.08em', color: markketColors.neutral.mediumGray }}>
                  Explore
                </Text>
              </Group>
              <StoreSectionLinks links={sectionLinks} borderColor={markketColors.neutral.gray} />
            </Stack>
          )}

          {/* Home page content */}
          {homePage?.Title && <Title order={2}>{homePage.Title}</Title>}
          <PageContent params={{ page: homePage }} />
          <Albums albums={homePage?.albums as Album[]} store_slug={store.slug} />

          {/* Newsletter CTA */}
          {(visibility ? visibility.show_newsletter : true) && (
            <>
              <Divider />
              <Paper
                p="xl"
                radius="xl"
                style={{
                  background: markketColors.gradients.hero,
                  border: 'none',
                  overflow: 'hidden',
                  position: 'relative',
                }}
              >
                {/* Decorative blob */}
                <Box
                  style={{
                    position: 'absolute',
                    top: -40,
                    right: -40,
                    width: 200,
                    height: 200,
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.06)',
                    pointerEvents: 'none',
                  }}
                />
                <Stack align="center" gap="md" style={{ position: 'relative', zIndex: 1 }}>
                  <Box
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: '14px',
                      background: 'rgba(255,255,255,0.2)',
                      backdropFilter: 'blur(8px)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <IconMail size={26} color="white" stroke={1.5} />
                  </Box>
                  <Title order={3} ta="center" fw={600} c="white">
                    Stay in the loop
                  </Title>
                  <Text size="sm" ta="center" maw={460} c="rgba(255,255,255,0.85)" lh={1.6}>
                    Subscribe and be the first to hear about new drops, events, and exclusive offers.
                  </Text>
                  <Button
                    component="a"
                    href={`/${slug}/about/newsletter`}
                    size="md"
                    radius="xl"
                    rightSection={<IconArrowRight size={16} />}
                    style={{
                      background: 'white',
                      color: markketColors.rosa.main,
                      fontWeight: 600,
                      border: 'none',
                      boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                    }}
                  >
                    Subscribe
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
