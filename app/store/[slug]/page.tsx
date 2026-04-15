
import { strapiClient } from '@/markket/api.strapi';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Container, Title, Text, Stack, Paper, Box, Overlay, Button, Divider, Group, Badge, SimpleGrid } from "@mantine/core";
import { IconShoppingCart, IconArticle, IconCalendar, IconHome, IconNews, IconMail, IconArrowRight, IconSparkles } from '@tabler/icons-react';
import PageContent from '@/app/components/ui/page.content';
import { StoreTabs } from '@/app/components/ui/store.tabs';
import { StoreSectionLinks } from '@/app/components/ui/store.section.links';
import RichTextContent from '@/app/components/ui/richtext.content';
import { markketColors } from '@/markket/colors.config';
import Albums from '@/app/components/ui/albums.grid';
import StoreSlidesGallery from '@/app/components/ui/store.slides.gallery';
import { generateSEOMetadata } from '@/markket/metadata';
import { Store } from "@/markket/store.d";
import { StoreVisibilityResponse } from "@/markket/store.visibility.d";
import { Metadata } from "next";
import { Album } from '@/markket/album';
import { richTextToPlainText } from '@/markket/richtext.utils';
import type { Product } from '@/markket/product';
import type { Article } from '@/markket/article';
import type { Event } from '@/markket/event';
import type { Page } from '@/markket/page';

interface PageProps {
  params: Promise<{ slug: string }>;
}

type SectionPreviewCard = {
  key: string;
  title: string;
  href: string;
  color: string;
  bg: string;
  countLabel: string;
  headline: string;
  description: string;
  imageUrl?: string;
  show: boolean;
  hasContent: boolean;
};

function compact(value?: string | null, max = 96) {
  if (!value) return '';
  const clean = value.trim();
  return clean.length > max ? `${clean.slice(0, max - 1)}...` : clean;
}

