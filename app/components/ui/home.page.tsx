'use client';

import {
  IconRocket, IconBuildingStore,
  IconArticle, IconSparkles, IconArrowRight,
  IconCalendar, IconPackage,
} from "@tabler/icons-react";
import {
  Container, Title, Text, Button, Group, Stack, SimpleGrid,
  Box, rem, Badge, Card, CardSection, Grid, GridCol
} from "@mantine/core";
import { Store, Page, Article, Event, Product } from "@/markket";
import PageContent from '@/app/components/ui/page.content';
import { markketColors } from "@/markket/colors.config";
import { stripMarkdown } from '@/markket/richtext.utils';
import { StorefrontCarousel } from '@/app/components/ui/storefront.carousel';
import { FeatureCard } from '@/app/components/ui/feature.card';
import { extractRichTextImageUrl } from '@/markket/richtext.utils';

const features = [
  {
    icon: IconRocket,
    title: "Launch in Minutes",
    description: "Verify email, add products, start selling. Simple as that.",
    color: markketColors.sections.events.main,
  },
  {
    icon: IconBuildingStore,
    title: "Own Your Content",
    description: "No ads or invasive trackers",
    color: markketColors.sections.shop.main,
  },
  {
    icon: IconSparkles,
    title: "Customizable",
    description: "Open source, headless, self-host, community support.",
    color: markketColors.rosa.main,
  },
];

const pickBestImage = (...values: Array<string | undefined | null>) => {
  return values.find((value): value is string => Boolean(value));
};

const createFallbackCoverUrl = (seed: string, width: number, height: number) => {
  const safeSeed = encodeURIComponent(seed || 'markket');
  return `https://picsum.photos/seed/${safeSeed}/${width}/${height}?grayscale&blur=1`;
};

const hasValidTimeZone = (value?: string) => {
  if (!value) return false;
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: value }).format(new Date());
    return true;
  } catch {
    return false;
  }
};

const formatEventDate = (value?: string, timeZone?: string) => {
  if (!value) return 'TBD';

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return 'TBD';

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    ...(hasValidTimeZone(timeZone) ? { timeZone } : {}),
  }).format(parsed);
};

type HomePageProps = {
  store?: Store;
  page?: Page;
  communityPosts?: Article[];
  featuredStores?: Store[];
  communityPages?: Page[];
  communityEvents?: Event[];
  communityProducts?: Product[];
};

const SectionLabel = ({ num, label, color }: { num: string; label: string; color?: string }) => (
  <Text
    size="xs"
    fw={600}
    mb={4}
    style={{
      fontFamily: 'monospace',
      letterSpacing: '0.12em',
      textTransform: 'uppercase',
      color: color || markketColors.neutral.mediumGray,
    }}
  >
    {num} — {label}
  </Text>
);

