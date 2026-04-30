
import { strapiClient } from '@/markket/api.strapi';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Container, Title, Text, Stack, Paper, Box, Overlay, Button, Group, Badge, SimpleGrid } from "@mantine/core";
import { IconShoppingCart, IconArticle, IconCalendar, IconHome, IconNews, IconMail, IconArrowRight, IconSparkles } from '@tabler/icons-react';
import PageContent from '@/app/components/ui/page.content';
import { StoreTabs } from '@/app/components/ui/store.tabs';
import { StoreSectionLinks } from '@/app/components/ui/store.section.links';
import RichTextContent from '@/app/components/ui/richtext.content';
import { markketColors } from '@/markket/colors.config';
import Albums from '@/app/components/ui/albums.grid';
import StoreSlidesGallery from '@/app/components/ui/store.slides.gallery';
import { generateSEOMetadata } from '@/markket/metadata';
import { markketplace } from '@/markket/config';
import { Store } from "@/markket/store.d";
import { StoreVisibilityResponse } from "@/markket/store.visibility.d";
import { Metadata } from "next";
import { Album } from '@/markket/album';
import { richTextToPlainText, stripMarkdown } from '@/markket/richtext.utils';
import type { Product } from '@/markket/product';
import type { Article } from '@/markket/article';
import type { Event } from '@/markket/event';
import type { Page } from '@/markket/page';
import { cache } from 'react';

const getStoreCached = cache((slug: string) => strapiClient.getStore(slug));
const getHomePageCached = cache((slug: string) => strapiClient.getPage('home', slug));

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