function imageOrFallback(...candidates: Array<string | undefined | null>): string | undefined {
  return candidates.find((item): item is string => typeof item === 'string' && item.length > 0);
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

  if (slug === 'favicon.ico') {
    notFound();
  }

  const [response, pageQuery] = await Promise.all([
    strapiClient.getStore(slug),
    strapiClient.getPage('home', slug),
  ]);
  const homePage = pageQuery?.data?.[0];
  const store = response?.data?.[0];

  if (!store) {
    notFound();
  }

  const [visibilityResponse, productsResponse, postsResponse, eventsResponse, pagesResponse] = await Promise.all([
    strapiClient.getStoreVisibility(store.documentId),
    strapiClient.getProducts({ page: 1, pageSize: 6 }, { filter: '', sort: 'updatedAt:desc' }, slug),
    strapiClient.getPosts({ page: 1, pageSize: 6 }, { sort: 'updatedAt:desc' }, slug),
    strapiClient.getEvents(slug),
    strapiClient.getPages(slug),
  ]);

  const visibility = visibilityResponse?.data;
  const products = (productsResponse?.data || []) as Product[];
  const posts = (postsResponse?.data || []) as Article[];
  const events = (eventsResponse?.data || []) as Event[];
  const pages = (pagesResponse?.data || []) as Page[];
  const slides = (store?.Slides || [])
    .map((slide) => ({
      src: imageOrFallback(slide?.formats?.medium?.url, slide?.formats?.small?.url, slide?.url),
      alt: slide?.alternativeText || slide?.caption || store?.title || 'Store slide',
      key: slide?.documentId || slide?.id || slide?.hash || slide?.url || 'slide',
    }))
    .filter((slide): slide is { src: string; alt: string; key: string | number } => !!slide.src);

  const storeImages = slides.length === 0
    ? ([
      store?.Cover?.url && { src: store.Cover.url, alt: `${store.title} cover`, key: 'cover' },
      store?.Logo?.url && { src: store.Logo.url, alt: `${store.title} logo`, key: 'logo' },
      store?.SEO?.socialImage?.url && { src: store.SEO.socialImage.url, alt: store.SEO?.metaTitle || store.title, key: 'social' },
    ].filter(Boolean) as { src: string; alt: string; key: string }[])
    : [];

  const descriptionText = richTextToPlainText(store.Description);
  const hasStoreDescription = Boolean(descriptionText?.trim());
  const shouldRenderRichDescription = !homePage?.Title && hasStoreDescription;

  const aboutPages = pages.filter((page) => !['home', 'about', 'blog', 'products', 'events'].includes(page.slug || ''));

  const featuredProduct = products[0];
  const featuredPost = posts[0];
  const featuredEvent = [...events]
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
    .find((event) => new Date(event.startDate).getTime() >= Date.now()) || events[0];
  const featuredAbout = aboutPages[0];

  const previewCards: SectionPreviewCard[] = [
    {
      key: 'shop',
      title: 'Shop',
      href: `/${slug}/products`,
      show: visibility ? visibility.show_shop : true,
      color: markketColors.sections.shop.main,
      bg: markketColors.sections.shop.light,
      countLabel: `${products.length} products`,
      headline: featuredProduct?.Name || 'Featured products',
      description: compact(featuredProduct?.Description || 'Browse your latest drops and essentials in one place.'),
      hasContent: products.length > 0,
      imageUrl: imageOrFallback(
        featuredProduct?.Thumbnail?.url,
        featuredProduct?.SEO?.socialImage?.formats?.small?.url,
        featuredProduct?.SEO?.socialImage?.url,
      ),
    },
    {
      key: 'blog',
      title: 'Blog',
      href: `/${slug}/blog`,
      show: visibility ? visibility.show_blog : true,
      color: markketColors.sections.blog.main,
      bg: markketColors.sections.blog.light,
      countLabel: `${posts.length} posts`,
      headline: featuredPost?.Title || 'Latest stories',
      description: compact(featuredPost?.SEO?.metaDescription || 'Read stories, updates, and ideas from this store.'),
      hasContent: posts.length > 0,
      imageUrl: imageOrFallback(
        featuredPost?.cover?.formats?.small?.url,
        featuredPost?.cover?.url,
        featuredPost?.SEO?.socialImage?.formats?.small?.url,
        featuredPost?.SEO?.socialImage?.url,
      ),
    },
    {
      key: 'events',
      title: 'Events',
      href: `/${slug}/events`,
      show: visibility ? visibility.show_events : true,
      color: markketColors.sections.events.main,
      bg: markketColors.sections.events.light,
      countLabel: `${events.length} events`,
      headline: featuredEvent?.Name || 'Upcoming sessions',
      description: compact(featuredEvent?.Description || 'Discover upcoming events, launches, and gatherings.'),
      hasContent: events.length > 0,
      imageUrl: imageOrFallback(
        featuredEvent?.Thumbnail?.formats?.small?.url,
        featuredEvent?.Thumbnail?.url,
        featuredEvent?.SEO?.socialImage?.formats?.small?.url,
        featuredEvent?.SEO?.socialImage?.url,
      ),
    },
    {
      key: 'about',
      title: 'About',
      href: `/${slug}/about`,
      show: visibility ? visibility.show_about : true,
      color: markketColors.sections.about.main,
      bg: markketColors.sections.about.light,
      countLabel: `${aboutPages.length} pages`,
      headline: featuredAbout?.Title || 'About this store',
      description: compact(featuredAbout?.SEO?.metaDescription || store?.SEO?.metaDescription || 'Learn the story and explore the world behind this store.'),
      hasContent: aboutPages.length > 0 || hasStoreDescription,
      imageUrl: imageOrFallback(
        featuredAbout?.SEO?.socialImage?.formats?.small?.url,
        featuredAbout?.SEO?.socialImage?.url,
        store?.Cover?.url,
        store?.SEO?.socialImage?.url,
      ),
    },
  ].filter((card) => card.show && card.hasContent);

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
      show: false,
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
            <Badge
              size="lg"
              radius="xl"
              variant="light"
              color="pink"
              leftSection={<IconSparkles size={14} />}
            >
              Independent storefront
            </Badge>

            <Title order={1} ta="center" style={{ fontSize: 'clamp(1.8rem, 5vw, 3rem)', letterSpacing: '-0.5px' }}>
              {store?.title || store?.SEO?.metaTitle}
            </Title>

            {store?.URLS?.length > 0 && (
              <StoreTabs urls={store.URLS} basePath={`/${slug}`} />
            )}

            {!shouldRenderRichDescription && descriptionText ? (
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

          <Paper
            withBorder
            radius="xl"
            p={{ base: 'md', sm: 'lg' }}
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.96) 0%, rgba(250,250,250,0.92) 100%)',
              borderColor: 'rgba(15, 23, 42, 0.08)',
              boxShadow: '0 12px 30px rgba(15, 23, 42, 0.05)',
            }}
          >
            <Stack gap="md">
              <Group justify="space-between" align="flex-start" wrap="wrap">
                <Stack gap={4} maw={560}>
                  <Text size="xs" tt="uppercase" fw={700} c="dimmed" style={{ letterSpacing: '0.12em' }}>
                    At a glance
                  </Text>
                  <Text fw={700} size="xl" style={{ letterSpacing: '-0.03em' }}>
                    A storefront, journal, and gathering place in one link.
                  </Text>
                  <Text c="dimmed" lh={1.7}>
                    Browse what&apos;s for sale, read the latest notes, find upcoming events, and wander through the pages that make this store feel lived in.
                  </Text>
                </Stack>

                <SimpleGrid cols={{ base: 2, sm: 2 }} spacing="sm" verticalSpacing="sm" maw={320} style={{ flex: 1 }}>
                  <Paper withBorder radius="lg" p="sm" bg={markketColors.sections.shop.light} style={{ borderColor: markketColors.sections.shop.main }}>
                    <Text size="xs" tt="uppercase" fw={700} style={{ letterSpacing: '0.08em', color: markketColors.sections.shop.main }}>Shop</Text>
                    <Text fw={700} size="lg">{products.length}</Text>
                  </Paper>
                  <Paper withBorder radius="lg" p="sm" bg={markketColors.sections.blog.light} style={{ borderColor: markketColors.sections.blog.main }}>
                    <Text size="xs" tt="uppercase" fw={700} style={{ letterSpacing: '0.08em', color: markketColors.sections.blog.main }}>Stories</Text>
                    <Text fw={700} size="lg">{posts.length}</Text>
                  </Paper>
                  <Paper withBorder radius="lg" p="sm" bg={markketColors.sections.events.light} style={{ borderColor: markketColors.sections.events.main }}>
                    <Text size="xs" tt="uppercase" fw={700} style={{ letterSpacing: '0.08em', color: markketColors.sections.events.main }}>Events</Text>
                    <Text fw={700} size="lg">{events.length}</Text>
                  </Paper>
                  <Paper withBorder radius="lg" p="sm" bg={markketColors.sections.about.light} style={{ borderColor: markketColors.sections.about.main }}>
                    <Text size="xs" tt="uppercase" fw={700} style={{ letterSpacing: '0.08em', color: markketColors.sections.about.main }}>Pages</Text>
                    <Text fw={700} size="lg">{aboutPages.length}</Text>
                  </Paper>
                </SimpleGrid>
              </Group>
            </Stack>
          </Paper>


          {shouldRenderRichDescription && (
            <Box maw={720} mx="auto" w="100%">
              <RichTextContent content={store.Description} />
            </Box>
          )}

          {previewCards.length > 0 && (
            <Stack gap="md">
              <Group justify="space-between" align="center">
                <Stack gap={2}>
                  <Text size="xs" tt="uppercase" fw={700} c="dimmed" style={{ letterSpacing: '0.12em' }}>
                    Store map
                  </Text>
                  <Title order={2} fw={700} size="lg">{homePage?.Title || 'Start Here'}</Title>
                </Stack>
              </Group>

              <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                {previewCards.map((card) => (
                  <Link key={card.key} href={card.href} style={{ textDecoration: 'none' }}>
                    <Paper
                      withBorder
                      radius="xl"
                      p="md"
                      style={{
                        borderColor: card.color,
                        background: `linear-gradient(180deg, ${card.bg} 0%, rgba(255,255,255,0.98) 100%)`,
                        color: '#0f172a',
                        transition: 'transform 160ms ease, box-shadow 160ms ease',
                        boxShadow: '0 10px 28px rgba(0,0,0,0.07)',
                      }}
                    >
                      <Stack gap="sm">
                        <Group justify="space-between" align="center">
                          <Badge variant="filled" color="dark">{card.title}</Badge>
                          <Text size="xs" fw={600} style={{ color: card.color }}>{card.countLabel}</Text>
                        </Group>

                        {card.imageUrl ? (
                          <Box
                            style={{
                              height: 136,
                              borderRadius: 12,
                              backgroundImage: `url(${card.imageUrl})`,
                              backgroundSize: 'cover',
                              backgroundPosition: 'center',
                              border: '1px solid rgba(15, 23, 42, 0.08)',
                            }}
                          />
                        ) : (
                          <Box
                            style={{
                              height: 136,
                              borderRadius: 12,
                              border: '1px dashed rgba(15, 23, 42, 0.25)',
                              background: 'rgba(255,255,255,0.72)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <Text size="sm" c="dimmed">No thumbnail yet</Text>
                          </Box>
                        )}

                        <Text fw={700} lh={1.3} lineClamp={2}>{card.headline}</Text>
                        <Text size="sm" c="dimmed" lh={1.55} lineClamp={2}>{card.description}</Text>
                        <Group justify="space-between" align="center" mt={2}>
                          <Text size="xs" tt="uppercase" fw={700} style={{ letterSpacing: '0.08em', color: card.color }}>
                            Open {card.title}
                          </Text>
                          <IconArrowRight size={16} color={card.color} />
                        </Group>
                      </Stack>
                    </Paper>
                  </Link>
                ))}
              </SimpleGrid>
            </Stack>
          )}


          {slides.length > 0 && (
            <StoreSlidesGallery slides={slides} />
          )}

          {slides.length === 0 && storeImages.length > 0 && (
            <StoreSlidesGallery slides={storeImages} title="Gallery" />
          )}

          <PageContent params={{ page: homePage }} />

          {sectionLinks.length > 0 && (
            <Stack gap="md">
              <Group justify="center" gap="xs">
                <IconSparkles size={18} color={markketColors.rosa.main} />
                <Text fw={600} ta="center" size="sm" tt="uppercase" style={{ letterSpacing: '0.08em', color: markketColors.neutral.mediumGray }}>
                  Explore
                </Text>
              </Group>
              <Paper withBorder radius="xl" p="md" style={{ borderColor: 'rgba(15, 23, 42, 0.08)', boxShadow: '0 8px 24px rgba(15, 23, 42, 0.05)' }}>
                <StoreSectionLinks links={sectionLinks} borderColor={markketColors.neutral.gray} />
              </Paper>
            </Stack>
          )}





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
