'use client';

import { useEffect, useMemo, useState } from 'react';
import { Paper, Stack, Title, Text, Group, Button, Badge, SimpleGrid, ThemeIcon, Box } from '@mantine/core';
import { IconEdit, IconNews, IconFileText, IconShoppingCart, IconCalendarEvent, IconPlus, IconExternalLink, IconSparkles, IconPhoto, IconWorld, IconWorldOff, IconUsers, IconCreditCard } from '@tabler/icons-react';
import { useAuth } from '@/app/providers/auth.provider';
import TinyBreadcrumbs from '@/app/components/ui/tiny.breadcrumbs';
import NavTable from '@/app/components/ui/nav.table';
import EmptyStateCTA from '@/app/components/ui/empty.state.cta';
import PublishConfirmModal from '@/app/components/ui/publish.confirm.modal';
import type { Store } from '@/markket/store';
import type { Article } from '@/markket/article';
import type { Page } from '@/markket/page';
import type { Product } from '@/markket/product';
import type { Event } from '@/markket/event';
import { richTextToPlainText } from '@/markket/richtext.utils';
import { tiendaClient } from '@/markket/api.tienda';
import { TIENDA_CONTENT_LIST_QUERY, TIENDA_OVERVIEW_PREVIEW_LIMIT } from './content.list.queries';

type StoreOverviewProps = {
  store: Store;
  latestPosts: Article[];
  latestPages: Page[];
  allProducts: Product[];
  upcomingEvents: Event[];
};

function isStorePublished(store: Store) {
  const status = String((store as Store & { status?: string }).status || '').toLowerCase();
  if (status === 'published') return true;
  if (status === 'draft') return false;
  return Boolean(store.publishedAt);
}

function pickImage(...candidates: Array<string | undefined | null>): string | undefined {
  const selected = candidates.find((value) => typeof value === 'string' && value.trim().length > 0);
  return typeof selected === 'string' ? selected : undefined;
}