function toAbsoluteUrl(path?: string): string | undefined {
  if (!path) return undefined;
  if (/^https?:\/\//i.test(path)) return path;
  const base = (process.env.NEXT_PUBLIC_MARKKETPLACE_URL || markketplace.markket_url || '').replace(/\/$/, '');
  if (!base) return path;
  return `${base}${path.startsWith('/') ? '' : '/'}${path}`;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;

  const response = await getStoreCached(slug);
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
    getStoreCached(slug),
    getHomePageCached(slug),
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
  const hasHomePageBlocks = Boolean(homePage?.Content?.length);

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
  const showSignalSquares = false;
  const showSectionSquares = false;

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
    }
  ].filter(link => link.show);

  const hasPublishedCollections = products.length > 0 || posts.length > 0 || events.length > 0 || aboutPages.length > 0;
  const hasPresentationContent = hasHomePageStory || hasStoreDescription || slides.length > 0 || storeImages.length > 0;
  const shouldShowEmptyLaunchState = !hasPublishedCollections && !hasPresentationContent;
  const siteUrl = (process.env.NEXT_PUBLIC_MARKKETPLACE_URL || markketplace.markket_url || '').replace(/\/$/, '');
  const storefrontUrl = siteUrl ? `${siteUrl}/${slug}` : `/${slug}`;
  const homepageUrl = siteUrl || '/';
  const structuredImage = toAbsoluteUrl(imageOrFallback(heroImage, slides[0]?.src, storeImages[0]?.src, store?.SEO?.socialImage?.url, store?.Logo?.url));
  const structuredLogo = toAbsoluteUrl(imageOrFallback(store?.Logo?.url, store?.SEO?.socialImage?.url));
  const structuredDescription = compact(
    homePage?.SEO?.metaDescription
    || store?.SEO?.metaDescription
    || descriptionText
    || `Discover ${store?.title || slug}`,
    200
  );

  const storefrontJsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        '@id': `${storefrontUrl}#webpage`,
        url: storefrontUrl,
        name: store?.title || slug,
        description: structuredDescription,
        isPartOf: {
          '@id': `${homepageUrl}#website`,
        },
        about: {
          '@id': `${storefrontUrl}#store`,
        },
        primaryImageOfPage: structuredImage ? { '@type': 'ImageObject', url: structuredImage } : undefined,
      },
      {
        '@type': 'Store',
        '@id': `${storefrontUrl}#store`,
        name: store?.title || slug,
        url: storefrontUrl,
        description: structuredDescription,
        image: structuredImage,
        logo: structuredLogo,
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: homepageUrl,
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: store?.title || slug,
            item: storefrontUrl,
          },
        ],
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(storefrontJsonLd) }} />
      <div>
        {/* Hero */}
        <Box
          pos="relative"
          mb={64}
          style={{
            overflow: 'hidden',
            background: '#fcfcfc',
          }}
        >
          <Box
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: 'radial-gradient(circle at top left, rgba(15,23,42,0.06), transparent 34%), radial-gradient(circle at top right, rgba(0,188,212,0.06), transparent 30%), linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(250,250,250,1) 100%)',
            }}
          />
          <Box
            style={{
              position: 'absolute',
              top: -40,
              right: '8%',
              width: 180,
              height: 180,
              border: '2px solid rgba(15, 23, 42, 0.14)',
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
              border: `2px dashed ${markketColors.sections.about.main}40`,
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
                      background: 'rgba(15,23,42,0.06)',
                      color: markketColors.neutral.darkGray,
                      border: '1px solid rgba(15,23,42,0.14)',
                    }}
                  >
                    {homePage?.Title || 'Homepage'}
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
                    {homePage?.SEO?.metaDescription || store?.SEO?.metaDescription || descriptionText || 'Discover the latest collection, stories, and upcoming moments from this store.'}
                  </Text>
                </Stack>

                {store?.URLS?.length > 0 && (
                  <StoreTabs urls={store.URLS} basePath={`/${slug}`} />
                )}

                <Group gap="sm" wrap="wrap">
                  <Link href={`/${slug}/products`} style={{ textDecoration: 'none' }}>
                    <Button radius="xl" size="md" rightSection={<IconArrowRight size={16} />} style={{ background: markketColors.rosa.main }}>
                      Browse products
                    </Button>
                  </Link>
                  <Link href={`/${slug}/about`} style={{ textDecoration: 'none' }}>
                    <Button variant="outline" radius="xl" size="md">
                      Meet the creator
                    </Button>
                  </Link>
                </Group>

              </Stack>

              <Stack gap="md">
                <Box
                  style={{
                    borderRadius: 22,
                    padding: 8,
                    background: 'rgba(255,255,255,0.82)',
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
                      pos="absolute"
                      left={18}
                      bottom={18}
                      style={{
                        zIndex: 2,
                        width: 'min(100%, 240px)',
                        borderRadius: 18,
                        padding: 10,
                        background: 'rgba(255,255,255,0.88)',
                        backdropFilter: 'blur(10px)',
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
                            {compact(store?.SEO?.metaDescription || descriptionText || 'Curated with care for people who connect with this brand.', 84)}
                          </Text>
                        </Stack>
                      </Group>
                    </Box>
                  </Box>
                </Box>

                {showSignalSquares && (
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
                )}
              </Stack>
            </SimpleGrid>
          </Container>
        </Box>

        <Container size="lg" pb="xl">
          <Stack gap="xl">
            {(!hasHomePageBlocks && (hasHomePageStory || previewCards.length > 0 || storeSubtitle)) && (
              <Box
                style={{
                  borderRadius: 22,
                  padding: '16px',
                  background: 'linear-gradient(135deg, rgba(246,248,250,0.94) 0%, rgba(255,255,255,0.98) 48%, rgba(244,248,252,0.92) 100%)',
                  boxShadow: '0 12px 28px rgba(15, 23, 42, 0.05)',
                }}
              >
                <Stack gap="md">
                  <Group justify="space-between" align="flex-start" wrap="wrap">
                    <Stack gap={4} maw={560}>
                      <Text size="xs" tt="uppercase" fw={700} c="dimmed" style={{ letterSpacing: '0.12em' }}>
                        {homePage?.Title ? 'Home page' : 'From the store'}
                      </Text>
                      <Text fw={700} size="xl" style={{ letterSpacing: '-0.03em' }}>
                        {homePage?.Title || storeSubtitle || 'A storefront shaped around the creator behind it.'}
                      </Text>
                    </Stack>

                    {homePageImage ? (
                      <Box
                        style={{
                          width: 'min(100%, 360px)',
                          flex: 1,
                          borderRadius: 14,
                          padding: 6,
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
                          <Text size="sm" fw={700}>
                            {homePage?.Title || store?.title || slug}
                          </Text>
                          {!!homePage?.albums?.length && (
                            <Text size="xs" c="dimmed">
                              Includes {homePage.albums.length} gallery {homePage.albums.length === 1 ? 'set' : 'sets'}
                            </Text>
                          )}
                        </Stack>
                      </Box>
                    ) : null}
                  </Group>
                </Stack>
              </Box>
            )}

            {showSectionSquares && previewCards.length > 0 && (
              <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                {previewCards.map((card) => (
                  <Link key={card.key} href={card.href} style={{ textDecoration: 'none' }}>
                    <Paper
                      withBorder
                      radius="xl"
                      p="md"
                      style={{
                        borderColor: `${card.color}44`,
                        background: `linear-gradient(145deg, ${card.bg} 0%, #ffffff 72%)`,
                        minHeight: 190,
                      }}
                    >
                      <Group justify="space-between" align="flex-start" wrap="nowrap" gap="md">
                        <Stack gap={6} style={{ flex: 1 }}>
                          <Text size="xs" tt="uppercase" fw={800} style={{ letterSpacing: '0.1em', color: card.color }}>
                            {card.title}
                          </Text>
                          <Text fw={700} size="lg" lineClamp={2} style={{ letterSpacing: '-0.02em', color: markketColors.neutral.charcoal }}>
                            {card.headline}
                          </Text>
                          <Text size="sm" c="dimmed" lineClamp={3} lh={1.65}>
                            {card.description}
                          </Text>
                          <Text size="xs" fw={700} style={{ color: card.color }}>
                            {card.countLabel}
                          </Text>
                        </Stack>
                        <Box
                          style={{
                            width: 82,
                            height: 82,
                            borderRadius: 14,
                            flexShrink: 0,
                            background: card.imageUrl ? `url(${card.imageUrl}) center/cover no-repeat` : card.bg,
                            border: `1px solid ${card.color}55`,
                          }}
                        />
                      </Group>
                    </Paper>
                  </Link>
                ))}
              </SimpleGrid>
            )}


            {shouldRenderRichDescription && (
              <Box maw={720} mx="auto" w="100%">
                <RichTextContent content={store.Description} />
              </Box>
            )}

            {hasHomePageBlocks && (
              <Box
                style={{
                  borderRadius: 18,
                  background: '#fff',
                }}
              >
                <PageContent params={{ page: homePage }} />
              </Box>
            )}

            {(products.length > 0 || posts.length > 0 || events.length > 0 || aboutPages.length > 0) && (
              <Stack gap="lg">
                {(visibility ? visibility.show_shop : true) && products.length > 0 && (
                  <Stack gap="sm">
                    <Group justify="space-between" align="center">
                      <Text size="xs" tt="uppercase" fw={800} style={{ letterSpacing: '0.1em', color: markketColors.sections.shop.main }}>
                        Shop
                      </Text>
                      <Link href={`/${slug}/products`} style={{ textDecoration: 'none' }}>
                        <Text size="sm" fw={700} style={{ color: markketColors.sections.shop.main }}>View all</Text>
                      </Link>
                    </Group>
                    <Group gap="md" wrap="nowrap" style={{ overflowX: 'auto', paddingBottom: 4 }}>
                      {products.slice(0, 6).map((product) => {
                        const image = imageOrFallback(
                          product?.Thumbnail?.url,
                          product?.Slides?.[0]?.formats?.medium?.url,
                          product?.Slides?.[0]?.formats?.small?.url,
                          product?.Slides?.[0]?.url,
                          product?.SEO?.socialImage?.url,
                        );

                        return (
                          <Link key={product.documentId || product.id || product.slug} href={`/${slug}/products/${product.slug}`} style={{ textDecoration: 'none', flex: '0 0 270px' }}>
                            <Paper radius="xl" p="sm" style={{ background: '#fff', boxShadow: '0 4px 14px rgba(15, 23, 42, 0.05)' }}>
                              <Box
                                style={{
                                  height: 170,
                                  borderRadius: 12,
                                  background: image ? `url(${image}) center/cover no-repeat` : `${markketColors.sections.shop.light}`,
                                }}
                              />
                              <Stack gap={6} mt="sm">
                                <Text fw={700} lineClamp={2}>{product.Name}</Text>
                                <Text size="sm" c="dimmed" lineClamp={2}>
                                  {compactRich(product.Description, 90) || 'A featured piece from this store.'}
                                </Text>
                              </Stack>
                            </Paper>
                          </Link>
                        );
                      })}
                    </Group>
                  </Stack>
                )}

                {(visibility ? visibility.show_blog : true) && posts.length > 0 && (
                  <Stack gap="sm">
                    <Group justify="space-between" align="center">
                      <Text size="xs" tt="uppercase" fw={800} style={{ letterSpacing: '0.1em', color: markketColors.sections.blog.main }}>
                        Stories
                      </Text>
                      <Link href={`/${slug}/blog`} style={{ textDecoration: 'none' }}>
                        <Text size="sm" fw={700} style={{ color: markketColors.sections.blog.main }}>View all</Text>
                      </Link>
                    </Group>
                    <Group gap="md" wrap="nowrap" style={{ overflowX: 'auto', paddingBottom: 4 }}>
                      {posts.slice(0, 6).map((post) => {
                        const image = imageOrFallback(
                          post?.cover?.formats?.medium?.url,
                          post?.cover?.formats?.small?.url,
                          post?.cover?.url,
                          post?.SEO?.socialImage?.url,
                        );

                        return (
                          <Link key={post.documentId || post.id || post.slug} href={`/${slug}/blog/${post.slug}`} style={{ textDecoration: 'none', flex: '0 0 270px' }}>
                            <Paper radius="xl" p="sm" style={{ background: '#fff', boxShadow: '0 4px 14px rgba(15, 23, 42, 0.05)' }}>
                              <Box
                                style={{
                                  height: 170,
                                  borderRadius: 12,
                                  background: image ? `url(${image}) center/cover no-repeat` : `${markketColors.sections.blog.light}`,
                                }}
                              />
                              <Stack gap={6} mt="sm">
                                <Text fw={700} lineClamp={2}>{post.Title}</Text>
                                <Text size="sm" c="dimmed" lineClamp={2}>
                                  {compact(post?.SEO?.metaDescription || '') || 'A story from this storefront.'}
                                </Text>
                              </Stack>
                            </Paper>
                          </Link>
                        );
                      })}
                    </Group>
                  </Stack>
                )}

                {(visibility ? visibility.show_events : true) && events.length > 0 && (
                  <Stack gap="sm">
                    <Group justify="space-between" align="center">
                      <Text size="xs" tt="uppercase" fw={800} style={{ letterSpacing: '0.1em', color: markketColors.sections.events.main }}>
                        Events
                      </Text>
                      <Link href={`/${slug}/events`} style={{ textDecoration: 'none' }}>
                        <Text size="sm" fw={700} style={{ color: markketColors.sections.events.main }}>View all</Text>
                      </Link>
                    </Group>
                    <Group gap="md" wrap="nowrap" style={{ overflowX: 'auto', paddingBottom: 4 }}>
                      {events.slice(0, 6).map((event) => {
                        const image = imageOrFallback(
                          event?.Thumbnail?.formats?.medium?.url,
                          event?.Thumbnail?.formats?.small?.url,
                          event?.Thumbnail?.url,
                          event?.Slides?.[0]?.formats?.medium?.url,
                          event?.Slides?.[0]?.formats?.small?.url,
                          event?.Slides?.[0]?.url,
                          event?.SEO?.socialImage?.url,
                        );

                        return (
                          <Link key={event.documentId || event.id || event.slug} href={`/${slug}/events/${event.slug}`} style={{ textDecoration: 'none', flex: '0 0 270px' }}>
                            <Paper radius="xl" p="sm" style={{ background: '#fff', boxShadow: '0 4px 14px rgba(15, 23, 42, 0.05)' }}>
                              <Box
                                style={{
                                  height: 170,
                                  borderRadius: 12,
                                  background: image ? `url(${image}) center/cover no-repeat` : `${markketColors.sections.events.light}`,
                                }}
                              />
                              <Stack gap={6} mt="sm">
                                <Text fw={700} lineClamp={2}>{event.Name}</Text>
                                <Text size="sm" c="dimmed" lineClamp={2}>
                                  {compactRich(event.Description, 90) || 'An upcoming event from this store.'}
                                </Text>
                              </Stack>
                            </Paper>
                          </Link>
                        );
                      })}
                    </Group>
                  </Stack>
                )}

                {(visibility ? visibility.show_about : true) && aboutPages.length > 0 && (
                  <Stack gap="sm">
                    <Group justify="space-between" align="center">
                      <Text size="xs" tt="uppercase" fw={800} style={{ letterSpacing: '0.1em', color: markketColors.sections.about.main }}>
                        Pages
                      </Text>
                      <Link href={`/${slug}/about`} style={{ textDecoration: 'none' }}>
                        <Text size="sm" fw={700} style={{ color: markketColors.sections.about.main }}>View all</Text>
                      </Link>
                    </Group>
                    <Group gap="md" wrap="nowrap" style={{ overflowX: 'auto', paddingBottom: 4 }}>
                      {aboutPages.slice(0, 6).map((page) => {
                        const image = imageOrFallback(
                          page?.SEO?.socialImage?.formats?.medium?.url,
                          page?.SEO?.socialImage?.formats?.small?.url,
                          page?.SEO?.socialImage?.url,
                          store?.Cover?.url,
                        );

                        return (
                          <Link key={page.documentId || page.id || page.slug} href={`/${slug}/about/${page.slug}`} style={{ textDecoration: 'none', flex: '0 0 270px' }}>
                            <Paper radius="xl" p="sm" style={{ background: '#fff', boxShadow: '0 4px 14px rgba(15, 23, 42, 0.05)' }}>
                              <Box
                                style={{
                                  height: 170,
                                  borderRadius: 12,
                                  background: image ? `url(${image}) center/cover no-repeat` : `${markketColors.sections.about.light}`,
                                }}
                              />
                              <Stack gap={6} mt="sm">
                                <Text fw={700} lineClamp={2}>{page.Title}</Text>
                                <Text size="sm" c="dimmed" lineClamp={2}>
                                  {compact(page?.SEO?.metaDescription || '', 90) || 'Learn more from this page.'}
                                </Text>
                              </Stack>
                            </Paper>
                          </Link>
                        );
                      })}
                    </Group>
                  </Stack>
                )}
              </Stack>
            )}


            {slides.length > 0 && (
              <StoreSlidesGallery slides={slides} />
            )}

            {slides.length === 0 && storeImages.length > 0 && (
              <StoreSlidesGallery slides={storeImages} title="Gallery" />
            )}

            {shouldShowEmptyLaunchState && (
              <Paper
                withBorder
                radius="xl"
                p={{ base: 'lg', sm: 'xl' }}
                style={{
                  borderColor: 'rgba(15, 23, 42, 0.1)',
                  background: 'linear-gradient(135deg, rgba(255,245,250,0.95) 0%, rgba(255,255,255,0.98) 45%, rgba(235,250,252,0.95) 100%)',
                  boxShadow: '0 14px 34px rgba(15, 23, 42, 0.08)',
                }}
              >
                <Stack gap="md" align="center" ta="center">
                  <Badge
                    size="lg"
                    radius="md"
                    variant="light"
                    style={{
                      background: markketColors.rosa.light,
                      color: markketColors.rosa.main,
                      border: `1px solid ${markketColors.rosa.main}2A`,
                    }}
                  >
                    New highlights coming soon
                  </Badge>
                  <Title order={3} fw={700} style={{ letterSpacing: '-0.02em' }}>
                    This collection is growing.
                  </Title>
                  <Text c="dimmed" maw={640} lh={1.75}>
                    Check back soon for new products, stories, events, and pages.
                    More updates are on the way.
                  </Text>
                  <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="sm" w="100%" maw={760}>
                    <Paper withBorder radius="lg" p="md" style={{ borderColor: `${markketColors.sections.shop.main}35`, background: '#fff' }}>
                      <Text size="xs" tt="uppercase" fw={800} style={{ letterSpacing: '0.1em', color: markketColors.sections.shop.main }}>
                        Shop
                      </Text>
                      <Text size="sm" c="dimmed" lh={1.55}>
                        Product drops will show up here first.
                      </Text>
                    </Paper>
                    <Paper withBorder radius="lg" p="md" style={{ borderColor: `${markketColors.sections.blog.main}35`, background: '#fff' }}>
                      <Text size="xs" tt="uppercase" fw={800} style={{ letterSpacing: '0.1em', color: markketColors.sections.blog.main }}>
                        Blog
                      </Text>
                      <Text size="sm" c="dimmed" lh={1.55}>
                        Stories and updates are coming soon.
                      </Text>
                    </Paper>
                    <Paper withBorder radius="lg" p="md" style={{ borderColor: `${markketColors.sections.events.main}35`, background: '#fff' }}>
                      <Text size="xs" tt="uppercase" fw={800} style={{ letterSpacing: '0.1em', color: markketColors.sections.events.main }}>
                        Events
                      </Text>
                      <Text size="sm" c="dimmed" lh={1.55}>
                        Future sessions and launches will appear here.
                      </Text>
                    </Paper>
                  </SimpleGrid>
                </Stack>
              </Paper>
            )}

            {!hasHomePageBlocks && <PageContent params={{ page: homePage }} />}

            {sectionLinks.length > 0 && (
              <Stack gap="sm">
                <Group justify="center" gap="xs">
                  <IconSparkles size={18} color={markketColors.neutral.darkGray} />
                  <Text fw={600} ta="center" size="sm" tt="uppercase" style={{ letterSpacing: '0.08em', color: markketColors.neutral.mediumGray }}>
                    Quick links
                  </Text>
                </Group>
                <Box style={{ borderRadius: 16 }}>
                  <StoreSectionLinks links={sectionLinks} borderColor={markketColors.neutral.gray} />
                </Box>
              </Stack>
            )}





            {!!homePage?.albums?.length && <Albums albums={homePage.albums as Album[]} store_slug={store.slug} />}

            {/* Newsletter CTA */}
            {(visibility ? visibility.show_newsletter : true) && (
              <Paper
                p="xl"
                radius="xl"
                style={{
                  marginTop: 10,
                  background: '#ffffff',
                  boxShadow: '0 8px 24px rgba(15,23,42,0.05)',
                }}
              >
                <Stack align="center" gap="md">
                  <Box
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: '14px',
                      background: markketColors.sections.newsletter.light,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <IconMail size={26} color={markketColors.sections.newsletter.main} stroke={1.5} />
                  </Box>
                  <Title order={3} ta="center" fw={600} c={markketColors.neutral.charcoal}>
                    Follow this store
                  </Title>
                  <Text size="sm" ta="center" maw={460} c={markketColors.neutral.mediumGray} lh={1.6}>
                    Receive thoughtful updates when new products, stories, and events are shared.
                  </Text>
                  <Button
                    component="a"
                    href={`/${slug}/about/newsletter`}
                    size="md"
                    radius="xl"
                    rightSection={<IconArrowRight size={16} />}
                    style={{
                      background: markketColors.neutral.charcoal,
                      color: 'white',
                      fontWeight: 600,
                      border: 'none',
                      boxShadow: '0 4px 16px rgba(15,23,42,0.18)',
                    }}
                  >
                    Subscribe
                  </Button>
                </Stack>
              </Paper>
            )}
          </Stack>
        </Container>
      </div>
    </>
  );
};
