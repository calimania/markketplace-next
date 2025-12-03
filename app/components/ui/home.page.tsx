'use client';

import { useEffect, useState } from "react";
import {
  IconRocket, IconBuildingStore, IconShoppingCart,
  IconFileTypeDoc, IconSparkles, IconArrowRight,
  IconCheck, IconStars,
} from "@tabler/icons-react";
import {
  Container, Title, Text, Button, Group, Stack, SimpleGrid,
  Paper, Box, rem, Badge
} from "@mantine/core";
import { Store, Page, Album } from "@/markket";
import PageContent from '@/app/components/ui/page.content';
import { useAuth } from "@/app/providers/auth.provider";
import Albums from '@/app/components/ui/albums.grid';
import { markketColors } from "@/markket/colors.config";
import Link from "next/link";

const features = [
  {
    icon: IconRocket,
    title: "Launch in Minutes",
    description: "Verify email, add products, start selling. Simple as that.",
    color: markketColors.sections.events.main,
  },
  {
    icon: IconBuildingStore,
    title: "Your Own Store",
    description: "Beautiful storefront, custom domain, full control.",
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
  "No monthly fees, just pay per sale",
  "Custom branding & domain",
  "Blog, events & newsletter built-in",
  "Stripe payments & payouts",
];

type HomePageProps = {
  store?: Store;
  page?: Page;
};

const HomePage = ({ store, page }: HomePageProps) => {
  const { maybe } = useAuth();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setIsLoggedIn(maybe());
  }, [maybe]);

  return (
    <div className="min-h-screen">
      {/* Hero Section - Clean, trustworthy design */}
      <Box
        style={{
          background: 'white',
          position: 'relative',
          overflow: 'hidden',
          borderBottom: `1px solid ${markketColors.neutral.lightGray}`,
        }}
      >
        {/* Geometric background - caleño style */}
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
              animation: 'float-rotate 18s ease-in-out infinite 2s',
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
              animation: 'float-rotate 22s ease-in-out infinite 3s',
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
              animation: 'float-rotate 24s ease-in-out infinite 5s',
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
              animation: 'float-rotate 21s ease-in-out infinite 1s',
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
              animation: 'float-rotate 23s ease-in-out infinite 6s',
            }}
          />
        </Box>

        <Container size="lg" py={120}>
          <Stack gap="xl" align="center" style={{ position: 'relative', zIndex: 1 }}>
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
              Open Ecosystem & Community
            </Badge>

            <Title
              order={1}
              ta="center"
              style={{
                fontSize: rem(64),
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
              maw={600}
              style={{
                color: markketColors.neutral.darkGray,
                lineHeight: 1.6,
                fontSize: rem(20),
              }}
            >
              {store?.SEO?.metaDescription ||
                'Beautiful storefronts for creators, artists, and small businesses. Start selling today.'}
            </Text>

            <Group gap="lg" mt="xl">
              <Button
                component="a"
                href={!isLoggedIn ? '/auth/magic' : '/dashboard/store'}
                size="xl"
                radius="md"
                leftSection={<IconSparkles size={24} />}
                style={{
                  background: isLoggedIn
                    ? `linear-gradient(135deg, ${markketColors.rosa.main} 0%, ${markketColors.sections.blog.main} 100%)`
                    : markketColors.rosa.main,
                  color: 'white',
                  fontWeight: 600,
                  fontSize: rem(18),
                  height: rem(60),
                  paddingLeft: rem(32),
                  paddingRight: rem(32),
                  boxShadow: `0 4px 14px ${markketColors.rosa.main}30`,
                  position: 'relative',
                  overflow: 'hidden',
                }}
                className="transform hover:scale-105 transition-transform"
              >
                {isLoggedIn && (
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
                  {!isLoggedIn ? 'Create Your Store' : 'Go to Dashboard'}
                </span>
              </Button>

              <Button
                component="a"
                href="/stores"
                size="xl"
                radius="md"
                variant="outline"
                leftSection={<IconShoppingCart size={24} />}
                style={{
                  color: markketColors.neutral.charcoal,
                  borderColor: markketColors.neutral.mediumGray,
                  fontSize: rem(18),
                  height: rem(60),
                  paddingLeft: rem(32),
                  paddingRight: rem(32),
                }}
                className="transform hover:scale-105 transition-transform"
              >
                Explore
              </Button>
            </Group>
          </Stack>
        </Container>
      </Box>

      {/* Add CSS animations */}
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
          }
          50% {
            transform: translateY(-20px) rotate(55deg);
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
      `}</style>      {/* Features Section */}
      <Container size="lg" py={80}>
        <Stack gap={60}>
          <div>
            <Title order={2} ta="center" size={rem(42)} mb="md" style={{ color: markketColors.neutral.charcoal }}>
              Everything You Need to Sell
            </Title>
            <Text size="lg" ta="center" c="dimmed" maw={700} mx="auto">
              A complete platform for creators and small businesses
            </Text>
          </div>

          <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing={40}>
            {features.map((feature, index) => (
              <Paper
                key={index}
                radius="lg"
                p="xl"
                style={{
                  border: `1px solid ${markketColors.neutral.lightGray}`,
                  transition: 'all 0.2s ease',
                  cursor: 'default',
                }}
                className="hover:shadow-lg"
              >
                <Stack gap="md">
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

      {/* Benefits CTA Section */}
      <Box py={80} style={{ background: markketColors.neutral.offWhite }}>
        <Container size="lg">
          <SimpleGrid cols={{ base: 1, md: 2 }} spacing={60}>
            <Stack gap="xl" justify="center">
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
                Grow your audience and sales
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
                  href={!isLoggedIn ? '/auth/magic' : '/dashboard/store'}
                  size="lg"
                  radius="md"
                  leftSection={<IconArrowRight size={20} />}
                  style={{
                    background: markketColors.rosa.main,
                    color: 'white',
                  }}
                >
                  {!isLoggedIn ? 'Get Started Free' : 'Dashboard'}
                </Button>

                <Button
                  component="a"
                  href="/docs"
                  size="lg"
                  radius="md"
                  variant="subtle"
                  leftSection={<IconFileTypeDoc size={20} />}
                  style={{
                    color: markketColors.neutral.darkGray,
                  }}
                >
                  Read Docs
                </Button>
              </Group>
            </Stack>

            <Box
              style={{
                borderRadius: 16,
                overflow: 'hidden',
                border: `1px solid ${markketColors.neutral.lightGray}`,
                background: 'white',
              }}
            >
              {store?.Logo?.url && (
                <img
                  src={store.Logo.url}
                  alt={store.SEO?.metaTitle || 'Markket'}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
              )}
            </Box>
          </SimpleGrid>
        </Container>
      </Box>

      {page?.albums && page.albums.length > 0 && (
        <Container size="lg" py={80}>
          <Stack gap="xl">
            <div>
              <Title order={2} ta="center" size={rem(42)} mb="md" style={{ color: markketColors.neutral.charcoal }}>
                Featured Collections
              </Title>
              <Text size="lg" ta="center" c="dimmed" maw={700} mx="auto">
                Discover curated collections from our community
              </Text>
            </div>
            <Albums albums={page.albums as Album[]} store_slug={store?.slug as ''} />
          </Stack>
        </Container>
      )}

      {/* Custom Page Content */}
      {page?.Content && (
        <Container size="lg" py={60}>
          <PageContent params={{ page }} />
        </Container>
      )}

      {/* Powered By Section */}
      <Box py={60} style={{ background: markketColors.neutral.offWhite, borderTop: `1px solid ${markketColors.neutral.lightGray}` }}>
        <Container size="lg">
          <Stack gap="xl" align="center">
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
                <Text size="xl" fw={600} c="dimmed">Next.js</Text>
              </Box>
            </Group>
          </Stack>
        </Container>
      </Box>
      <Box
        py={80}
        style={{
          background: isLoggedIn
            ? `linear-gradient(135deg, ${markketColors.rosa.main} 0%, ${markketColors.sections.blog.main} 100%)`
            : `linear-gradient(135deg, ${markketColors.sections.shop.main} 0%, ${markketColors.sections.blog.main} 100%)`,
        }}
      >
        <Container size="md">
          <Stack gap="xl" align="center">
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
              href={!isLoggedIn ? '/auth/magic' : '/dashboard/store'}
              size="xl"
              radius="md"
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
              {!isLoggedIn ? 'Start Your Free Store' : 'Open Dashboard'}
            </Button>

            <Group gap="lg" mt="md">
              <Link href="/stores" style={{ textDecoration: 'none' }}>
                <Text size="lg" style={{ color: 'white', textDecoration: 'underline' }}>
                  Browse Stores
                </Text>
              </Link>
              {!isLoggedIn && (
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
    </div>
  );
}

export default HomePage;
