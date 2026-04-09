'use client';

import { Paper, Stack, Title, Text, Group, Button, Badge } from '@mantine/core';
import { IconPalette, IconEdit, IconNews, IconFileText, IconShoppingCart, IconCalendarEvent, IconPlus } from '@tabler/icons-react';
import { useAuth } from '@/app/providers/auth.provider';
import Markdown from '@/app/components/ui/page.markdown';
import TinyBreadcrumbs from '@/app/components/ui/tiny.breadcrumbs';
import NavTable from '@/app/components/ui/nav.table';
import EmptyStateCTA from '@/app/components/ui/empty.state.cta';
import type { Store } from '@/markket/store';
import type { Article } from '@/markket/article';
import type { Page } from '@/markket/page';
import type { Product } from '@/markket/product';
import type { Event } from '@/markket/event';

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
          <Badge variant="light" color="cyan">
            {isAuthorized ? 'Tendero' : 'Tienda'}
          </Badge>
        </Group>

        <Paper withBorder radius="md" p="md">
          <Stack gap="sm">
            <Text fw={600}>Store Description</Text>
            {store.Description ? (
              <Markdown content={store.Description} />
            ) : (
              <Text c="dimmed">No description yet for this store.</Text>
            )}
          </Stack>
        </Paper>

        {isAuthorized && (
          <Group>
            <Button
              component="a"
              href={`/tienda/${store.slug}/design-system`}
              leftSection={<IconPalette size={16} />}
            >
              Open Design System
            </Button>
            <Button
              component="a"
              variant="default"
              href={`/tienda/${store.slug}/store`}
              leftSection={<IconEdit size={16} />}
            >
              Open Store Editor
            </Button>
          </Group>
        )}

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
