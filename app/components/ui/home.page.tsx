'use client';

import { useEffect, useState } from "react";
import {
  IconRocket, IconBuildingStore, IconShoppingCart,
  IconArticle, IconSparkles, IconArrowRight,
  IconCheck, IconStars, IconFileText, IconCalendar, IconPackage,
} from "@tabler/icons-react";
import {
  Container, Title, Text, Button, Group, Stack, SimpleGrid,
  Paper, Box, rem, Badge, Card, CardSection, Grid, GridCol
} from "@mantine/core";
import { Carousel } from '@mantine/carousel';
import { useMediaQuery } from '@mantine/hooks';
import { motion } from 'framer-motion';
import { Store, Page, Article, Event, Product } from "@/markket";
import PageContent from '@/app/components/ui/page.content';
import { useAuth } from "@/app/providers/auth.provider";
import { markketColors } from "@/markket/colors.config";
import Link from "next/link";
import { StoreCard } from "@/app/components/stores/card";
import { stripMarkdown } from '@/markket/richtext.utils';

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
    title: "Open & Free",
    description: "Open source, self-host ready, community support.",
    color: markketColors.rosa.main,
  },
];

const benefits = [
  "Free & easy quickstart",
  "Blog, events & subscribers built-in",
  "Growing extensibility",
  "Simplified dashboards",
];

const revealUp = {
  hidden: { opacity: 0, y: 18 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: 'easeOut' as const }
  }
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