const HomePage = ({ store, page, communityPosts = [], featuredStores = [], communityPages = [], communityEvents = [], communityProducts = [] }: HomePageProps) => {
  const eventsToDisplay = [...communityEvents].sort((a, b) => {
    const aTime = a?.startDate ? new Date(a.startDate).getTime() : Number.MAX_SAFE_INTEGER;
    const bTime = b?.startDate ? new Date(b.startDate).getTime() : Number.MAX_SAFE_INTEGER;
    return aTime - bTime;
  });

  return (
    <main>
      {/* ── 00 — STORES ─────────────────────────────────────── */}
      <Box py={60} style={{ borderBottom: `1px solid ${markketColors.neutral.lightGray}` }}>
        <Container size="lg">
          <Stack gap={32}>
            <Group justify="space-between" align="flex-end">
              <Box>
                <SectionLabel num="00" label="Stores" color={markketColors.sections.shop.main} />
                <Title
                  order={2}
                  style={{
                    fontSize: 'clamp(1.5rem, 4vw, 2.25rem)',
                    fontWeight: 800,
                    letterSpacing: '-0.025em',
                    color: markketColors.neutral.charcoal,
                  }}
                >
                  Discover Creators
                </Title>
              </Box>
              <Button
                component="a"
                href="/stores"
                variant="subtle"
                size="sm"
                rightSection={<IconArrowRight size={14} />}
                style={{ color: markketColors.neutral.darkGray }}
              >
                All stores
              </Button>
            </Group>

            {featuredStores.length > 0 ? (
              <StorefrontCarousel stores={featuredStores} />
            ) : (
                <Box
                  style={{
                    borderRadius: 20,
                    border: `1px dashed ${markketColors.neutral.mediumGray}`,
                    padding: rem(48),
                    textAlign: 'center',
                  }}
                >
                <Text c="dimmed" mb="md">No stores yet — be the first!</Text>
                <Button
                  component="a"
                  href="/auth/magic"
                  style={{ background: markketColors.rosa.main, color: 'white' }}
                >
                  Create your store
                </Button>
              </Box>
            )}
          </Stack>
        </Container>
      </Box>

      {/* ── 01 — PLATFORM ───────────────────────────────────── */}
      <Box
        py={64}
        style={{
          background: markketColors.neutral.offWhite,
          borderBottom: `1px solid ${markketColors.neutral.lightGray}`,
        }}
      >
        <Container size="lg">
          <Grid gap={{ base: 'xl', md: 'xl' }}>
            <GridCol span={{ base: 12, md: 7 }}>
              <Stack gap={16}>
                <SectionLabel num="01" label="Platform" />
                <Title
                  order={2}
                  style={{
                    fontSize: 'clamp(2rem, 5vw, 3.25rem)',
                    fontWeight: 900,
                    letterSpacing: '-0.03em',
                    lineHeight: 1.08,
                    color: markketColors.neutral.charcoal,
                  }}
                >
                  {store?.SEO?.metaTitle || 'Markkët'}
                  <br />
                  <span style={{ color: markketColors.rosa.main }}>Content Manager</span>
                </Title>
              </Stack>
            </GridCol>
            <GridCol span={{ base: 12, md: 5 }}>
              <Stack gap={24}>
                <Text style={{ color: markketColors.neutral.darkGray, lineHeight: 1.65, fontSize: '1.05rem' }}>
                  {store?.SEO?.metaDescription ||
                    'Beautiful storefronts for creators, artists, and small businesses. Start selling today.'}
                </Text>
                <Group gap={12} wrap="wrap">
                  <Button
                    component="a"
                    href="/auth/magic"
                    size="md"
                    radius="md"
                    leftSection={<IconSparkles size={16} />}
                    style={{ background: markketColors.rosa.main, color: 'white' }}
                  >
                    Create your store
                  </Button>
                </Group>
              </Stack>
            </GridCol>
          </Grid>
        </Container>
      </Box>

      <Container size="lg" py={80}>
        <Stack gap={48}>
          {communityPosts.length > 0 && (
            <Container size="lg" py={80}>
              <div>
                <Stack gap={32}>
                  <Group justify="space-between" align="flex-end">
                    <div>
                      <SectionLabel num="02" label="Blog" color={markketColors.sections.blog.main} />
                      <Title order={2} size={rem(36)} style={{ color: markketColors.neutral.charcoal }}>
                        Latest Stories
                      </Title>
                      <Text c="dimmed">Fresh writing from creators across the community.</Text>
                    </div>
                    <Button component="a" href="/blog" variant="outline" rightSection={<IconArrowRight size={16} />}>
                      See all stories
                    </Button>
                  </Group>

                  <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="xl">
                    {communityPosts.slice(0, 6).map((post) => {
                      const contentImage = extractRichTextImageUrl(post?.Content);
                      const coverUrl = pickBestImage(
                        contentImage,
                        post?.cover?.formats?.medium?.url,
                        post?.cover?.formats?.small?.url,
                        post?.cover?.formats?.thumbnail?.url,
                        post?.cover?.url,
                        post?.SEO?.socialImage?.formats?.medium?.url,
                        post?.SEO?.socialImage?.formats?.small?.url,
                        post?.SEO?.socialImage?.formats?.thumbnail?.url,
                        post?.SEO?.socialImage?.url,
                        post?.store?.Logo?.formats?.small?.url,
                        post?.store?.Logo?.formats?.thumbnail?.url,
                        post?.store?.Logo?.url,
                      );
                      const storeSlug = post?.store?.slug;
                      const href = storeSlug ? `/${storeSlug}/blog/${post.slug}` : '/docs';
                      const fallbackCoverUrl = createFallbackCoverUrl(
                        [post.Title, post.slug, post.documentId, storeSlug].filter(Boolean).join('-') || post.id?.toString() || 'blog-post',
                        900,
                        520,
                      );

                      return (
                        <Card
                          key={post.documentId || post.id}
                          withBorder
                          radius="lg"
                          padding={0}
                          component="a"
                          href={href}
                          aria-label={`Read blog post ${post.Title}`}
                          style={{
                            overflow: 'hidden',
                            borderColor: markketColors.neutral.lightGray,
                            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.06)',
                            textDecoration: 'none',
                            transition: 'transform 0.15s, box-shadow 0.15s',
                          }}
                          className="hover:scale-[1.02]"
                        >
                          <CardSection>
                            {coverUrl ? (
                              <img
                                src={coverUrl}
                                alt={post.Title}
                                style={{ width: '100%', height: rem(190), objectFit: 'cover' }}
                                loading="lazy"
                                decoding="async"
                              />
                            ) : (
                              <Box
                                style={{
                                  height: rem(190),
                                    background: `url(${fallbackCoverUrl}) center/cover no-repeat`,
                                    position: 'relative',
                                }}
                              >
                                  <Box
                                    style={{
                                      position: 'absolute',
                                      inset: 0,
                                      background: 'linear-gradient(180deg, rgba(2, 6, 23, 0.08) 0%, rgba(2, 6, 23, 0.42) 100%)',
                                    }}
                                  />
                              </Box>
                            )}
                          </CardSection>

                          <Stack gap="sm" p="md">
                            <Group gap="xs">
                              <Badge variant="outline" color="pink">Blog</Badge>
                              {post?.store?.title && (
                                <Text size="xs" style={{ color: markketColors.neutral.darkGray }}>{post.store.title}</Text>
                              )}
                            </Group>

                            <Title order={3} size="h4" style={{ lineHeight: 1.25 }}>{post.Title}</Title>
                            <Text size="sm" style={{ color: markketColors.neutral.darkGray }} lineClamp={3}>
                              {post?.SEO?.metaDescription || '...'}
                            </Text>

                            <Text
                              size="sm"
                              fw={500}
                              style={{ color: markketColors.sections.blog.main, marginTop: rem(4) }}
                            >
                              Read story →
                            </Text>
                          </Stack>
                        </Card>
                      );
                    })}
                  </SimpleGrid>
                </Stack>
              </div>
            </Container>
          )}


        </Stack>
      </Container>


      {/* ── 03 — EVENTS ──────────────────────────────────── */}
      {eventsToDisplay.length > 0 && (
        <Box
          py={80}
          style={{
            background: `${markketColors.sections.events.light}80`,
            borderTop: `1px solid ${markketColors.neutral.lightGray}`,
          }}
        >
          <Container size="lg">
            <Stack gap={32}>
              <div>
                <SectionLabel num="03" label="Events" color={markketColors.sections.events.main} />
                <Title order={2} size={rem(32)} style={{ color: markketColors.neutral.charcoal }}>
                  Join upcoming events
                </Title>
                <Text c="dimmed">Workshops, launches, and meetups from community stores.</Text>
              </div>

              <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
                {eventsToDisplay.slice(0, 6).map((event: Event) => {
                  const thumbnailUrl = pickBestImage(
                    event?.Thumbnail?.formats?.medium?.url,
                    event?.Thumbnail?.formats?.small?.url,
                    event?.Thumbnail?.formats?.thumbnail?.url,
                    event?.Thumbnail?.url,
                    event?.Slides?.[0]?.formats?.medium?.url,
                    event?.Slides?.[0]?.formats?.small?.url,
                    event?.Slides?.[0]?.formats?.thumbnail?.url,
                    event?.Slides?.[0]?.url,
                    event?.SEO?.socialImage?.formats?.medium?.url,
                    event?.SEO?.socialImage?.formats?.small?.url,
                    event?.SEO?.socialImage?.formats?.thumbnail?.url,
                    event?.SEO?.socialImage?.url,
                    (event as any)?.stores?.[0]?.Logo?.formats?.small?.url,
                    (event as any)?.stores?.[0]?.Logo?.formats?.thumbnail?.url,
                    (event as any)?.stores?.[0]?.Logo?.url,
                  );
                  const storeSlug = (event as any)?.stores?.[0]?.slug;
                  const href = storeSlug ? `/${storeSlug}/events/${event.slug}` : '/stores';
                  const eventDate = formatEventDate(event.startDate, event.timezone);

                  return (
                    <Card
                      key={event.documentId || event.id}
                      withBorder
                      radius="lg"
                      padding={0}
                      component="a"
                      href={href}
                      aria-label={`Learn more about event ${event.Name}`}
                      style={{
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'hidden',
                        borderColor: markketColors.neutral.lightGray,
                        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.06)',
                        textDecoration: 'none',
                        transition: 'transform 0.15s, box-shadow 0.15s',
                      }}
                      className="hover:scale-[1.02]"
                    >
                      <CardSection>
                        {thumbnailUrl ? (
                          <img
                            src={thumbnailUrl}
                            alt={event.Name}
                            style={{ width: '100%', height: rem(170), objectFit: 'cover' }}
                            loading="lazy"
                            decoding="async"
                          />
                        ) : (
                          <Box
                            style={{
                                height: rem(170),
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                                background: markketColors.sections.events.light,
                                color: markketColors.sections.events.main,
                            }}
                          >
                            <Box style={{ textAlign: 'center' }}>
                                <IconCalendar size={30} />
                                <Text size="sm" fw={500}>Event</Text>
                            </Box>
                          </Box>
                        )}
                      </CardSection>

                      <Stack gap="sm" p="md" style={{ flex: 1 }}>
                        <Group gap="xs">
                          <Badge variant="outline" color="green" leftSection={<IconCalendar size={12} />}>{eventDate}</Badge>
                          {(event as any)?.stores?.[0]?.title && (
                            <Text size="xs" style={{ color: markketColors.neutral.darkGray }}>{(event as any).stores[0].title}</Text>
                          )}
                        </Group>

                        <Title order={3} size="h4" style={{ lineHeight: 1.25 }}>{event.Name}</Title>
                        <Text size="sm" style={{ color: markketColors.neutral.darkGray, flex: 1 }} lineClamp={2}>
                          {event?.SEO?.metaDescription || 'Join us for this event'}
                        </Text>

                        <Text
                          size="sm"
                          fw={500}
                          style={{ color: markketColors.sections.events.main, marginTop: 'auto' }}
                        >
                          View event →
                        </Text>
                      </Stack>
                    </Card>
                  );
                })}
              </SimpleGrid>
            </Stack>
          </Container>
        </Box>
      )}

      {/* ── 05 — FEATURES ───────────────────────────────── */}
      {communityProducts.length > 0 && (
        <Box
          py={60}
          style={{
            background: markketColors.neutral.offWhite,
          }}
        >
          <Container size="lg">
            <Stack gap={28}>
              <Box mb={4}>
                <SectionLabel num="05" label="Features" />
              </Box>
              <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing={32}>
                {features.map((feature, index) => (
                  <FeatureCard
                    key={feature.title}
                    icon={feature.icon}
                    title={feature.title}
                    description={feature.description}
                    color={feature.color}
                    index={index}
                  />
                ))}
              </SimpleGrid>
            </Stack>
          </Container>
        </Box>
      )}

      {/* ── 06 — SHOP ───────────────────────────────────── */}
      {communityProducts.length > 0 && (
        <Box
          py={72}
          style={{
            background: `${markketColors.sections.shop.light}54`,
          }}
        >
          <Container size="lg">
            <Stack gap={32}>
              <Group justify="space-between" align="flex-end">
                <div>
                  <SectionLabel num="06" label="Shop" color={markketColors.sections.shop.main} />
                  <Title order={2} size={rem(32)} style={{ color: markketColors.neutral.charcoal }}>
                    Shop Community Picks
                  </Title>
                  <Text c="dimmed">Featured products from active stores.</Text>
                </div>
                <Button component="a" href="/stores" variant="outline" rightSection={<IconArrowRight size={16} />}>
                  Browse Stores
                </Button>
              </Group>

              <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="xl">
                {communityProducts.slice(0, 6).map((product) => {
                  const productImage = pickBestImage(
                    product?.Thumbnail?.url,
                    product?.Slides?.[0]?.formats?.medium?.url,
                    product?.Slides?.[0]?.formats?.small?.url,
                    product?.Slides?.[0]?.formats?.thumbnail?.url,
                    product?.Slides?.[0]?.url,
                  );
                  const storeSlug = (product as any)?.stores?.[0]?.slug;
                  const href = storeSlug ? `/${storeSlug}/products/${product.slug}` : '/stores';
                  const price = typeof product.usd_price === 'number' && product.usd_price > 0
                    ? `$${(product.usd_price / 100).toFixed(2)}`
                    : 'See details';

                  return (
                    <Card
                      key={product.documentId || product.id}
                      withBorder
                      radius="lg"
                      padding={0}
                      component="a"
                      href={href}
                      aria-label={`View product ${product.Name}`}
                      style={{
                        overflow: 'hidden',
                        borderColor: markketColors.neutral.lightGray,
                        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.06)',
                        textDecoration: 'none',
                        transition: 'transform 0.15s, box-shadow 0.15s',
                      }}
                      className="hover:scale-[1.02]"
                    >
                      <CardSection>
                        {productImage ? (
                          <img
                            src={productImage}
                            alt={product.Name}
                            style={{ width: '100%', height: rem(190), objectFit: 'cover' }}
                            loading="lazy"
                            decoding="async"
                          />
                        ) : (
                          <Box
                            style={{
                                height: rem(190),
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                                background: markketColors.sections.shop.light,
                                color: markketColors.sections.shop.main,
                            }}
                          >
                            <Box style={{ textAlign: 'center' }}>
                                <IconPackage size={32} />
                                <Text size="sm" fw={500}>Product</Text>
                            </Box>
                          </Box>
                        )}
                      </CardSection>

                      <Stack gap="sm" p="md">
                        <Group gap="xs">
                          <Badge variant="outline" color="cyan">Product</Badge>
                          {(product as any)?.stores?.[0]?.title && (
                            <Text size="xs" style={{ color: markketColors.neutral.darkGray }}>{(product as any).stores[0].title}</Text>
                          )}
                        </Group>

                        <Title order={3} size="h4" style={{ lineHeight: 1.25 }}>{product.Name}</Title>
                        <Text size="sm" style={{ color: markketColors.neutral.darkGray }} lineClamp={2}>
                          {product?.SEO?.metaDescription || stripMarkdown(product?.Description as string) || 'Discover this product from the Markket community.'}
                        </Text>
                        <Text size="sm" fw={600} style={{ color: markketColors.sections.shop.main }}>
                          {price}
                        </Text>

                        <Text
                          size="sm"
                          fw={500}
                          style={{ color: markketColors.sections.shop.main, marginTop: rem(4) }}
                        >
                          View Product →
                        </Text>
                      </Stack>
                    </Card>
                  );
                })}
              </SimpleGrid>
            </Stack>
          </Container>
        </Box>
      )}

      {page?.Content && (
        <Container size="lg" py={60}>
          <PageContent params={{ page }} />
        </Container>
      )}

      {/* ── 04 — PAGES ──────────────────────────────────── */}
      {communityPages.length > 0 && (
        <Box
          py={80}
          style={{
            background: markketColors.neutral.offWhite,
            borderTop: `1px solid ${markketColors.neutral.lightGray}`,
          }}
        >
          <Container size="lg">
            <Stack gap={32}>
              <div>
                <SectionLabel num="04" label="Pages" color={markketColors.sections.about.main} />
                <Title order={2} size={rem(32)} style={{ color: markketColors.neutral.charcoal }}>
                  From the Community
                </Title>
                <Text c="dimmed">Evergreen pages from creators, studios, and brands.</Text>
              </div>

              <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
                {communityPages.slice(0, 6).map((p) => {
                  const storeSlug = (p as any)?.store?.slug;
                  const href = storeSlug ? `/${storeSlug}/about/${p.slug}` : '/stores';
                  const logoUrl = pickBestImage(
                    (p as any)?.store?.Logo?.formats?.small?.url,
                    (p as any)?.store?.Logo?.formats?.thumbnail?.url,
                    (p as any)?.store?.Logo?.url,
                  );

                  return (
                    <Card
                      key={p.documentId || p.id}
                      withBorder
                      radius="lg"
                      padding="md"
                      component="a"
                      href={href}
                      aria-label={`Read page ${p.Title}`}
                      style={{
                        height: '100%',
                        minHeight: rem(160),
                        borderColor: markketColors.neutral.lightGray,
                        boxShadow: '0 4px 16px rgba(0,0,0,0.05)',
                        textDecoration: 'none',
                        transition: 'transform 0.15s, box-shadow 0.15s',
                      }}
                      className="hover:scale-[1.02]"
                    >
                      {logoUrl && (
                        <CardSection mb="sm">
                          <img
                            src={logoUrl}
                            alt={(p as any)?.store?.title || storeSlug || 'Store'}
                            style={{ width: '100%', height: rem(100), objectFit: 'cover' }}
                            loading="lazy"
                            decoding="async"
                          />
                        </CardSection>
                      )}
                      <Stack gap="xs">
                        {storeSlug && (
                          <Text size="xs" fw={600} tt="uppercase" style={{ color: markketColors.neutral.darkGray }}>
                            {(p as any)?.store?.title || storeSlug}
                          </Text>
                        )}
                        <Title order={3} size="h4" style={{ lineHeight: 1.25, color: markketColors.neutral.charcoal }}>
                          {p.Title}
                        </Title>
                        <Text size="sm" style={{ color: markketColors.neutral.darkGray }} lineClamp={2}>
                          {p.SEO?.metaDescription || 'Read this page from the community.'}
                        </Text>
                        <Text
                          size="sm"
                          fw={500}
                          style={{ color: markketColors.sections.about.main, marginTop: rem(4) }}
                        >
                          Read page →
                        </Text>
                      </Stack>
                    </Card>
                  );
                })}
              </SimpleGrid>
            </Stack>
          </Container>
        </Box>
      )}

      {/* ── CTA ─────────────────────────────────────────── */}
      <Box
        py={80}
        style={{
          background: `linear-gradient(135deg, ${markketColors.rosa.main} 0%, ${markketColors.sections.blog.main} 100%)`,
          borderTop: `1px solid rgba(255,255,255,0.08)`,
        }}
      >
        <Container size="md">
          <Stack gap={24} align="center">
            <Title order={2} ta="center" size={rem(36)} style={{ color: 'white', lineHeight: 1.2 }}>
              Ready to Launch?
            </Title>
            <Text size="lg" ta="center" style={{ color: 'rgba(255,255,255,0.9)' }}>
              Join creators and businesses already selling on Markkët
            </Text>
            <Group gap={16} justify="center" wrap="wrap">
              <Button
                component="a"
                href="/auth/magic"
                size="lg"
                radius="md"
                style={{ background: 'white', color: markketColors.rosa.main, fontWeight: 600 }}
              >
                Create your store
              </Button>
              <Button
                component="a"
                href="/about"
                size="lg"
                radius="md"
                variant="outline"
                style={{ borderColor: 'rgba(255,255,255,0.6)', color: 'white' }}
              >
                About & Policies
              </Button>
            </Group>
          </Stack>
        </Container>
      </Box>
    </main>
  );
}

export default HomePage;

