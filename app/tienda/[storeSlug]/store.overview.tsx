'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Paper, Stack, Title, Text, Group, Button, Badge, SimpleGrid, ThemeIcon, Box, Tabs } from '@mantine/core';
import { IconEdit, IconNews, IconFileText, IconShoppingCart, IconCalendarEvent, IconPlus, IconExternalLink, IconSparkles, IconPhoto, IconWorld, IconWorldOff, IconUsers, IconCreditCard } from '@tabler/icons-react';
import Link from 'next/link';
import { useAuth } from '@/app/providers/auth.provider';
import TinyBreadcrumbs from '@/app/components/ui/tiny.breadcrumbs';
import NavTable from '@/app/components/ui/nav.table';
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
  const [activeTab, setActiveTab] = useState('latest');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const latestRefreshSeqRef = useRef(0);
  const refreshInFlightRef = useRef(false);
  const lastRefreshStartedAtRef = useRef(0);
  const debugEnabled = process.env.NODE_ENV === 'development';
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
    {
      label: 'Articles',
      value: previewPosts.length,
      icon: IconNews,
      listHref: `/tienda/${store.slug}/blog`,
      createHref: `/tienda/${store.slug}/blog/new`,
    },
    {
      label: 'Pages',
      value: previewPages.length,
      icon: IconFileText,
      listHref: `/tienda/${store.slug}/about`,
      createHref: `/tienda/${store.slug}/pages/new`,
    },
    {
      label: 'Products',
      value: previewProducts.length,
      icon: IconShoppingCart,
      listHref: `/tienda/${store.slug}/products`,
      createHref: `/tienda/${store.slug}/products/new`,
    },
    {
      label: 'Events',
      value: previewEvents.length,
      icon: IconCalendarEvent,
      listHref: `/tienda/${store.slug}/events`,
      createHref: `/tienda/${store.slug}/events/new`,
    },
  ];

  const mergedContentItems = useMemo(() => {
    const fromArticles = previewPosts.map((post) => ({
      key: `article-${post.documentId || post.slug}`,
      title: post.Title || 'Untitled article',
      subtitle: `${formatDate(post.updatedAt || post.createdAt)} · Article · ${post.slug}`,
      href: `/tienda/${store.slug}/blog/${post.documentId || post.slug}`,
      icon: 'article' as const,
      thumbnailUrl: pickImage(
        post.cover?.formats?.thumbnail?.url,
        post.cover?.formats?.small?.url,
        post.cover?.url,
        post.SEO?.socialImage?.formats?.thumbnail?.url,
        post.SEO?.socialImage?.formats?.small?.url,
        post.SEO?.socialImage?.url,
      ),
      thumbnailAlt: post.Title || 'Article image',
      updatedAt: post.updatedAt || post.createdAt || '',
    }));

    const fromPages = previewPages.map((page) => ({
      key: `page-${page.documentId || page.slug}`,
      title: page.Title || 'Untitled page',
      subtitle: `${formatDate(page.updatedAt || page.createdAt)} · Page · ${page.slug}`,
      href: `/tienda/${store.slug}/about/${page.documentId || page.slug}`,
      icon: 'page' as const,
      thumbnailUrl: pickImage(
        page.SEO?.socialImage?.formats?.thumbnail?.url,
        page.SEO?.socialImage?.formats?.small?.url,
        page.SEO?.socialImage?.url,
      ),
      thumbnailAlt: page.Title || 'Page image',
      updatedAt: page.updatedAt || page.createdAt || '',
    }));

    const fromProducts = previewProducts.map((product) => ({
      key: `product-${product.documentId || product.slug}`,
      title: product.Name || 'Untitled product',
      subtitle: `${formatDate(product.updatedAt || product.createdAt)} · Product · ${product.slug}`,
      href: `/tienda/${store.slug}/products/${product.documentId || product.slug}`,
      icon: 'product' as const,
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
      updatedAt: product.updatedAt || product.createdAt || '',
    }));

    const fromEvents = previewEvents.map((event) => ({
      key: `event-${event.documentId || event.slug}`,
      title: event.Name || 'Untitled event',
      subtitle: `${formatDate(event.updatedAt || event.createdAt)} · Event · ${event.slug}`,
      href: `/tienda/${store.slug}/events/${event.documentId || event.slug}`,
      icon: 'event' as const,
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
      updatedAt: event.updatedAt || event.createdAt || '',
    }));

    return [...fromArticles, ...fromPages, ...fromProducts, ...fromEvents]
      .sort((a, b) => +new Date(b.updatedAt || 0) - +new Date(a.updatedAt || 0));
  }, [previewPosts, previewPages, previewProducts, previewEvents, store.slug]);
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

  const parseContentResponse = <T,>(response: unknown): T[] | null => {
    if (!response || typeof response !== 'object') return null;
    const payload = response as { status?: number; data?: unknown; ok?: boolean } | null;

    // Check for error status
    if (payload?.status && payload.status >= 400) {
      if (debugEnabled) console.warn(`[store.overview] Response error status: ${payload.status}`);
      return null;
    }

    // Handle ok: false
    if (payload?.ok === false) {
      if (debugEnabled) console.warn(`[store.overview] Response ok: false`);
      return null;
    }

    // Extract data array
    if (Array.isArray(payload?.data)) return payload.data as T[];
    if (Array.isArray(response)) return response as T[];
    return null;
  };

  useEffect(() => {
    let isMounted = true;

    const refreshContent = async (reason = 'unknown') => {
      if (isLoading) {
        if (debugEnabled) console.log('[store.overview] refresh skipped: auth loading', { reason });
        return;
      }

      if (isRefreshing) {
        if (debugEnabled) console.log('[store.overview] refresh skipped: already in progress', { reason });
        return;
      }

      const token = readAuthToken();
      if (!token) {
        if (debugEnabled) console.log('[store.overview] refresh skipped: no token', { reason });
        return;
      }

      setIsRefreshing(true);

      try {
        if (debugEnabled) {
          console.log('[store.overview] refresh start', { slug: store.slug, reason });
        }

        const overviewResponse = await tiendaClient.listOverviewContent(store.slug, {
          token,
          queries: {
            article: TIENDA_CONTENT_LIST_QUERY.article,
            page: TIENDA_CONTENT_LIST_QUERY.page,
            product: TIENDA_CONTENT_LIST_QUERY.product,
            event: TIENDA_CONTENT_LIST_QUERY.event,
          },
        });

        if (!isMounted) {
          if (debugEnabled) console.log('[store.overview] refresh completed but component unmounted');
          return;
        }

        const postsArray = parseContentResponse<Article>(overviewResponse?.article);
        const pagesArray = parseContentResponse<Page>(overviewResponse?.page);
        const productsArray = parseContentResponse<Product>(overviewResponse?.product);
        const eventsArray = parseContentResponse<Event>(overviewResponse?.event);

        if (debugEnabled) {
          console.log('[store.overview] refresh parsed', {
            slug: store.slug,
            reason,
            counts: {
              articles: postsArray?.length ?? null,
              pages: pagesArray?.length ?? null,
              products: productsArray?.length ?? null,
              events: eventsArray?.length ?? null,
            },
          });
        }

        if (postsArray) {
          setPreviewPosts(
            [...postsArray]
              .sort((a, b) => +new Date(b.updatedAt || b.createdAt || 0) - +new Date(a.updatedAt || a.createdAt || 0))
              .slice(0, TIENDA_OVERVIEW_PREVIEW_LIMIT),
          );
        }

        if (pagesArray) {
          setPreviewPages(
            [...pagesArray]
              .sort((a, b) => +new Date(b.updatedAt || b.createdAt || 0) - +new Date(a.updatedAt || a.createdAt || 0))
              .slice(0, TIENDA_OVERVIEW_PREVIEW_LIMIT),
          );
        }

        if (productsArray) {
          setPreviewProducts(
            [...productsArray]
              .sort((a, b) => +new Date(b.updatedAt || b.createdAt || 0) - +new Date(a.updatedAt || a.createdAt || 0))
              .slice(0, TIENDA_OVERVIEW_PREVIEW_LIMIT),
          );
        }

        if (eventsArray) {
          setPreviewEvents(
            [...eventsArray]
              .sort((a, b) => +new Date(a.startDate || 0) - +new Date(b.startDate || 0))
              .slice(0, TIENDA_OVERVIEW_PREVIEW_LIMIT),
          );
        }
      } catch (error) {
        console.error('[store.overview] refresh failed', { reason, error: error instanceof Error ? error.message : String(error) });
      } finally {
        if (isMounted) {
          setIsRefreshing(false);
        }
      }
    };

    refreshContent('effect:init');

    const handleVisibilityRefresh = () => {
      if (document.visibilityState !== 'visible') return;
      refreshContent('visibilitychange:visible');
    };

    const handlePageShow = () => {
      // Back/forward navigation restores can bypass normal route lifecycles
      refreshContent('pageshow');
    };

    const handleFocusRefresh = () => refreshContent('window:focus');

    window.addEventListener('focus', handleFocusRefresh);
    document.addEventListener('visibilitychange', handleVisibilityRefresh);
    window.addEventListener('pageshow', handlePageShow);

    return () => {
      isMounted = false;
      window.removeEventListener('focus', handleFocusRefresh);
      document.removeEventListener('visibilitychange', handleVisibilityRefresh);
      window.removeEventListener('pageshow', handlePageShow);
    };
  }, [store.slug, isLoading, debugEnabled]);

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
    <Stack gap="md" className="tech-vhs-surface">
        <TinyBreadcrumbs
          items={[
          { label: 'Me', href: '/me' },
            { label: 'Tienda', href: '/tienda' },
          { label: currentStore.slug },
          ]}
        />

      <Paper withBorder radius="lg" p={{ base: 'md', sm: 'lg' }} className="tienda-panel">
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
        <Paper withBorder radius="md" p="md" className="tienda-panel">
          <Text size="sm" c={statusNotice.startsWith('Unable') ? 'red' : 'blue.8'}>{statusNotice}</Text>
        </Paper>
      )}

      <Paper withBorder radius="lg" p={{ base: 'md', sm: 'lg' }} className="tienda-panel">
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
          <SimpleGrid cols={{ base: 2, md: 4 }} spacing="sm">
            {overviewTiles.map((tile) => {
              const isEmpty = tile.value === 0;
              const routesToCreate = isAuthorized && isEmpty;
              const tileHref = routesToCreate ? tile.createHref : tile.listHref;
              const actionLabel = routesToCreate ? 'Create new' : 'Open list';

              return (
                <Paper
                  key={tile.label}
                  withBorder
                  radius="lg"
                  p="sm"
                  className="tienda-kpi-tile"
                  component="a"
                  href={tileHref}
                  aria-label={`${tile.label}: ${actionLabel}`}
                  style={{
                    textDecoration: 'none',
                    opacity: 1,
                    cursor: 'pointer',
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
                        <Text size="10px" tt="uppercase" fw={700} c="dimmed" style={{ letterSpacing: '0.08em' }}>
                          {actionLabel}
                        </Text>
                      </div>
                    </Group>
                    <Badge variant="light" color={!isEmpty ? overviewTileColors[tile.label] || 'gray' : 'gray'} size="xs">
                      {!isEmpty ? 'List' : routesToCreate ? 'New' : 'View'}
                    </Badge>
                  </Group>
                </Paper>
              );
            })}
          </SimpleGrid>
          <Stack gap="xs">
            <Group justify="space-between" align="center" wrap="wrap" gap="xs">
              <Text size="xs" c="dimmed" tt="uppercase" fw={700} style={{ letterSpacing: '0.08em' }}>
                Media assets ({allMediaThumbs.length})
              </Text>
              <Button
                component={Link}
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
              <Box
                style={{
                  overflowX: 'auto',
                  paddingBottom: 4,
                  WebkitOverflowScrolling: 'touch',
                }}
              >
                <Group gap="xs" wrap="nowrap" style={{ minWidth: 'max-content' }}>
                  {allMediaThumbs.map((item) => (
                    <Box
                      key={item.key}
                      component={Link}
                      href={`/tienda/${store.slug}/snapshot`}
                      style={{
                        width: 92,
                        height: 68,
                        borderRadius: 0,
                        backgroundImage: `url(${item.src})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        border: '1px solid rgba(15, 23, 42, 0.14)',
                        display: 'block',
                        flex: '0 0 auto',
                        position: 'relative',
                        boxShadow: '0 1px 0 rgba(255,255,255,0.4) inset',
                      }}
                      title={item.label}
                    >
                      <Box
                        style={{
                          position: 'absolute',
                          inset: 0,
                          background: 'linear-gradient(to top, rgba(7, 10, 18, 0.56), rgba(7, 10, 18, 0.04))',
                        }}
                      />
                      <Text
                        size="9px"
                        fw={700}
                        c="white"
                        style={{
                          position: 'absolute',
                          bottom: 4,
                          left: 5,
                          right: 5,
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

      <Tabs value={activeTab} onChange={(value) => setActiveTab(value || 'latest')} keepMounted={false} className="tienda-panel tienda-overview-tabs">
        <Tabs.List
          style={{
            overflowX: 'auto',
            flexWrap: 'nowrap',
            gap: 6,
            padding: 8,
            border: '1px solid rgba(15, 23, 42, 0.1)',
            background: 'rgba(255, 255, 255, 0.76)',
          }}
        >
          <Tabs.Tab value="latest" data-accent="yellow" style={{ flex: '0 0 auto', paddingInline: 14, paddingBlock: 11, borderRadius: 0 }}>
            Latest content
          </Tabs.Tab>
          <Tabs.Tab value="crm" data-accent="orange" style={{ flex: '0 0 auto', paddingInline: 14, paddingBlock: 11, borderRadius: 0 }}>
            CRM
          </Tabs.Tab>
          <Tabs.Tab value="payouts" data-accent="gray" style={{ flex: '0 0 auto', paddingInline: 14, paddingBlock: 11, borderRadius: 0 }}>
            Payouts
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="latest" pt="md">
          <Paper withBorder radius="lg" p="md" className="tienda-panel">
            <Stack gap="sm">
              <Group justify="space-between" align="center" wrap="wrap" gap="xs">
                <Text fw={600}><span className="accent-yellow">Unified</span> Content Feed</Text>
                <Group gap="xs" wrap="wrap">
                  {isAuthorized && (
                    <>
                      <Button component="a" href={`/tienda/${store.slug}/blog/new`} leftSection={<IconPlus size={14} />} size="sm" variant="subtle">Article</Button>
                      <Button component="a" href={`/tienda/${store.slug}/pages/new`} leftSection={<IconPlus size={14} />} size="sm" variant="subtle">Page</Button>
                      <Button component="a" href={`/tienda/${store.slug}/products/new`} leftSection={<IconPlus size={14} />} size="sm" variant="subtle">Product</Button>
                      <Button component="a" href={`/tienda/${store.slug}/events/new`} leftSection={<IconPlus size={14} />} size="sm" variant="subtle">Event</Button>
                    </>
                  )}
                </Group>
              </Group>

              {mergedContentItems.length > 0 ? (
                <NavTable
                  items={mergedContentItems.map((item) => ({
                    key: item.key,
                    title: item.title,
                    subtitle: item.subtitle,
                    href: item.href,
                    icon: item.icon,
                    thumbnailUrl: item.thumbnailUrl,
                    thumbnailAlt: item.thumbnailAlt,
                    ctaLabel: 'Open',
                  }))}
                  emptyText="No content yet."
                />
              ) : (
                <Text size="sm" c="dimmed">
                  No content yet. Create your first article, page, product, or event.
                </Text>
              )}
            </Stack>
          </Paper>
        </Tabs.Panel>

        <Tabs.Panel value="crm" pt="md">
          <Stack gap="md">
            <Group justify="space-between" align="center" wrap="wrap" gap="xs">
              <Text fw={600}>CRM</Text>
              <Button disabled component="a" href={`/tienda/${store.slug}/crm`} variant="light" leftSection={<IconUsers size={14} />}>
                Open CRM
              </Button>
            </Group>
            <Paper withBorder radius="xs" p="md" className="tienda-panel">
              <Text size="sm" c="dimmed">
                Your subscribers and customers will appear here
              </Text>
            </Paper>
          </Stack>
        </Tabs.Panel>

        <Tabs.Panel value="payouts" pt="md">
          <Stack gap="md">
            <Group justify="space-between" align="center" wrap="wrap" gap="xs">
              <Text fw={600}>Payouts</Text>
              <Button component="a" disabled href={`/tienda/${store.slug}/payouts`} variant="light" leftSection={<IconCreditCard size={14} />}>
                Open Payouts
              </Button>
            </Group>
            <Paper withBorder radius="xs" p="md" className="tienda-panel">
              <Text size="sm" c="dimmed">
                Activate Stripe Connect here when you are ready. Once it is live, your payout information will show up here.
              </Text>
            </Paper>
          </Stack>
        </Tabs.Panel>
      </Tabs>
      </Stack>
  );
}