const HomePage = ({ store, page, communityPosts = [], featuredStores = [], communityPages = [], communityEvents = [], communityProducts = [] }: HomePageProps) => {
  const { maybe } = useAuth();
  const isXs = useMediaQuery('(max-width: 36em)');
  const isSm = useMediaQuery('(max-width: 48em)');
  const isMd = useMediaQuery('(max-width: 62em)');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [mounted, setMounted] = useState(false);

  const compactSlideSize = isXs ? '88%' : isSm ? '50%' : isMd ? '33.333333%' : '25%';

  // Strapi already filters to upcoming events via getCommunityEvents, but guard client-side too
  const eventsToDisplay = communityEvents.filter(e => Boolean(e?.startDate));

  useEffect(() => {
    setIsLoggedIn(maybe());
    setMounted(true);
  }, [maybe]);

  return (
    <main className="min-h-screen">
      <Box
        style={{
          background: 'white',
          position: 'relative',
          overflow: 'hidden',
          borderBottom: `1px solid ${markketColors.neutral.lightGray}`,
        }}
      >
        {/* Geometric background - client only to prevent hydration mismatch */}
        {mounted && (
        <Box
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: 0.6,
          }}
        >
          {/* Diagonal stripes animation */}
          <Box
            style={{
              position: 'absolute',
              top: '-50%',
              left: '-50%',
              width: '200%',
              height: '200%',
              background: `
                repeating-linear-gradient(
                  45deg,
                  transparent,
                  transparent 80px,
                  ${markketColors.rosa.main}08 80px,
                  ${markketColors.rosa.main}08 160px
                )
              `,
              animation: 'slide-diagonal 60s linear infinite',
            }}
          />

          {/* Geometric squares - random positions */}
          {/* Cuadrado 1 - cyan */}
          <Box
            style={{
              position: 'absolute',
              top: '12%',
              right: '8%',
              width: 120,
              height: 120,
              border: `3px solid ${markketColors.sections.shop.main}40`,
              borderRadius: 12,
              transform: 'rotate(45deg)',
                willChange: 'transform, opacity',
              animation: 'float-rotate 20s ease-in-out infinite',
            }}
          />

          {/* Cuadrado 2 - rosa */}
          <Box
            style={{
              position: 'absolute',
              top: '28%',
              left: '12%',
              width: 65,
              height: 65,
              border: `2px solid ${markketColors.rosa.main}35`,
              borderRadius: 8,
              transform: 'rotate(18deg)',
                willChange: 'transform, opacity',
                animation: 'float-rotate-soft 18s ease-in-out infinite 2s',
            }}
          />

          {/* Cuadrado 3 - verde */}
          <Box
            style={{
              position: 'absolute',
              bottom: '18%',
              left: '6%',
              width: 85,
              height: 85,
              border: `3px solid ${markketColors.sections.events.main}35`,
              borderRadius: 10,
              transform: 'rotate(-12deg)',
                willChange: 'transform, opacity',
                animation: 'float-sway 22s ease-in-out infinite 3s',
            }}
          />

          {/* Cuadrado 4 - magenta */}
          <Box
            style={{
              position: 'absolute',
              bottom: '32%',
              right: '18%',
              width: 95,
              height: 95,
              border: `2px solid ${markketColors.sections.blog.main}30`,
              borderRadius: 10,
              transform: 'rotate(28deg)',
                willChange: 'transform, opacity',
              animation: 'float-rotate 19s ease-in-out infinite 4s',
            }}
          />

          {/* Rectángulo 1 - verde */}
          <Box
            style={{
              position: 'absolute',
              top: '18%',
              right: '38%',
              width: 110,
              height: 50,
              border: `2px solid ${markketColors.sections.events.main}28`,
              borderRadius: 6,
              transform: 'rotate(-8deg)',
                willChange: 'transform, opacity',
                animation: 'float-sway 24s ease-in-out infinite 5s',
            }}
          />

          {/* Cuadrado 5 - cyan pequeño */}
          <Box
            style={{
              position: 'absolute',
              top: '65%',
              left: '22%',
              width: 55,
              height: 55,
              border: `2px solid ${markketColors.sections.shop.main}30`,
              borderRadius: 6,
              transform: 'rotate(35deg)',
                willChange: 'transform, opacity',
                animation: 'float-pulse-rotate 21s ease-in-out infinite 1s',
            }}
          />

          {/* Rectángulo 2 - rosa */}
          <Box
            style={{
              position: 'absolute',
              bottom: '42%',
              right: '5%',
              width: 75,
              height: 40,
              border: `2px solid ${markketColors.rosa.main}32`,
              borderRadius: 5,
              transform: 'rotate(15deg)',
                willChange: 'transform, opacity',
                animation: 'float-rotate-soft 23s ease-in-out infinite 6s',
            }}
          />
        </Box>
        )}

        <Container size="lg" py={80}>
          <motion.div initial="hidden" animate="show" variants={revealUp}>
            <Stack gap={48} align="center" style={{ position: 'relative', zIndex: 1 }}>
            <Badge
              size="lg"
              radius="md"
              variant="light"
              leftSection={<IconStars size={16} />}
              style={{
                background: markketColors.neutral.offWhite,
                color: markketColors.rosa.main,
                border: `1px solid ${markketColors.rosa.main}20`,
              }}
            >
              Comercio Ëlectrónico
            </Badge>

            <Title
              order={1}
              ta="center"
              mb={32}
              style={{
                fontSize: 'clamp(2rem, 8vw, 4rem)',
                fontWeight: 900,
                background: `linear-gradient(135deg, ${markketColors.neutral.charcoal} 0%, ${markketColors.neutral.darkGray} 100%)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                lineHeight: 1.1,
                letterSpacing: '-0.02em',
              }}
            >
              {store?.SEO?.metaTitle || 'Markkët'}
              <br />
              <span style={{
                background: `linear-gradient(135deg, ${markketColors.rosa.main} 0%, ${markketColors.sections.blog.main} 100%)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>
                Content Manager
              </span>
            </Title>

            <Text
              size="xl"
              ta="center"
              maw={700}
              mx="auto"
              style={{
                color: markketColors.neutral.darkGray,
                lineHeight: 1.6,
                fontSize: 'clamp(1rem, 2.5vw, 1.25rem)',
              }}
            >
              {store?.SEO?.metaDescription ||
                'Beautiful storefronts for creators, artists, and small businesses. Start selling today.'}
            </Text>

            <Group gap={16} mt={32} justify="center" wrap="wrap">
              <Button
                component="a"
                href={mounted && isLoggedIn ? '/me' : '/auth/magic'}
                size="lg"
                radius="md"
                suppressHydrationWarning
                leftSection={<IconSparkles size={20} />}
                style={{
                  background: mounted && isLoggedIn
                    ? `linear-gradient(135deg, ${markketColors.rosa.main} 0%, ${markketColors.sections.blog.main} 100%)`
                    : markketColors.rosa.main,
                  color: 'white',
                  fontWeight: 600,
                  boxShadow: `0 4px 14px ${markketColors.rosa.main}30`,
                  position: 'relative',
                  overflow: 'hidden',
                }}
                className="transform hover:scale-105 transition-transform"
              >
                {mounted && isLoggedIn && (
                  <Box
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: '-100%',
                      width: '100%',
                      height: '100%',
                      background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                      animation: 'shimmer 3s infinite',
                    }}
                  />
                )}
                <span style={{ position: 'relative', zIndex: 1 }}>
                  {mounted && isLoggedIn ? 'Open Workspace' : 'Create Your Store'}
                </span>
              </Button>

              <Button
                component="a"
                href="/stores"
                size="lg"
                radius="md"
                variant="outline"
                leftSection={<IconShoppingCart size={20} />}
                style={{
                  color: markketColors.neutral.charcoal,
                  borderColor: markketColors.neutral.mediumGray,
                }}
                className="transform hover:scale-105 transition-transform"
              >
                Explore Stores
              </Button>
            </Group>
            </Stack>
          </motion.div>
        </Container>
      </Box>

      <style jsx>{`
        @keyframes slide-diagonal {
          0% {
            transform: translate(0, 0);
          }
          100% {
            transform: translate(50px, 50px);
          }
        }

        @keyframes float-rotate {
          0%, 100% {
            transform: translateY(0) rotate(45deg);
            opacity: 0.6;
          }
          50% {
            transform: translateY(-16px) rotate(55deg);
            opacity: 0.9;
          }
        }

        @keyframes float-rotate-soft {
          0%, 100% {
            transform: translate3d(0, 0, 0) rotate(16deg) scale(1);
            opacity: 0.45;
          }
          35% {
            transform: translate3d(8px, -10px, 0) rotate(24deg) scale(1.02);
            opacity: 0.78;
          }
          70% {
            transform: translate3d(-4px, 6px, 0) rotate(10deg) scale(0.98);
            opacity: 0.58;
          }
        }

        @keyframes float-sway {
          0%, 100% {
            transform: translate3d(0, 0, 0) rotate(-10deg);
            opacity: 0.4;
          }
          30% {
            transform: translate3d(10px, -12px, 0) rotate(-4deg);
            opacity: 0.72;
          }
          65% {
            transform: translate3d(-8px, 8px, 0) rotate(-14deg);
            opacity: 0.55;
          }
        }

        @keyframes float-pulse-rotate {
          0%, 100% {
            transform: translate3d(0, 0, 0) rotate(35deg) scale(1);
            opacity: 0.35;
          }
          40% {
            transform: translate3d(6px, -12px, 0) rotate(46deg) scale(1.08);
            opacity: 0.75;
          }
          75% {
            transform: translate3d(-6px, 4px, 0) rotate(28deg) scale(0.94);
            opacity: 0.45;
          }
        }

        @keyframes float-pulse {
          0%, 100% {
            transform: scale(1);
            opacity: 0.3;
          }
          50% {
            transform: scale(1.1);
            opacity: 0.5;
          }
        }

        @keyframes shimmer {
          0% {
            left: -100%;
          }
          100% {
            left: 100%;
          }
        }
      `}</style>

      {/* Featured stores */}
      {featuredStores.length > 0 && (
        <Container size="lg" py={60}>
          <Stack gap={32}>
            <Group justify="space-between" align="flex-end">
              <div>
                <Badge
                  size="lg"
                  radius="md"
                  variant="light"
                  leftSection={<IconBuildingStore size={14} />}
                  style={{ background: markketColors.sections.shop.light, color: markketColors.sections.shop.main, marginBottom: rem(8) }}
                >
                  Active Stores
                </Badge>
                <Title order={2} size={rem(32)} style={{ color: markketColors.neutral.charcoal }}>
                  Discover Creators
                </Title>
              </div>
              <Button component="a" href="/stores" variant="outline" size="sm" radius="xl" rightSection={<IconArrowRight size={14} />}>
                All stores
              </Button>
            </Group>

            {/* First two featured, larger */}
            {featuredStores.length >= 2 && (
              <Grid gap="lg">
                {featuredStores.slice(0, 2).map((s, i) => (
                  <GridCol key={s.id} span={{ base: 12, sm: 6 }}>
                    <StoreCard store={s} idx={i} featured />
                  </GridCol>
                ))}
              </Grid>
            )}

            {/* Remaining stores smaller */}
            {featuredStores.length > 2 && (
              <SimpleGrid cols={{ base: 2, sm: 3, md: 4 }} spacing="md">
                {featuredStores.slice(2, 6).map((s, i) => (
                  <StoreCard key={s.id} store={s} idx={i + 2} />
                ))}
              </SimpleGrid>
            )}

            {/* Edge case: only one store */}
            {featuredStores.length === 1 && (
              <Grid gap="lg">
                <GridCol span={{ base: 12, sm: 6 }}>
                  <StoreCard store={featuredStores[0]} idx={0} featured />
                </GridCol>
              </Grid>
            )}
          </Stack>
        </Container>
      )}

      <Container size="lg" py={80}>
        <Stack gap={48}>
          <div style={{ marginBottom: rem(48) }}>
            <Title order={2} ta="center" size={rem(42)} mb={24} style={{ color: markketColors.neutral.charcoal }}>
              {page?.SEO?.metaTitle || page?.Title || 'Simple design, powerful results'}
            </Title>
            <Text size="lg" ta="center" c="dimmed" maw={700} mx="auto">
              {page?.SEO?.metaDescription || 'A complete web publishing and ecommerce platform for creators and small businesses'}
            </Text>
            {mounted && !isLoggedIn && (
              <>
                <Text size="sm" ta="center" c="dimmed" maw={700} mx="auto">
                  Prefer passwordless login? Use a magic link and land directly in your workspace.
                </Text>
                <Group justify="center">
                  <Button component="a" href="/auth/magic" variant="subtle" leftSection={<IconSparkles size={16} />}>
                    Magic Link Login
                  </Button>
                </Group>
              </>
            )}
          </div>

          <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing={32}>
            {features.map((feature, index) => (
              <Paper
                key={index}
                radius="lg"
                p={32}
                style={{
                  border: `1px solid ${markketColors.neutral.lightGray}`,
                  transition: 'all 0.2s ease',
                  cursor: 'default',
                }}
              >
                <Stack gap={20}>
                  <Box
                    style={{
                      width: 60,
                      height: 60,
                      borderRadius: 12,
                      background: `${feature.color}15`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <feature.icon size={30} color={feature.color} stroke={2} />
                  </Box>
                  <Title order={3} size="h3" style={{ color: markketColors.neutral.charcoal }}>
                    {feature.title}
                  </Title>
                  <Text c="dimmed" style={{ lineHeight: 1.6 }}>
                    {feature.description}
                  </Text>
                </Stack>
              </Paper>
            ))}
          </SimpleGrid>
        </Stack>
      </Container>

      <Box py={80} style={{ background: markketColors.neutral.offWhite }}>
        <Container size="lg">
          <SimpleGrid cols={{ base: 1, md: 2 }} spacing={48}>
            <Stack gap={32} justify="center">
              <Badge
                size="lg"
                radius="md"
                variant="light"
                leftSection={<IconCheck size={16} />}
                style={{
                  background: markketColors.rosa.light,
                  color: markketColors.rosa.main,
                  width: 'fit-content',
                }}
              >
                Built for Creators
              </Badge>

              <Title order={2} size={rem(38)} style={{ color: markketColors.neutral.charcoal, lineHeight: 1.2 }}>
                {page?.Title || 'Grow your audience and sales'}
              </Title>

              <Stack gap="md">
                {benefits.map((benefit, index) => (
                  <Group key={index} gap="sm">
                    <Box
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: '50%',
                        background: markketColors.sections.events.light,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <IconCheck size={16} color={markketColors.sections.events.main} stroke={3} />
                    </Box>
                    <Text size="lg" style={{ color: markketColors.neutral.darkGray }}>
                      {benefit}
                    </Text>
                  </Group>
                ))}
              </Stack>

              <Group mt="md">
                <Button
                  component="a"
                  href={!isLoggedIn ? '/auth/magic' : '/me'}
                  size="lg"
                  radius="md"
                  suppressHydrationWarning
                  leftSection={<IconArrowRight size={20} />}
                  style={{
                    background: markketColors.rosa.main,
                    color: 'white',
                  }}
                >
                  {!isLoggedIn ? 'Get Started Free' : 'Open Workspace'}
                </Button>

                <Button
                  component="a"
                  href="/blog"
                  size="lg"
                  radius="md"
                  variant="subtle"
                  leftSection={<IconArticle size={20} />}
                  style={{
                    color: markketColors.neutral.darkGray,
                  }}
                >
                  Discover Stories
                </Button>
              </Group>
            </Stack>

            <Box
              style={{
                borderRadius: 16,
                overflow: 'hidden',
                border: `1px solid ${markketColors.neutral.lightGray}`,
                background: store?.Logo?.url ? 'white' : markketColors.neutral.offWhite,
                minHeight: rem(300),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {store?.Logo?.url ? (
                <img
                  src={store.Logo.url}
                  alt={store.SEO?.metaTitle || 'Markket'}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
              ) : (
                <Stack gap="sm" align="center">
                  <IconBuildingStore size={64} color={markketColors.neutral.mediumGray} />
                  <Text size="lg" fw={600} c="dimmed">Your Store Here</Text>
                  <Text size="sm" c="dimmed" ta="center" maw={220}>
                    Launch your store and it&apos;ll appear right here.
                  </Text>
                </Stack>
              )}
            </Box>
          </SimpleGrid>
        </Container>
      </Box>

      {communityPosts.length > 0 && (
        <Container size="lg" py={80}>
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.15 }} variants={revealUp}>
          <Stack gap={32}>
            <Group justify="space-between" align="flex-end">
              <div>
                <Badge
                  size="lg"
                  radius="md"
                  variant="light"
                  style={{
                    background: markketColors.sections.blog.light,
                    color: markketColors.sections.blog.main,
                    marginBottom: rem(12),
                  }}
                >
                  Community Feed
                </Badge>
                <Title order={2} size={rem(36)} style={{ color: markketColors.neutral.charcoal }}>
                  Latest Blog Posts
                </Title>
                <Text c="dimmed">Fresh writing from creators across the community.</Text>
              </div>
              <Button component="a" href="/blog" variant="outline" rightSection={<IconArrowRight size={16} />}>
                See All Posts
              </Button>
            </Group>

            <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="xl">
              {communityPosts.slice(0, 6).map((post) => {
                const coverUrl = post?.cover?.formats?.medium?.url || post?.cover?.formats?.small?.url || post?.cover?.url || post?.SEO?.socialImage?.url || post?.store?.Logo?.url;
                const storeSlug = post?.store?.slug;
                const href = storeSlug ? `/${storeSlug}/blog/${post.slug}` : '/docs';

                return (
                  <Card
                    key={post.documentId || post.id}
                    withBorder
                    radius="lg"
                    padding={0}
                    style={{
                      overflow: 'hidden',
                      borderColor: markketColors.neutral.lightGray,
                      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.06)',
                    }}
                  >
                    <CardSection>
                      {coverUrl ? (
                        <img
                          src={coverUrl}
                          alt={post.Title}
                          style={{ width: '100%', height: rem(190), objectFit: 'cover' }}
                          loading="lazy"
                        />
                      ) : (
                        <Box
                          style={{
                            height: rem(190),
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                              background: markketColors.sections.blog.light,
                              color: markketColors.sections.blog.main,
                          }}
                        >
                            <Box style={{ textAlign: 'center' }}>
                              <IconArticle size={32} />
                              <Text size="sm" fw={500}>Article</Text>
                            </Box>
                        </Box>
                      )}
                    </CardSection>

                    <Stack gap="sm" p="md">
                      <Group gap="xs">
                        <Badge variant="outline" color="pink">Blog</Badge>
                        {post?.store?.title && (
                          <Text size="xs" c="dimmed">{post.store.title}</Text>
                        )}
                      </Group>

                      <Title order={4} style={{ lineHeight: 1.25 }}>{post.Title}</Title>
                      <Text size="sm" c="dimmed" lineClamp={3}>
                        {post?.SEO?.metaDescription || '...'}
                      </Text>

                      <Button
                        component="a"
                        href={href}
                        variant="light"
                        rightSection={<IconArrowRight size={16} />}
                        style={{ alignSelf: 'flex-start' }}
                      >
                        Read Post
                      </Button>
                    </Stack>
                  </Card>
                );
              })}
            </SimpleGrid>
          </Stack>
          </motion.div>
        </Container>
      )}

      {communityProducts.length > 0 && (
        <Container size="lg" py={80}>
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.15 }} variants={revealUp}>
          <Stack gap={32}>
            <Group justify="space-between" align="flex-end">
              <div>
                <Badge
                  size="lg"
                  radius="md"
                  variant="light"
                  leftSection={<IconPackage size={14} />}
                  style={{
                    background: markketColors.sections.shop.light,
                    color: markketColors.sections.shop.main,
                    marginBottom: rem(12),
                  }}
                >
                  Products
                </Badge>
                <Title order={2} size={rem(36)} style={{ color: markketColors.neutral.charcoal }}>
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
                const productImage = product?.Thumbnail?.url || product?.Slides?.[0]?.formats?.medium?.url || product?.Slides?.[0]?.formats?.small?.url || product?.Slides?.[0]?.url;
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
                    style={{
                      overflow: 'hidden',
                      borderColor: markketColors.neutral.lightGray,
                      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.06)',
                    }}
                  >
                    <CardSection>
                      {productImage ? (
                        <img
                          src={productImage}
                          alt={product.Name}
                          style={{ width: '100%', height: rem(190), objectFit: 'cover' }}
                          loading="lazy"
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
                          <Text size="xs" c="dimmed">{(product as any).stores[0].title}</Text>
                        )}
                      </Group>

                      <Title order={4} style={{ lineHeight: 1.25 }}>{product.Name}</Title>
                      <Text size="sm" c="dimmed" lineClamp={2}>
                        {product?.SEO?.metaDescription || stripMarkdown(product?.Description as string) || 'Discover this product from the Markket community.'}
                      </Text>
                      <Text size="sm" fw={600} style={{ color: markketColors.sections.shop.main }}>
                        {price}
                      </Text>

                      <Button
                        component="a"
                        href={href}
                        variant="light"
                        rightSection={<IconArrowRight size={16} />}
                        style={{ alignSelf: 'flex-start' }}
                      >
                        View Product
                      </Button>
                    </Stack>
                  </Card>
                );
              })}
            </SimpleGrid>
          </Stack>
          </motion.div>
        </Container>
      )}


      {page?.Content && (
        <Container size="lg" py={80}>
          <PageContent params={{ page }} />
        </Container>
      )}

      <Box py={60} style={{ background: markketColors.neutral.offWhite, borderTop: `1px solid ${markketColors.neutral.lightGray}` }}>
        <Container size="lg">
          <Stack gap={32} align="center">
            <Text size="sm" c="dimmed" ta="center" fw={500} style={{ letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              Powered By
            </Text>
            <Group gap={50} justify="center" wrap="wrap">
              <Box style={{ opacity: 0.6, transition: 'opacity 0.2s', cursor: 'pointer' }} className="hover:opacity-100">
                <Text size="xl" fw={600} c="dimmed">Stripe</Text>
              </Box>
              <Box style={{ opacity: 0.6, transition: 'opacity 0.2s', cursor: 'pointer' }} className="hover:opacity-100">
                <Text size="xl" fw={600} c="dimmed">Strapi</Text>
              </Box>
              <Box style={{ opacity: 0.6, transition: 'opacity 0.2s', cursor: 'pointer' }} className="hover:opacity-100">
                <Text size="xl" fw={600} c="dimmed">DigitalOcean</Text>
              </Box>
              <Box style={{ opacity: 0.6, transition: 'opacity 0.2s', cursor: 'pointer' }} className="hover:opacity-100">
                <Text size="xl" fw={600} c="dimmed">SendGrid</Text>
              </Box>
              <Box style={{ opacity: 0.6, transition: 'opacity 0.2s', cursor: 'pointer' }} className="hover:opacity-100">
                <Text size="xl" fw={600} c="dimmed">Vim</Text>
              </Box>
            </Group>
          </Stack>
        </Container>
      </Box>

      {communityPages.length > 0 && (
        <Container size="lg" py={80}>
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.15 }} variants={revealUp}>
          <Stack gap={32}>
            <Group justify="space-between" align="flex-end">
              <div>
                <Badge
                  size="lg"
                  radius="md"
                  variant="light"
                  leftSection={<IconFileText size={14} />}
                  style={{
                    background: markketColors.sections.about.light,
                    color: markketColors.sections.about.main,
                    marginBottom: rem(12),
                  }}
                >
                  Pages Feed
                </Badge>
                <Title order={2} size={rem(36)} style={{ color: markketColors.neutral.charcoal }}>
                  From the Community
                </Title>
                <Text c="dimmed">Pages and stories published by creators.</Text>
              </div>
            </Group>

            <Carousel
              slideGap="md"
              withControls={communityPages.length > 1}
              withIndicators={communityPages.length > 1}
              slideSize={compactSlideSize}
                style={{ paddingBottom: rem(56) }}
                styles={{
                  slides: { alignItems: 'stretch' },
                  slide: { height: 'auto' },
                  controls: {
                    top: 'unset',
                    bottom: rem(4),
                    transform: 'none',
                    justifyContent: 'center',
                    gap: rem(8),
                  },
                }}
            >
                {communityPages.slice(0, 24).map((p) => {
                const storeSlug = (p as any)?.store?.slug;
                const href = storeSlug ? `/${storeSlug}/about/${p.slug}` : '/stores';
                const logoUrl = (p as any)?.store?.Logo?.url;

                return (
                  <Carousel.Slide key={p.documentId || p.id} style={{ height: '100%' }}>
                    <Card
                      withBorder
                      radius="lg"
                      padding="md"
                      component="a"
                      href={href}
                      style={{
                        height: '100%',
                        minHeight: rem(160),
                        maxWidth: rem(320),
                        margin: '0 auto',
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
                          />
                        </CardSection>
                      )}
                      <Stack gap="xs">
                        {storeSlug && (
                          <Text size="xs" fw={600} tt="uppercase" c="dimmed">
                            {(p as any)?.store?.title || storeSlug}
                          </Text>
                        )}
                        <Title order={4} style={{ lineHeight: 1.25, color: markketColors.neutral.charcoal }}>
                          {p.Title}
                        </Title>
                        <Text size="sm" c="dimmed" lineClamp={2}>
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
                  </Carousel.Slide>
                );
              })}
            </Carousel>
          </Stack>
          </motion.div>
        </Container>
      )}

      {eventsToDisplay.length > 0 && (
        <Container size="lg" py={80}>
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.15 }} variants={revealUp}>
          <Stack gap={32}>
            <Group justify="space-between" align="flex-end">
              <div>
                <Badge
                  size="lg"
                  radius="md"
                  variant="light"
                  leftSection={<IconCalendar size={14} />}
                  style={{
                    background: markketColors.sections.events.light,
                    color: markketColors.sections.events.main,
                    marginBottom: rem(12),
                  }}
                >
                  Upcoming Events
                </Badge>
                <Title order={2} size={rem(36)} style={{ color: markketColors.neutral.charcoal }}>
                  Join the Community
                </Title>
                <Text c="dimmed">Workshops, webinars, and meetups hosted by creators.</Text>
              </div>
            </Group>

            <Carousel
              slideGap="md"
              withControls={eventsToDisplay.length > 1}
              withIndicators={eventsToDisplay.length > 1}
              slideSize={compactSlideSize}
                style={{ paddingBottom: rem(56) }}
                styles={{
                  slides: { alignItems: 'stretch' },
                  slide: { height: 'auto' },
                  controls: {
                    top: 'unset',
                    bottom: rem(4),
                    transform: 'none',
                    justifyContent: 'center',
                    gap: rem(8),
                  },
                }}
            >
                {eventsToDisplay.slice(0, 24).map((event: Event) => {
                const thumbnailUrl = event?.Thumbnail?.formats?.medium?.url || event?.Thumbnail?.formats?.small?.url || event?.Thumbnail?.url || event?.Slides?.[0]?.formats?.medium?.url || event?.Slides?.[0]?.formats?.small?.url || event?.Slides?.[0]?.url || event?.SEO?.socialImage?.url || (event as any)?.stores?.[0]?.Logo?.url;
                const storeSlug = (event as any)?.stores?.[0]?.slug;
                const href = storeSlug ? `/${storeSlug}/events/${event.slug}` : '/stores';
                const eventDate = event.startDate ? new Date(event.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'TBD';

                return (
                  <Carousel.Slide key={event.documentId || event.id} style={{ height: '100%' }}>
                    <Card
                      withBorder
                      radius="lg"
                      padding={0}
                      style={{
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        maxWidth: rem(330),
                        margin: '0 auto',
                        overflow: 'hidden',
                        borderColor: markketColors.neutral.lightGray,
                        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.06)',
                      }}
                    >
                      <CardSection>
                        {thumbnailUrl ? (
                          <img
                            src={thumbnailUrl}
                            alt={event.Name}
                            style={{ width: '100%', height: rem(170), objectFit: 'cover' }}
                            loading="lazy"
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
                            <Text size="xs" c="dimmed">{(event as any).stores[0].title}</Text>
                          )}
                        </Group>

                        <Title order={4} style={{ lineHeight: 1.25 }}>{event.Name}</Title>
                        <Text size="sm" c="dimmed" lineClamp={2} style={{ flex: 1 }}>
                          {event?.SEO?.metaDescription || 'Join us for this event'}
                        </Text>

                        <Button
                          component="a"
                          href={href}
                          variant="light"
                          rightSection={<IconArrowRight size={16} />}
                          style={{ alignSelf: 'flex-start', marginTop: 'auto' }}
                        >
                          Learn More
                        </Button>
                      </Stack>
                    </Card>
                  </Carousel.Slide>
                );
              })}
            </Carousel>
          </Stack>
          </motion.div>
        </Container>
      )}

      <Box
        py={80}
        suppressHydrationWarning
        style={{
          background: isLoggedIn
            ? `linear-gradient(135deg, ${markketColors.rosa.main} 0%, ${markketColors.sections.blog.main} 100%)`
            : `linear-gradient(135deg, ${markketColors.sections.shop.main} 0%, ${markketColors.sections.blog.main} 100%)`,
        }}
      >
        <Container size="md">
          <Stack gap={32} align="center">
            <Title
              order={2}
              ta="center"
              size={rem(42)}
              style={{ color: 'white', lineHeight: 1.2 }}
            >
              {isLoggedIn ? 'Welcome Back!' : 'Ready to Launch?'}
            </Title>
            <Text
              size="xl"
              ta="center"
              style={{ color: 'rgba(255,255,255,0.95)', lineHeight: 1.6 }}
            >
              {isLoggedIn
                ? 'Manage your store, add products, and grow your business'
                : 'Join creators and businesses already selling on Markket'}
            </Text>
            <Button
              component="a"
              href={!isLoggedIn ? '/auth/magic' : '/me'}
              size="xl"
              radius="md"
              suppressHydrationWarning
              leftSection={<IconSparkles size={24} />}
              style={{
                background: 'white',
                color: isLoggedIn ? markketColors.rosa.main : markketColors.sections.shop.main,
                fontWeight: 600,
                fontSize: rem(18),
                height: rem(60),
                paddingLeft: rem(40),
                paddingRight: rem(40),
              }}
            >
              {!isLoggedIn ? 'Start Your Free Store' : 'Open Workspace'}
            </Button>

            <Group gap="lg" mt="md">
              <Link href="/stores" style={{ textDecoration: 'none' }}>
                <Text size="lg" style={{ color: 'white', textDecoration: 'underline' }}>
                  Browse Stores
                </Text>
              </Link>
              {mounted && !isLoggedIn && (
                <Link href="/docs" style={{ textDecoration: 'none' }}>
                  <Text size="lg" style={{ color: 'white', textDecoration: 'underline' }}>
                    Documentation
                  </Text>
                </Link>
              )}
              <Link href="/newsletter" style={{ textDecoration: 'none' }}>
                <Text size="lg" style={{ color: 'white', textDecoration: 'underline' }}>
                  Newsletter
                </Text>
              </Link>
            </Group>
          </Stack>
        </Container>
      </Box>
    </main>
  );
}

export default HomePage;
