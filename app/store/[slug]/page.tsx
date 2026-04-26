
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
import { richTextToPlainText, stripMarkdown } from '@/markket/richtext.utils';
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

function compactRich(value: unknown, max = 96) {
  if (!value) return '';
  const plain = stripMarkdown(richTextToPlainText(value as string));
  return compact(plain, max);
}

function imageOrFallback(...candidates: Array<string | undefined | null>): string | undefined {
  return candidates.find((item): item is string => typeof item === 'string' && item.length > 0);
}

function describeSectionMood(card: SectionPreviewCard): string {
  switch (card.key) {
    case 'shop':
      return card.hasContent
        ? 'A softer way into the catalog: featured pieces, recent drops, and the things this store is ready to share.'
        : '';
    case 'blog':
      return card.hasContent
        ? 'Notes, reflections, process, and small signals from behind the storefront.'
        : '';
    case 'events':
      return card.hasContent
        ? 'Invitations to gather, learn, launch something new, or simply show up together.'
        : '';
    case 'about':
      return card.hasContent
        ? 'The world behind the store: context, story, references, and the pages that make it feel personal.'
        : '';
    default:
      return card.description;
  }
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
  const storeSubtitle = homePage?.SEO?.metaDescription || store?.SEO?.metaDescription || compact(descriptionText, 220);
  const hasStoreDescription = Boolean(descriptionText?.trim());
  const shouldRenderRichDescription = !homePage?.Title && hasStoreDescription;
  const homePageImage = imageOrFallback(
    homePage?.SEO?.socialImage?.formats?.medium?.url,
    homePage?.SEO?.socialImage?.formats?.small?.url,
    homePage?.SEO?.socialImage?.url,
    homePage?.albums?.[0]?.cover?.formats?.medium?.url,
    homePage?.albums?.[0]?.cover?.formats?.small?.url,
    homePage?.albums?.[0]?.cover?.url,
  );
  const hasHomePageStory = Boolean(
    homePage?.Title ||
    homePage?.SEO?.metaDescription ||
    homePage?.Content?.length ||
    homePageImage ||
    homePage?.albums?.length
  );

  const aboutPages = pages.filter((page) => !['home', 'about', 'blog', 'products', 'events'].includes(page.slug || ''));

  const featuredProduct = products[0];
  const featuredPost = posts[0];
  const featuredEvent = [...events]
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
    .find((event) => new Date(event.startDate).getTime() >= Date.now()) || events[0];
  const featuredAbout = aboutPages[0];
  const heroImage = imageOrFallback(
    store?.Cover?.url,
    store?.SEO?.socialImage?.url,
    slides[0]?.src,
    featuredProduct?.Thumbnail?.url,
    featuredPost?.cover?.url,
  );
  const signalCards = [
    {
      label: 'Products',
      value: products.length,
      color: markketColors.sections.shop.main,
      bg: markketColors.sections.shop.light,
    },
    {
      label: 'Stories',
      value: posts.length,
      color: markketColors.sections.blog.main,
      bg: markketColors.sections.blog.light,
    },
    {
      label: 'Events',
      value: events.length,
      color: markketColors.sections.events.main,
      bg: markketColors.sections.events.light,
    },
    {
      label: 'Pages',
      value: aboutPages.length,
      color: markketColors.sections.about.main,
      bg: markketColors.sections.about.light,
    },
  ].filter((card) => card.value > 0);
  const heroNotes = [
    featuredProduct?.Name && `Now showing ${featuredProduct.Name}`,
    featuredPost?.Title && `Latest note: ${featuredPost.Title}`,
    featuredEvent?.Name && `Upcoming: ${featuredEvent.Name}`,
  ].filter((note): note is string => Boolean(note));

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
      description: compactRich(featuredProduct?.Description, 96) || 'Browse your latest drops and essentials in one place.',
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
      description: compactRich(featuredEvent?.Description, 96) || 'Discover upcoming events, launches, and gatherings.',
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
      <Box
        pos="relative"
        mb={72}
        style={{
          overflow: 'hidden',
          background: '#fffdfd',
          borderBottom: '1px solid rgba(15, 23, 42, 0.08)',
        }}
      >
        <Box
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'radial-gradient(circle at top left, rgba(228,0,124,0.08), transparent 34%), radial-gradient(circle at top right, rgba(0,188,212,0.1), transparent 30%), linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(250,250,250,1) 100%)',
          }}
        />
        <Box
          style={{
            position: 'absolute',
            top: -40,
            right: '8%',
            width: 180,
            height: 180,
            border: `3px solid ${markketColors.sections.shop.main}25`,
            borderRadius: 20,
            transform: 'rotate(18deg)',
          }}
        />
        <Box
          style={{
            position: 'absolute',
            bottom: 48,
            left: '6%',
            width: 110,
            height: 110,
            border: `2px dashed ${markketColors.rosa.main}40`,
            borderRadius: 18,
            transform: 'rotate(-14deg)',
          }}
        />
        <Container size="lg" py={{ base: 56, md: 72 }} pos="relative">
          <SimpleGrid cols={{ base: 1, md: 2 }} spacing={{ base: 'xl', md: 36 }} verticalSpacing="xl">
            <Stack gap="lg" justify="center">
              <Group gap="sm" wrap="wrap">
                <Badge
                  size="lg"
                  radius="md"
                  variant="light"
                  leftSection={<IconSparkles size={14} />}
                  style={{
                    background: markketColors.rosa.light,
                    color: markketColors.rosa.main,
                    border: `1px solid ${markketColors.rosa.main}20`,
                  }}
                >
                  Independent storefront
                </Badge>
                <Badge
                  size="lg"
                  radius="md"
                  variant="outline"
                  style={{
                    borderColor: 'rgba(15, 23, 42, 0.16)',
                    color: markketColors.neutral.darkGray,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                  }}
                >
                  {homePage?.Title || 'Editorial homepage'}
                </Badge>
              </Group>

              <Stack gap="xs">
                <Title order={1} style={{ fontSize: 'clamp(2.4rem, 7vw, 5.2rem)', lineHeight: 0.95, letterSpacing: '-0.05em', maxWidth: 760 }}>
                  {store?.title || store?.SEO?.metaTitle}
                </Title>
                <Text
                  maw={640}
                  size="lg"
                  lh={1.75}
                  c="dimmed"
                  style={{ fontSize: 'clamp(1rem, 2.2vw, 1.16rem)' }}
                >
                  {homePage?.SEO?.metaDescription || store?.SEO?.metaDescription || descriptionText || 'A storefront, journal, and gathering place composed as one living page.'}
                </Text>
              </Stack>

              {store?.URLS?.length > 0 && (
                <StoreTabs urls={store.URLS} basePath={`/${slug}`} />
              )}

              <Group gap="sm" wrap="wrap">
                <Link href={`/${slug}/products`} style={{ textDecoration: 'none' }}>
                  <Button radius="xl" size="md" rightSection={<IconArrowRight size={16} />} style={{ background: markketColors.rosa.main }}>
                    Browse the store
                  </Button>
                </Link>
                <Link href={`/${slug}/about`} style={{ textDecoration: 'none' }}>
                  <Button variant="outline" radius="xl" size="md">
                    Read the story
                  </Button>
                </Link>
              </Group>

              {heroNotes.length > 0 && (
                <Paper
                  withBorder
                  radius="xl"
                  p="md"
                  style={{
                    background: 'rgba(255,255,255,0.76)',
                    borderColor: 'rgba(15,23,42,0.09)',
                    boxShadow: '0 12px 30px rgba(15,23,42,0.05)',
                  }}
                >
                  <Stack gap={8}>
                    <Text size="xs" tt="uppercase" fw={800} style={{ letterSpacing: '0.12em', color: markketColors.neutral.mediumGray }}>
                      Current signals
                    </Text>
                    {heroNotes.map((note) => (
                      <Text key={note} size="sm" fw={600} style={{ color: markketColors.neutral.charcoal }}>
                        {note}
                      </Text>
                    ))}
                  </Stack>
                </Paper>
              )}
            </Stack>

            <Stack gap="md">
              <Paper
                radius="xl"
                p="md"
                withBorder
                style={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.96) 0%, rgba(250,250,250,0.92) 100%)',
                  borderColor: 'rgba(15,23,42,0.08)',
                  boxShadow: '0 20px 45px rgba(15, 23, 42, 0.08)',
                }}
              >
                <Box
                  style={{
                    position: 'relative',
                    minHeight: 380,
                    borderRadius: 22,
                    overflow: 'hidden',
                    background: heroImage ? `url(${heroImage}) center/cover no-repeat` : markketColors.gradients.hero,
                  }}
                >
                  <Overlay
                    gradient={heroImage ? markketColors.gradients.overlay : 'linear-gradient(140deg, rgba(228,0,124,0.16), rgba(15,23,42,0.08))'}
                    opacity={heroImage ? 0.42 : 1}
                    zIndex={1}
                  />
                  <Box
                    style={{
                      position: 'absolute',
                      top: 18,
                      left: 18,
                      zIndex: 2,
                    }}
                  >
                    <Paper radius="md" px="sm" py={6} style={{ background: 'rgba(255,255,255,0.88)', backdropFilter: 'blur(8px)' }}>
                      <Text size="xs" fw={800} tt="uppercase" style={{ letterSpacing: '0.12em' }}>
                        Store signal board
                      </Text>
                    </Paper>
                  </Box>
                  <Paper
                    pos="absolute"
                    left={18}
                    bottom={18}
                    radius="xl"
                    p="sm"
                    withBorder
                    style={{
                      zIndex: 2,
                      width: 'min(100%, 240px)',
                      background: 'rgba(255,255,255,0.88)',
                      backdropFilter: 'blur(10px)',
                      borderColor: 'rgba(255,255,255,0.4)',
                    }}
                  >
                    <Group gap="sm" wrap="nowrap" align="center">
                      {store?.Logo?.url ? (
                        <img
                          src={store.Logo.url}
                          alt={store.SEO?.metaTitle || store.title}
                          width={64}
                          height={64}
                          style={{
                            display: 'block',
                            borderRadius: '14px',
                            objectFit: 'contain',
                            background: '#fff',
                            padding: 6,
                          }}
                        />
                      ) : (
                        <Box
                          style={{
                            width: 64,
                            height: 64,
                            borderRadius: 14,
                            background: markketColors.gradients.hero,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1.6rem',
                            fontWeight: 800,
                            color: 'white',
                          }}
                        >
                          {(store.title || store.slug).charAt(0).toUpperCase()}
                        </Box>
                      )}
                      <Stack gap={2} style={{ flex: 1 }}>
                        <Text size="xs" tt="uppercase" fw={800} style={{ letterSpacing: '0.12em', color: markketColors.neutral.mediumGray }}>
                          Identity
                        </Text>
                        <Text fw={700} lh={1.1}>{store?.title || store?.SEO?.metaTitle}</Text>
                        <Text size="xs" c="dimmed" lineClamp={2}>
                          {compact(store?.SEO?.metaDescription || descriptionText || 'Built to publish, sell, and gather in one storefront.', 84)}
                        </Text>
                      </Stack>
                    </Group>
                  </Paper>
                </Box>
              </Paper>

              <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="sm">
                {signalCards.map((card) => (
                  <Paper
                    key={card.label}
                    withBorder
                    radius="xl"
                    p="md"
                    style={{
                      background: card.bg,
                      borderColor: `${card.color}55`,
                    }}
                  >
                    <Text size="xs" tt="uppercase" fw={800} style={{ letterSpacing: '0.1em', color: card.color }}>
                      {card.label}
                    </Text>
                    <Text size="xl" fw={800} style={{ letterSpacing: '-0.04em', color: markketColors.neutral.charcoal }}>
                      {card.value}
                    </Text>
                  </Paper>
                ))}
              </SimpleGrid>
            </Stack>
          </SimpleGrid>
        </Container>
      </Box>

      <Container size="lg" pb="xl">
        <Stack gap="xl">
          {(hasHomePageStory || previewCards.length > 0 || storeSubtitle) && (
            <Paper
              withBorder
              radius="xl"
              p={{ base: 'md', sm: 'lg' }}
              style={{
                background: 'linear-gradient(135deg, rgba(255,248,252,0.94) 0%, rgba(255,255,255,0.98) 48%, rgba(240,249,255,0.92) 100%)',
                borderColor: 'rgba(15, 23, 42, 0.08)',
                boxShadow: '0 16px 36px rgba(15, 23, 42, 0.06)',
              }}
            >
              <Stack gap="md">
                <Group justify="space-between" align="flex-start" wrap="wrap">
                  <Stack gap={4} maw={560}>
                    <Text size="xs" tt="uppercase" fw={700} c="dimmed" style={{ letterSpacing: '0.12em' }}>
                      {homePage?.Title ? 'Home page' : 'From the store'}
                    </Text>
                    <Text fw={700} size="xl" style={{ letterSpacing: '-0.03em' }}>
                      {homePage?.Title || storeSubtitle || 'A small storefront can still feel complete from day one.'}
                    </Text>
                    <Text c="dimmed" lh={1.7}>
                      {homePage?.SEO?.metaDescription
                        || (homePage?.Content?.length
                          ? 'This store already has its own homepage writing and layout, so the front page can feel personal from the start.'
                          : previewCards.length > 0
                            ? 'Open whatever feels alive here first: a product, a story, an event, or a page with more context.'
                            : 'This space can stay simple while it grows. Add things over time, and the homepage will make room for them naturally.')}
                    </Text>
                  </Stack>

                  {homePageImage ? (
                    <Paper
                      radius="lg"
                      p="xs"
                      withBorder
                      style={{
                        width: 'min(100%, 360px)',
                        flex: 1,
                        borderColor: 'rgba(15, 23, 42, 0.08)',
                        background: 'rgba(255,255,255,0.72)',
                      }}
                    >
                      <Box
                        style={{
                          height: 180,
                          borderRadius: 14,
                          background: `url(${homePageImage}) center/cover no-repeat`,
                        }}
                      />
                      <Stack gap={4} p="xs">
                        <Text size="xs" tt="uppercase" fw={800} style={{ letterSpacing: '0.08em', color: markketColors.rosa.main }}>
                          Featured on home
                        </Text>
                        <Text size="sm" fw={700}>
                          {homePage?.Title || store?.title || slug}
                        </Text>
                        {!!homePage?.albums?.length && (
                          <Text size="xs" c="dimmed">
                            Includes {homePage.albums.length} gallery {homePage.albums.length === 1 ? 'set' : 'sets'}
                          </Text>
                        )}
                      </Stack>
                    </Paper>
                  ) : previewCards.length > 0 ? (
                    <Stack gap="xs" maw={360} style={{ flex: 1 }}>
                      <Text size="xs" tt="uppercase" fw={800} style={{ letterSpacing: '0.12em', color: markketColors.neutral.mediumGray }}>
                        Vibe check
                      </Text>
                      {previewCards.slice(0, 3).map((card) => (
                        <Paper key={card.key} radius="lg" p="sm" withBorder style={{ borderColor: `${card.color}35`, background: 'rgba(255,255,255,0.72)' }}>
                          <Stack gap={6}>
                            <Group justify="space-between" align="center" wrap="nowrap">
                              <Text size="xs" tt="uppercase" fw={800} style={{ letterSpacing: '0.08em', color: card.color }}>{card.title}</Text>
                              <Text size="xs" c="dimmed">{card.countLabel}</Text>
                            </Group>
                            <Text size="sm" fw={700}>{card.headline}</Text>
                            <Text size="sm" c="dimmed" lh={1.55}>
                              {describeSectionMood(card)}
                            </Text>
                          </Stack>
                        </Paper>
                      ))}
                    </Stack>
                  ) : null}
                </Group>
              </Stack>
            </Paper>
          )}


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





          {!!homePage?.albums?.length && <Albums albums={homePage.albums as Album[]} store_slug={store.slug} />}

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