export default function StoreOverview({
  store,
  latestPosts,
  latestPages,
  allProducts,
  upcomingEvents,
}: StoreOverviewProps) {
  const { confirmed, stores, fetchStores, isLoading } = useAuth();
  const [currentStore, setCurrentStore] = useState(store);
  const [previewPosts, setPreviewPosts] = useState<Article[]>(latestPosts || []);
  const [previewPages, setPreviewPages] = useState<Page[]>(latestPages || []);
  const [previewProducts, setPreviewProducts] = useState<Product[]>(allProducts || []);
  const [previewEvents, setPreviewEvents] = useState<Event[]>(upcomingEvents || []);
  const [isSavingStatus, setIsSavingStatus] = useState(false);
  const [statusNotice, setStatusNotice] = useState<string | null>(null);
  const [publishModalOpen, setPublishModalOpen] = useState(false);
  const isAuthorized = confirmed() && stores.some((s) => s.slug === store.slug);
  const isPublished = useMemo(() => isStorePublished(currentStore), [currentStore]);

  const formatDate = (value?: string) => (value ? new Date(value).toLocaleDateString() : 'No date');
  const descriptionText = richTextToPlainText(currentStore.Description);
  const latestUpdatedAt = [
    currentStore.updatedAt,
    previewPosts[0]?.updatedAt,
    previewPages[0]?.updatedAt,
    previewProducts[0]?.updatedAt,
    previewEvents[0]?.updatedAt,
  ].filter(Boolean).sort().reverse()[0];
  const overviewTiles = [
    { label: 'Articles', value: previewPosts.length, icon: IconNews, href: `/tienda/${store.slug}/blog` },
    { label: 'Pages', value: previewPages.length, icon: IconFileText, href: `/tienda/${store.slug}/about` },
    { label: 'Products', value: previewProducts.length, icon: IconShoppingCart, href: `/tienda/${store.slug}/products` },
    { label: 'Events', value: previewEvents.length, icon: IconCalendarEvent, href: `/tienda/${store.slug}/events` },
    { label: 'CRM', value: 'Open', icon: IconUsers, href: `/tienda/${store.slug}/crm`, disabled: false },
    { label: 'Payouts', value: 'Soon', icon: IconCreditCard, href: `/tienda/${store.slug}/payouts`, disabled: true },
  ];
  const overviewTileColors: Record<string, string> = {
    Articles: 'pink',
    Pages: 'grape',
    Products: 'cyan',
    Events: 'green',
    CRM: 'orange',
    Payouts: 'gray',
  };
  const allMediaThumbs = [
    currentStore.Logo?.url && { key: 'logo', src: currentStore.Logo.url, alt: currentStore.Logo.alternativeText || 'Logo', label: 'Logo' },
    currentStore.Cover?.url && { key: 'cover', src: currentStore.Cover.url, alt: currentStore.Cover.alternativeText || 'Cover', label: 'Cover' },
    currentStore.Favicon?.url && { key: 'favicon', src: currentStore.Favicon.url, alt: currentStore.Favicon.alternativeText || 'Favicon', label: 'Favicon' },
    currentStore.SEO?.socialImage?.url && { key: 'social', src: currentStore.SEO.socialImage.url, alt: currentStore.SEO.socialImage.alternativeText || 'Social', label: 'Social' },
    ...(currentStore.Slides || []).map((slide, i) => ({
      key: `slide-${slide.documentId || slide.id || i}`,
      src: slide.formats?.thumbnail?.url || slide.formats?.small?.url || slide.url,
      alt: slide.alternativeText || slide.caption || `Slide ${i + 1}`,
      label: `Slide ${i + 1}`,
    })),
  ].filter((item): item is { key: string; src: string; alt: string; label: string } => !!item && !!item.src);

  function readAuthToken() {
    if (typeof window === 'undefined') return '';
    try {
      const raw = localStorage.getItem('markket.auth');
      const parsed = raw ? JSON.parse(raw) : null;
      return parsed?.jwt || '';
    } catch {
      return '';
    }
  }

  useEffect(() => {
    let active = true;

    const loadPreviewContent = async () => {
      if (isLoading) return;

      const token = readAuthToken();
      if (!token) return;

      try {
        const [postsResponse, pagesResponse, productsResponse, eventsResponse] = await Promise.all([
          tiendaClient.listContent(store.slug, 'article', {
            token,
            query: TIENDA_CONTENT_LIST_QUERY.article,
          }),
          tiendaClient.listContent(store.slug, 'page', {
            token,
            query: TIENDA_CONTENT_LIST_QUERY.page,
          }),
          tiendaClient.listContent(store.slug, 'product', {
            token,
            query: TIENDA_CONTENT_LIST_QUERY.product,
          }),
          tiendaClient.listContent(store.slug, 'event', {
            token,
            query: TIENDA_CONTENT_LIST_QUERY.event,
          }),
        ]);

        if (!active) return;

        const posts = Array.isArray(postsResponse?.data)
          ? (postsResponse.data as Article[])
          : (Array.isArray(postsResponse) ? (postsResponse as Article[]) : []);
        const pages = Array.isArray(pagesResponse?.data)
          ? (pagesResponse.data as Page[])
          : (Array.isArray(pagesResponse) ? (pagesResponse as Page[]) : []);
        const products = Array.isArray(productsResponse?.data)
          ? (productsResponse.data as Product[])
          : (Array.isArray(productsResponse) ? (productsResponse as Product[]) : []);
        const events = Array.isArray(eventsResponse?.data)
          ? (eventsResponse.data as Event[])
          : (Array.isArray(eventsResponse) ? (eventsResponse as Event[]) : []);

        setPreviewPosts(
          [...posts]
            .sort((a, b) => +new Date(b.updatedAt || b.createdAt || 0) - +new Date(a.updatedAt || a.createdAt || 0))
            .slice(0, TIENDA_OVERVIEW_PREVIEW_LIMIT),
        );

        setPreviewPages(
          [...pages]
            .sort((a, b) => +new Date(b.updatedAt || b.createdAt || 0) - +new Date(a.updatedAt || a.createdAt || 0))
            .slice(0, TIENDA_OVERVIEW_PREVIEW_LIMIT),
        );

        setPreviewProducts(
          [...products]
            .sort((a, b) => +new Date(b.updatedAt || b.createdAt || 0) - +new Date(a.updatedAt || a.createdAt || 0))
            .slice(0, TIENDA_OVERVIEW_PREVIEW_LIMIT),
        );

        setPreviewEvents(
          [...events]
            .sort((a, b) => +new Date(a.startDate || 0) - +new Date(b.startDate || 0))
            .slice(0, TIENDA_OVERVIEW_PREVIEW_LIMIT),
        );
      } catch (error) {
        console.error('store.overview.preview.fetch.failed', error);
      }
    };

    loadPreviewContent();

    const handleVisibilityRefresh = () => {
      if (document.visibilityState !== 'visible') return;
      loadPreviewContent();
    };

    window.addEventListener('focus', loadPreviewContent);
    document.addEventListener('visibilitychange', handleVisibilityRefresh);

    return () => {
      active = false;
      window.removeEventListener('focus', loadPreviewContent);
      document.removeEventListener('visibilitychange', handleVisibilityRefresh);
    };
  }, [store.slug, isLoading]);

  const handleTogglePublish = async () => {
    if (!isAuthorized || isSavingStatus) return;
    setPublishModalOpen(false);

    const nextAction = isPublished ? 'unpublish' : 'publish';
    setIsSavingStatus(true);
    setStatusNotice(null);

    try {
      const token = readAuthToken();
      if (!token) throw new Error('Session expired. Please sign in again.');

      const storeRef = currentStore.documentId || currentStore.slug;
      const updated = await tiendaClient.storeAction(storeRef, nextAction, { token });

      if (updated?.status && updated.status >= 400) {
        throw new Error(updated?.message || `Unable to ${nextAction} store right now.`);
      }

      const next = (updated?.data || {}) as Partial<Store>;
      setCurrentStore((previous) => ({
        ...previous,
        ...next,
        status: (nextAction === 'publish' ? 'published' : 'draft') as any,
        publishedAt: nextAction === 'publish'
          ? ((next as any)?.publishedAt || previous.publishedAt || new Date().toISOString())
          : null,
        SEO: {
          ...previous.SEO,
          ...(next.SEO || {}),
        },
      }));

      setStatusNotice(nextAction === 'publish' ? 'Store published. It can now appear in public store listings.' : 'Store unpublished. It is now hidden from public listings.');
      await fetchStores({ force: true });
    } catch (error) {
      console.error('store.overview.publish.error', error);
      setStatusNotice(error instanceof Error ? error.message : 'Unable to change publish status right now.');
    } finally {
      setIsSavingStatus(false);
    }
  };

  return (
    <Stack gap="md">
        <TinyBreadcrumbs
          items={[
          { label: 'Me', href: '/me' },
            { label: 'Tienda', href: '/tienda' },
          { label: currentStore.slug },
          ]}
        />

        <Paper withBorder radius="lg" p={{ base: 'md', sm: 'lg' }}>
          <Group justify="space-between" align="flex-start" wrap="wrap" gap="sm">
            <Stack gap={6} style={{ minWidth: 0, flex: 1 }}>
              <Group gap="xs" wrap="wrap">
                <Title order={1}>{currentStore.title || currentStore.slug}</Title>
              </Group>
              <Text c="dimmed" size="sm">
                <span className="accent-blue">/tienda/{currentStore.slug}</span>
              </Text>
              <Text size="xs" c="dimmed">Updated {formatDate(latestUpdatedAt)}</Text>
            </Stack>
          </Group>
        </Paper>

      {statusNotice && (
        <Paper withBorder radius="md" p="md" bg="blue.0">
          <Text size="sm" c={statusNotice.startsWith('Unable') ? 'red' : 'blue.8'}>{statusNotice}</Text>
        </Paper>
      )}

        <Paper withBorder radius="lg" p={{ base: 'md', sm: 'lg' }}>
          <Stack gap="sm">
          <Group justify="space-between" align="center" wrap="wrap" gap="xs">
            <Text fw={600}>Store Snapshot</Text>
            <Badge variant="light" radius="xl" color="yellow" leftSection={<IconSparkles size={12} />}>
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
          <SimpleGrid cols={{ base: 2, sm: 3, md: 6 }} spacing="sm">
            {overviewTiles.map((tile) => (
              <Paper
                key={tile.label}
                withBorder
                radius="lg"
                p="sm"
                bg={tile.disabled ? 'gray.0' : 'white'}
                component={tile.disabled ? 'div' : 'a'}
                href={tile.disabled ? undefined : tile.href}
                style={{
                  textDecoration: 'none',
                  opacity: tile.disabled ? 0.72 : 1,
                  cursor: tile.disabled ? 'not-allowed' : 'pointer',
                  minHeight: 76,
                  borderLeft: `3px solid var(--mantine-color-${overviewTileColors[tile.label] || 'gray'}-4)`,
                }}
              >
                <Group gap="xs" wrap="nowrap" justify="space-between" align="flex-start">
                  <Group gap="xs" wrap="nowrap">
                    <ThemeIcon variant="light" radius="xl" color={overviewTileColors[tile.label] || 'gray'}>
                      <tile.icon size={14} />
                    </ThemeIcon>
                    <div>
                      <Text fw={700} size="sm">{tile.value}</Text>
                      <Text size="xs" c="dimmed">{tile.label}</Text>
                    </div>
                  </Group>
                  {tile.disabled && (
                    <Badge variant="light" color="gray" size="xs">Soon</Badge>
                  )}
                </Group>
              </Paper>
            ))}
          </SimpleGrid>
          {isAuthorized && (
            <Stack gap="xs">
              <Group justify="space-between" align="center">
                <Text size="xs" c="dimmed" tt="uppercase" fw={700} style={{ letterSpacing: '0.08em' }}>
                  Media ({allMediaThumbs.length})
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
              {allMediaThumbs.length > 0 ? (
                <Box style={{ overflowX: 'auto', paddingBottom: 2 }}>
                  <Group gap="xs" wrap="nowrap" style={{ minWidth: 'max-content' }}>
                    {allMediaThumbs.map((item) => (
                      <Box
                        key={item.key}
                        component="a"
                        href={`/tienda/${store.slug}/snapshot`}
                        style={{
                          width: 68,
                          height: 52,
                          borderRadius: 10,
                          backgroundImage: `url(${item.src})`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                          border: '1px solid rgba(15, 23, 42, 0.12)',
                          display: 'block',
                          flex: '0 0 auto',
                          position: 'relative',
                        }}
                        title={item.label}
                      >
                        <Text
                          size="9px"
                          fw={700}
                          c="white"
                          style={{
                            position: 'absolute',
                            bottom: 3,
                            left: 4,
                            textShadow: '0 1px 3px rgba(0,0,0,0.8)',
                          }}
                        >
                          {item.label}
                        </Text>
                      </Box>
                    ))}
                  </Group>
                </Box>
              ) : (
                  <Text size="xs" c="dimmed">No images yet. Add some in Media Studio.</Text>
              )}
            </Stack>
          )}
          </Stack>
        </Paper>

        <Group gap="xs" wrap="wrap">
          <Button
            component="a"
          href={`/${currentStore.slug}`}
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
            {/* <Button
              component="a"
              href={`/tienda/${currentStore.slug}/design-system`}
              target="_blank"
              rel="noopener noreferrer"
              leftSection={<IconPalette size={16} />}
            >
              Open Design System
            </Button> */}
            <PublishConfirmModal
              opened={publishModalOpen}
              onClose={() => setPublishModalOpen(false)}
              onConfirm={handleTogglePublish}
              loading={isSavingStatus}
              isPublishing={!isPublished}
              contentType="store"
            />
            <Button
              variant={isPublished ? 'default' : 'filled'}
              color={isPublished ? 'gray' : 'green'}
              onClick={() => setPublishModalOpen(true)}
              loading={isSavingStatus}
              leftSection={isPublished ? <IconWorldOff size={16} /> : <IconWorld size={16} />}
            >
              {isPublished ? 'Hide' : 'Publish'}
            </Button>
            <Button
              component="a"
              variant="light"
              href={`/tienda/${currentStore.slug}/store`}
              leftSection={<IconEdit size={16} />}
            >
              Open Store Editor
            </Button>
            </>
          )}
        </Group>

        <Paper withBorder radius="lg" p={{ base: 'md', sm: 'lg' }}>
          <Stack gap="sm">
            <Group justify="space-between" align="center" wrap="wrap" gap="xs">
              <Text fw={600}><span className="accent-yellow">Latest</span> Articles</Text>
              <Group gap="xs" wrap="wrap">
                {isAuthorized && (
                  <Button
                    component="a"
                    href={`/tienda/${store.slug}/blog/new`}
                    leftSection={<IconPlus size={14} />}
                    size="sm"
                    variant="subtle"
                  >
                    New
                  </Button>
                )}
              {previewPosts.length > 0 && (
                  <Button
                    component="a"
                    variant="subtle"
                    href={`/tienda/${store.slug}/blog`}
                    leftSection={<IconNews size={14} />}
                    size="sm"
                  >
                    See all
                  </Button>
                )}
              </Group>
            </Group>
          {previewPosts.length === 0 ? (
              <EmptyStateCTA
                title="Articles"
                description="No articles yet. Publish your first story or update."
                ctaLabel="Create Article"
                ctaHref={`/tienda/${store.slug}/blog/new`}
                icon={<IconPlus size={14} />}
                isAuthorized={isAuthorized}
              />
            ) : (
              <NavTable
                items={previewPosts.map((post) => ({
                  key: post.documentId || post.slug,
                  title: post.Title || 'Untitled article',
                  subtitle: `${formatDate(post.updatedAt)} · ${post.slug}`,
                  href: `/tienda/${store.slug}/blog/${post.documentId || post.slug}`,
                  icon: 'article',
                  thumbnailUrl: pickImage(
                    post.cover?.formats?.thumbnail?.url,
                    post.cover?.formats?.small?.url,
                    post.cover?.url,
                    post.SEO?.socialImage?.formats?.thumbnail?.url,
                    post.SEO?.socialImage?.formats?.small?.url,
                    post.SEO?.socialImage?.url,
                  ),
                  thumbnailAlt: post.Title || 'Article image',
                }))}
              />
            )}
          </Stack>
        </Paper>

        <Paper withBorder radius="lg" p={{ base: 'md', sm: 'lg' }}>
          <Stack gap="sm">
            <Group justify="space-between" align="center" wrap="wrap" gap="xs">
            <Text fw={600}><span className="accent-yellow">Static</span> Pages</Text>
              <Group gap="xs" wrap="wrap">
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
              {previewPages.length > 0 && (
                  <Button
                    component="a"
                    variant="subtle"
                    href={`/tienda/${store.slug}/about`}
                    leftSection={<IconFileText size={14} />}
                    size="sm"
                  >
                    See all
                  </Button>
                )}
              </Group>
            </Group>
          {previewPages.length === 0 ? (
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
                items={previewPages.map((page) => ({
                  key: page.documentId || page.slug,
                  title: page.Title || 'Untitled page',
                  subtitle: `${formatDate(page.updatedAt)} · ${page.slug}`,
                  href: `/tienda/${store.slug}/about/${page.documentId || page.slug}`,
                  icon: 'page',
                  thumbnailUrl: pickImage(
                    page.SEO?.socialImage?.formats?.thumbnail?.url,
                    page.SEO?.socialImage?.formats?.small?.url,
                    page.SEO?.socialImage?.url,
                  ),
                  thumbnailAlt: page.Title || 'Page image',
                }))}
              />
            )}
          </Stack>
        </Paper>

        <Paper withBorder radius="lg" p={{ base: 'md', sm: 'lg' }}>
          <Stack gap="sm">
            <Group justify="space-between" align="center" wrap="wrap" gap="xs">
            <Text fw={600}><span className="accent-yellow">Services &</span> Products</Text>
              <Group gap="xs" wrap="wrap">
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
              {previewProducts.length > 0 && (
                  <Button
                    component="a"
                    variant="subtle"
                    href={`/tienda/${store.slug}/products`}
                    leftSection={<IconShoppingCart size={14} />}
                    size="sm"
                  >
                    See all
                  </Button>
                )}
              </Group>
            </Group>
          {previewProducts.length === 0 ? (
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
                items={previewProducts.map((product) => ({
                  key: product.documentId || product.slug,
                  title: product.Name || 'Untitled product',
                  subtitle: `${formatDate(product.updatedAt)} · ${product.slug}`,
                  href: `/tienda/${store.slug}/products/${product.documentId || product.slug}`,
                  icon: 'product',
                  thumbnailUrl: pickImage(
                    product.Thumbnail?.url,
                    product.Slides?.[0]?.formats?.thumbnail?.url,
                    product.Slides?.[0]?.formats?.small?.url,
                    product.Slides?.[0]?.url,
                    product.SEO?.socialImage?.formats?.thumbnail?.url,
                    product.SEO?.socialImage?.formats?.small?.url,
                    product.SEO?.socialImage?.url,
                  ),
                  thumbnailAlt: product.Name || 'Product image',
                }))}
              />
            )}
          </Stack>
        </Paper>

        <Paper withBorder radius="lg" p={{ base: 'md', sm: 'lg' }}>
          <Stack gap="sm">
            <Group justify="space-between" align="center" wrap="wrap" gap="xs">
              <Text fw={600}><span className="accent-yellow">Upcoming</span> Events</Text>
              <Group gap="xs" wrap="wrap">
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
              {previewEvents.length > 0 && (
                  <Button
                    component="a"
                    variant="subtle"
                    href={`/tienda/${store.slug}/events`}
                    leftSection={<IconCalendarEvent size={14} />}
                    size="sm"
                  >
                    See all
                  </Button>
                )}
              </Group>
            </Group>
          {previewEvents.length === 0 ? (
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
                items={previewEvents.map((event) => ({
                  key: event.documentId || event.slug,
                  title: event.Name || 'Untitled event',
                  subtitle: `${formatDate(event.startDate)} · ${event.slug}`,
                  href: `/tienda/${store.slug}/events/${event.documentId || event.slug}`,
                  icon: 'event',
                  thumbnailUrl: pickImage(
                    event.Thumbnail?.formats?.thumbnail?.url,
                    event.Thumbnail?.formats?.small?.url,
                    event.Thumbnail?.url,
                    event.Slides?.[0]?.formats?.thumbnail?.url,
                    event.Slides?.[0]?.formats?.small?.url,
                    event.Slides?.[0]?.url,
                    event.SEO?.socialImage?.formats?.thumbnail?.url,
                    event.SEO?.socialImage?.formats?.small?.url,
                    event.SEO?.socialImage?.url,
                  ),
                  thumbnailAlt: event.Name || 'Event image',
                }))}
              />
            )}
          </Stack>
        </Paper>
      </Stack>
  );
}
