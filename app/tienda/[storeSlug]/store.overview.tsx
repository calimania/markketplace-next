'use client';

import { Paper, Stack, Title, Text, Group, Button, Badge, SimpleGrid, ThemeIcon, Box } from '@mantine/core';
import { IconPalette, IconEdit, IconNews, IconFileText, IconShoppingCart, IconCalendarEvent, IconPlus, IconExternalLink, IconSparkles, IconPhoto } from '@tabler/icons-react';
import { useAuth } from '@/app/providers/auth.provider';
import TinyBreadcrumbs from '@/app/components/ui/tiny.breadcrumbs';
import NavTable from '@/app/components/ui/nav.table';
import EmptyStateCTA from '@/app/components/ui/empty.state.cta';
import type { Store } from '@/markket/store';
import type { Article } from '@/markket/article';
import type { Page } from '@/markket/page';
import type { Product } from '@/markket/product';
import type { Event } from '@/markket/event';
import { richTextToPlainText } from '@/markket/richtext.utils';

type StoreOverviewProps = {
  store: Store;
  latestPosts: Article[];
  latestPages: Page[];
  allProducts: Product[];
  upcomingEvents: Event[];
};

export default function StoreOverview({
  store,
  latestPosts,
  latestPages,
  allProducts,
  upcomingEvents,
}: StoreOverviewProps) {
  const { confirmed, stores } = useAuth();
  const isAuthorized = confirmed() && stores.some((s) => s.slug === store.slug);

  const formatDate = (value?: string) => (value ? new Date(value).toLocaleDateString() : 'No date');
  const descriptionText = richTextToPlainText(store.Description);
  const latestUpdatedAt = [
    store.updatedAt,
    latestPosts[0]?.updatedAt,
    latestPages[0]?.updatedAt,
    allProducts[0]?.updatedAt,
    upcomingEvents[0]?.updatedAt,
  ].filter(Boolean).sort().reverse()[0];
  const overviewStats = [
    { label: 'Articles', value: latestPosts.length, icon: IconNews },
    { label: 'Pages', value: latestPages.length, icon: IconFileText },
    { label: 'Products', value: allProducts.length, icon: IconShoppingCart },
    { label: 'Events', value: upcomingEvents.length, icon: IconCalendarEvent },
  ];
  const slideThumbs = (store?.Slides || [])
    .map((slide) => ({
      key: slide.documentId || slide.id,
      src: slide.formats?.thumbnail?.url || slide.formats?.small?.url || slide.url,
      alt: slide.alternativeText || slide.caption || 'Slide',
    }))
    .filter((slide) => !!slide.src)
    .slice(0, 10);

  return (
    <Stack gap="md">
        <TinyBreadcrumbs
          items={[
            { label: 'Tienda', href: '/tienda' },
            { label: store.slug },
          ]}
        />

        <Group justify="space-between" align="flex-start">
          <div>
            <Title order={1}>{store.title || store.slug}</Title>
            <Text c="dimmed" mt={2}>
              <span className="accent-blue">/tienda/{store.slug}</span>
            </Text>
            <Text size="xs" c="dimmed" mt={4}>
              A clean storefront view for visitors. Browse content exactly as your audience sees it, while owner tools stay available when authorized.
            </Text>
          </div>
        <Stack gap="xs" align="flex-end">
          <Badge variant="light" color="cyan">
            {isAuthorized ? 'Tendero' : 'Tienda'}
          </Badge>
          {latestUpdatedAt && (
            <Text size="xs" c="dimmed">Updated {formatDate(latestUpdatedAt)}</Text>
          )}
        </Stack>
        </Group>

        <Paper withBorder radius="md" p="md">
          <Stack gap="sm">
          <Group justify="space-between" align="center">
            <Text fw={600}>Store Snapshot</Text>
            <Badge variant="light" color="yellow" leftSection={<IconSparkles size={12} />}>
              Overview
            </Badge>
          </Group>
          {descriptionText ? (
            <Text c="dimmed" size="sm" lh={1.6} lineClamp={4}>
              {descriptionText}
            </Text>
            ) : (
              <Text c="dimmed">No description yet for this store.</Text>
            )}
          <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="sm">
            {overviewStats.map((stat) => (
              <Paper key={stat.label} withBorder radius="md" p="sm" bg="gray.0">
                <Group gap="xs" wrap="nowrap">
                  <ThemeIcon variant="light" radius="xl" color="gray">
                    <stat.icon size={14} />
                  </ThemeIcon>
                  <div>
                    <Text fw={700} size="sm">{stat.value}</Text>
                    <Text size="xs" c="dimmed">{stat.label}</Text>
                  </div>
                </Group>
              </Paper>
            ))}
          </SimpleGrid>
          {isAuthorized && (
            <Stack gap="xs">
              <Group justify="space-between" align="center">
                <Text size="xs" c="dimmed" tt="uppercase" fw={700} style={{ letterSpacing: '0.08em' }}>
                  Slides Preview
                </Text>
                <Button
                  component="a"
                  variant="light"
                  color="grape"
                  href={`/tienda/${store.slug}/snapshot`}
                  leftSection={<IconPhoto size={14} />}
                  size="xs"
                >
                  Open Media Studio
                </Button>
              </Group>
              {slideThumbs.length > 0 ? (
                <Box style={{ overflowX: 'auto', paddingBottom: 2 }}>
                  <Group gap="xs" wrap="nowrap" style={{ minWidth: 'max-content' }}>
                    {slideThumbs.map((slide, index) => (
                      <Box
                        key={`${slide.key || 'slide'}-${index}`}
                        component="a"
                        href={`/tienda/${store.slug}/snapshot`}
                        style={{
                          width: 68,
                          height: 52,
                          borderRadius: 10,
                          backgroundImage: `url(${slide.src})`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                          border: '1px solid rgba(15, 23, 42, 0.12)',
                          display: 'block',
                          flex: '0 0 auto',
                        }}
                        title={slide.alt}
                      />
                    ))}
                  </Group>
                </Box>
              ) : (
                <Text size="xs" c="dimmed">No slides yet. Add one in Media Studio.</Text>
              )}
            </Stack>
          )}
          </Stack>
        </Paper>

        <Group>
          <Button
            component="a"
            href={`/${store.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            leftSection={<IconExternalLink size={16} />}
            variant="light"
            color="cyan"
          >
            Open in Markket
          </Button>
          {isAuthorized && (
            <>
            <Button
              component="a"
              href={`/tienda/${store.slug}/design-system`}
              target="_blank"
              rel="noopener noreferrer"
              leftSection={<IconPalette size={16} />}
            >
              Open Design System
            </Button>
            <Button
              component="a"
              variant="light"
              color="rosa"
              href={`/tienda/${store.slug}/store`}
              leftSection={<IconEdit size={16} />}
            >
              Open Store Editor
            </Button>
            </>
          )}
        </Group>

        <Paper withBorder radius="md" p="md">
          <Stack gap="sm">
            <Group justify="space-between" align="center">
              <Text fw={600}><span className="accent-yellow">Latest</span> Articles</Text>
              <Button
                component="a"
                variant="subtle"
                href={`/tienda/${store.slug}/blog`}
                leftSection={<IconNews size={14} />}
                size="sm"
              >
                See all
              </Button>
            </Group>
            {latestPosts.length === 0 ? (
              <Text c="dimmed">No articles yet.</Text>
            ) : (
              <NavTable
                items={latestPosts.map((post) => ({
                  key: post.documentId || post.slug,
                  title: post.Title || 'Untitled article',
                  subtitle: `${formatDate(post.updatedAt)} · ${post.slug}`,
                  href: `/tienda/${store.slug}/blog/${post.documentId || post.slug}`,
                  icon: 'article',
                }))}
              />
            )}
          </Stack>
        </Paper>

        <Paper withBorder radius="md" p="md">
          <Stack gap="sm">
            <Group justify="space-between" align="center">
              <Text fw={600}><span className="accent-yellow">Latest</span> Pages</Text>
              <Group gap="xs">
                {isAuthorized && (
                  <Button
                    component="a"
                    href={`/tienda/${store.slug}/pages/new`}
                    leftSection={<IconPlus size={14} />}
                    size="sm"
                    variant="subtle"
                  >
                    New
                  </Button>
                )}
                <Button
                  component="a"
                  variant="subtle"
                  href={`/tienda/${store.slug}/about`}
                  leftSection={<IconFileText size={14} />}
                  size="sm"
                >
                  See all
                </Button>
              </Group>
            </Group>
            {latestPages.length === 0 ? (
              <EmptyStateCTA
                title="Pages"
                description="No pages yet. Share your about, team, or contact information."
                ctaLabel="Create Page"
                ctaHref={`/tienda/${store.slug}/pages/new`}
                icon={<IconPlus size={14} />}
                isAuthorized={isAuthorized}
              />
            ) : (
              <NavTable
                items={latestPages.map((page) => ({
                  key: page.documentId || page.slug,
                  title: page.Title || 'Untitled page',
                  subtitle: `${formatDate(page.updatedAt)} · ${page.slug}`,
                  href: `/tienda/${store.slug}/about/${page.documentId || page.slug}`,
                  icon: 'page',
                }))}
              />
            )}
          </Stack>
        </Paper>

        <Paper withBorder radius="md" p="md">
          <Stack gap="sm">
            <Group justify="space-between" align="center">
              <Text fw={600}><span className="accent-yellow">Latest</span> Products</Text>
              <Group gap="xs">
                {isAuthorized && (
                  <Button
                    component="a"
                    href={`/tienda/${store.slug}/products/new`}
                    leftSection={<IconPlus size={14} />}
                    size="sm"
                    variant="subtle"
                  >
                    New
                  </Button>
                )}
                <Button
                  component="a"
                  variant="subtle"
                  href={`/tienda/${store.slug}/products`}
                  leftSection={<IconShoppingCart size={14} />}
                  size="sm"
                >
                  See all
                </Button>
              </Group>
            </Group>
            {allProducts.length === 0 ? (
              <EmptyStateCTA
                title="Products"
                description="No products yet. Start selling by adding your first item."
                ctaLabel="Create Product"
                ctaHref={`/tienda/${store.slug}/products/new`}
                icon={<IconPlus size={14} />}
                isAuthorized={isAuthorized}
              />
            ) : (
              <NavTable
                items={allProducts.map((product) => ({
                  key: product.documentId || product.slug,
                  title: product.Name || 'Untitled product',
                  subtitle: `${formatDate(product.updatedAt)} · ${product.slug}`,
                  href: `/tienda/${store.slug}/products/${product.documentId || product.slug}`,
                  icon: 'product',
                }))}
              />
            )}
          </Stack>
        </Paper>

        <Paper withBorder radius="md" p="md">
          <Stack gap="sm">
            <Group justify="space-between" align="center">
              <Text fw={600}><span className="accent-yellow">Upcoming</span> Events</Text>
              <Group gap="xs">
                {isAuthorized && (
                  <Button
                    component="a"
                    href={`/tienda/${store.slug}/events/new`}
                    leftSection={<IconPlus size={14} />}
                    size="sm"
                    variant="subtle"
                  >
                    New
                  </Button>
                )}
                <Button
                  component="a"
                  variant="subtle"
                  href={`/tienda/${store.slug}/events`}
                  leftSection={<IconCalendarEvent size={14} />}
                  size="sm"
                >
                  See all
                </Button>
              </Group>
            </Group>
            {upcomingEvents.length === 0 ? (
              <EmptyStateCTA
                title="Events"
                description="No upcoming events scheduled. Create one to connect with your community."
                ctaLabel="Create Event"
                ctaHref={`/tienda/${store.slug}/events/new`}
                icon={<IconPlus size={14} />}
                isAuthorized={isAuthorized}
              />
            ) : (
              <NavTable
                items={upcomingEvents.map((event) => ({
                  key: event.documentId || event.slug,
                  title: event.Name || 'Untitled event',
                  subtitle: `${formatDate(event.startDate)} · ${event.slug}`,
                  href: `/tienda/${store.slug}/events/${event.documentId || event.slug}`,
                  icon: 'event',
                }))}
              />
            )}
          </Stack>
        </Paper>
      </Stack>
  );
}
