'use client';

import { useEffect, useMemo, useState } from 'react';
import { Paper, Stack, Title, Text, Group, Button, Badge, SimpleGrid, ThemeIcon, Box, Tabs, ActionIcon, Tooltip } from '@mantine/core';
import { IconEdit, IconNews, IconFileText, IconShoppingCart, IconCalendarEvent, IconPlus, IconExternalLink, IconSparkles, IconPhoto, IconWorld, IconWorldOff, IconUsers, IconCreditCard, IconMessageCircle, IconArrowUpRight } from '@tabler/icons-react';
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
import type { StoreVisibility } from '@/markket/store.visibility.d';

type StoreOverviewProps = {
  store: Store;
  latestPosts: Article[];
  latestPages: Page[];
  allProducts: Product[];
  upcomingEvents: Event[];
};

type CrmInboxThreadPreview = {
  id?: number;
  documentId?: string;
  threadKey?: string;
  subject?: string;
  Name?: string;
  email?: string;
  from?: string;
  latestMessageAt?: string;
  updatedAt?: string;
  estado?: string;
  publicationState?: string;
  archived?: boolean;
};

function toShortThreadId(value: string): string {
  const source = String(value || '').trim();
  if (!source) return '';

  const segments = source.split('/').filter(Boolean);
  return (segments[segments.length - 1] || source).trim();
}

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
  const [visibilitySummary, setVisibilitySummary] = useState<StoreVisibility['content_summary'] | null>(null);
  const [isSavingStatus, setIsSavingStatus] = useState(false);
  const [statusNotice, setStatusNotice] = useState<string | null>(null);
  const [publishModalOpen, setPublishModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('latest');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [crmInboxThreads, setCrmInboxThreads] = useState<CrmInboxThreadPreview[]>([]);
  const [crmInboxLoading, setCrmInboxLoading] = useState(false);
  const [crmInboxError, setCrmInboxError] = useState<string | null>(null);
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
      value: visibilitySummary?.articles_count ?? previewPosts.length,
      icon: IconNews,
      listHref: `/tienda/${store.slug}/blog`,
      createHref: `/tienda/${store.slug}/blog/new`,
    },
    {
      label: 'Pages',
      value: visibilitySummary?.pages_count ?? previewPages.length,
      icon: IconFileText,
      listHref: `/tienda/${store.slug}/about`,
      createHref: `/tienda/${store.slug}/pages/new`,
    },
    {
      label: 'Products',
      value: visibilitySummary?.products_count ?? previewProducts.length,
      icon: IconShoppingCart,
      listHref: `/tienda/${store.slug}/products`,
      createHref: `/tienda/${store.slug}/products/new`,
    },
    {
      label: 'Events',
      value: visibilitySummary?.events_count ?? previewEvents.length,
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

        const visibilityRef = String(store.documentId || store.slug);
        const visibilityResponse = await fetch(`/api/stores/${encodeURIComponent(visibilityRef)}/visibility`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          cache: 'no-store',
        });

        if (!isMounted) {
          if (debugEnabled) console.log('[store.overview] refresh completed but component unmounted');
          return;
        }

        const postsArray = parseContentResponse<Article>(overviewResponse?.article);
        const pagesArray = parseContentResponse<Page>(overviewResponse?.page);
        const productsArray = parseContentResponse<Product>(overviewResponse?.product);
        const eventsArray = parseContentResponse<Event>(overviewResponse?.event);
        const visibilityPayload = visibilityResponse.ok ? await visibilityResponse.json() : null;
        const visibility = (visibilityPayload?.data && typeof visibilityPayload.data === 'object')
          ? visibilityPayload.data
          : visibilityPayload;

        if (visibility?.content_summary && typeof visibility.content_summary === 'object') {
          setVisibilitySummary({
            articles_count: Number(visibility.content_summary.articles_count || 0),
            products_count: Number(visibility.content_summary.products_count || 0),
            events_count: Number(visibility.content_summary.events_count || 0),
            upcoming_events_count: Number(visibility.content_summary.upcoming_events_count || 0),
            pages_count: Number(visibility.content_summary.pages_count || 0),
          });
        }

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

  useEffect(() => {
    if (activeTab !== 'crm') return;
    if (crmInboxLoading) return;

    const token = readAuthToken();

    if (!token) {
      setCrmInboxError('Sign in to load inbox previews.');
      return;
    }

    const storeId = String(currentStore.documentId || currentStore.slug || store.slug);
    const storeSlug = String(currentStore.slug || store.slug || '');
    if (!storeId && !storeSlug) return;

    const loadInboxPreview = async () => {
      setCrmInboxLoading(true);
      setCrmInboxError(null);

      try {
        const params = new URLSearchParams();
        params.set('storeId', storeId);
        if (storeSlug) params.set('store', storeSlug);
        params.set('includeMessages', 'false');
        params.set('page', '1');
        params.set('pageSize', '4');
        params.set('sortBy', 'latestMessageAt');
        params.set('sortOrder', 'desc');

        const response = await fetch(`/api/crm/inbox?${params.toString()}`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          cache: 'no-store',
        });

        const payload = await response.json().catch(() => ({}));

        if (!response.ok) {
          const message = typeof payload?.error === 'string'
            ? payload.error
            : typeof payload?.message === 'string'
              ? payload.message
              : `Could not load inbox (${response.status})`;
          throw new Error(message);
        }

        const items = Array.isArray(payload?.data)
          ? payload.data
          : Array.isArray(payload?.items)
            ? payload.items
            : Array.isArray(payload?.threads)
              ? payload.threads
              : [];

        setCrmInboxThreads(items.slice(0, 4));
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Could not load inbox preview.';
        setCrmInboxError(message);
      } finally {
        setCrmInboxLoading(false);
      }
    };

    loadInboxPreview();
  }, [activeTab, currentStore.documentId, currentStore.slug, store.slug]);

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
    <Stack gap="sm" className="tech-vhs-surface">
      <TinyBreadcrumbs
        items={[
          { label: 'Me', href: '/me' },
          { label: 'Tienda', href: '/tienda' },
          { label: currentStore.slug, href: `/tienda/${currentStore.slug}` },
        ]}
      />

      <Paper withBorder radius="lg" p={{ base: 'sm', sm: 'md' }} className="tienda-panel">
        <Group justify="space-between" align="center" wrap="wrap" gap="sm">
          <Stack gap={4} style={{ minWidth: 0, flex: 1 }}>
            <Group gap="xs" wrap="wrap">
              <Title order={1}>{currentStore.title || currentStore.slug}</Title>
            </Group>
            <Text size="xs" c="dimmed">Updated {formatDate(latestUpdatedAt)}</Text>
          </Stack>
        </Group>
      </Paper>

      {statusNotice && (
        <Paper withBorder radius="md" p="md" className="tienda-panel">
          <Text size="sm" c={statusNotice.startsWith('Unable') ? 'red' : 'blue.8'}>{statusNotice}</Text>
        </Paper>
      )}

      <Paper withBorder radius="lg" p={{ base: 'sm', sm: 'md' }} className="tienda-panel">
        <Stack gap="xs">
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
              const actionLabel = routesToCreate ? 'Add' : '';

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
                        <Text size="xs" c="dimmed"> {tile.value != 1 ? tile.label : tile.label.slice(0, -1)} </Text>
                        <Text size="10px" tt="uppercase" fw={700} c="dimmed" style={{ letterSpacing: '0.08em' }}>
                          {actionLabel}
                        </Text>
                      </div>
                    </Group>
                  </Group>
                </Paper>
              );
            })}
          </SimpleGrid>
          <Stack gap={6}>
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
                Manage
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
                <Text size="xs" c="dimmed">Add some in Snapshot.</Text>
            )}
          </Stack>

          <Stack gap={6}>
            <Group justify="space-between" align="center" wrap="wrap" gap="xs">
              <Text size="xs" c="dimmed" tt="uppercase" fw={700} style={{ letterSpacing: '0.08em' }}>
                Social Links ({currentStore.URLS?.length || 0})
              </Text>
            </Group>
            {currentStore.URLS?.length > 0 ? (
              <Group gap="xs" wrap="wrap">
                {currentStore.URLS.map((link) => (
                  <Button
                    key={link.id}
                    component="a"
                    href={link.URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    variant="light"
                    size="xs"
                    color="blue"
                    leftSection={<IconExternalLink size={11} />}
                  >
                    {link.Label || link.URL}
                  </Button>
                ))}
              </Group>
            ) : (
                <Text size="xs" c="dimmed">Add website, social, and external links.</Text>
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
          Visit
        </Button>
        {isAuthorized && (
          <>
            <Button
              component="a"
              href={`/tienda/${currentStore.slug}/team`}
              variant="light"
              leftSection={<IconUsers size={16} />}
            >
              Team
            </Button>
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
              {isPublished ? 'Unpublish' : 'Publish'}
            </Button>
            <Button
              component="a"
              variant="light"
              href={`/tienda/${currentStore.slug}/store`}
              leftSection={<IconEdit size={16} />}
            >
              Edit
            </Button>
          </>
        )}
      </Group>

      <Tabs value={activeTab} onChange={(value) => setActiveTab(value || 'latest')} keepMounted={false} className="tienda-overview-tabs">
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
                <Text fw={600}><span className="accent-yellow">Content</span> Feed</Text>
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
                    ctaLabel: 'Manage',
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
          <Paper withBorder radius="lg" p="md" className="tienda-panel">
            <Stack gap="sm">
              <Group justify="space-between" align="center" wrap="wrap" gap="xs">
                <Text fw={600}><span className="accent-orange">CRM</span></Text>
                <Tooltip label="Open CRM workspace" withArrow>
                  <ActionIcon
                    component="a"
                    href={`/tienda/${store.slug}/crm`}
                    variant="light"
                    color="orange"
                    size="lg"
                    aria-label="Open CRM workspace"
                  >
                    <IconArrowUpRight size={16} />
                  </ActionIcon>
                </Tooltip>
              </Group>

              <Group gap="xs" wrap="wrap">
                <Badge variant="light" color="orange" leftSection={<IconMessageCircle size={12} />}>
                  Inbox {crmInboxThreads.length}
                </Badge>
                <Badge variant="light" color="pink" leftSection={<IconUsers size={12} />}>
                  Subscribers
                </Badge>
              </Group>

              {crmInboxLoading ? (
                <Text size="sm" c="dimmed">Loading inbox preview...</Text>
              ) : crmInboxError ? (
                <Text size="sm" c="red">{crmInboxError}</Text>
              ) : crmInboxThreads.length > 0 ? (
                <Stack gap={6}>
                  {crmInboxThreads.map((thread, index) => {
                    const subject = (thread.subject || thread.Name || '').trim() || 'No subject';
                    const sender = (thread.email || thread.from || '').trim() || 'Customer';
                    const dateValue = thread.latestMessageAt || thread.updatedAt;
                    const dateLabel = dateValue ? new Date(dateValue).toLocaleDateString() : 'No date';
                    const threadId = toShortThreadId(String(thread.documentId || thread.id || '').trim());
                    const estado = (thread.estado || '').toLowerCase().trim();
                    const estadoLabel = !estado || estado === 'open' || estado === 'new' || estado === 'unread'
                      ? 'New'
                      : estado.charAt(0).toUpperCase() + estado.slice(1);
                    const threadHref = threadId
                      ? `/tienda/${store.slug}/crm/inbox/${encodeURIComponent(threadId)}`
                      : `/tienda/${store.slug}/crm#crm-inbox`;

                    return (
                      <Paper
                        key={thread.documentId || thread.id || index}
                        withBorder
                        radius="md"
                        p="xs"
                        component={Link}
                        href={threadHref}
                        style={{
                          background: 'rgba(255,255,255,0.74)',
                          textDecoration: 'none',
                          color: 'inherit',
                          cursor: 'pointer',
                        }}
                      >
                        <Group justify="space-between" align="center" wrap="nowrap" gap="xs">
                          <div style={{ minWidth: 0 }}>
                            <Text size="sm" fw={600} lineClamp={1}>{subject}</Text>
                            <Group gap={6} wrap="wrap">
                              <Text size="xs" c="dimmed" lineClamp={1}>{sender}</Text>
                              <Badge size="xs" variant="light" color={estadoLabel === 'New' ? 'orange' : 'gray'}>
                                {estadoLabel}
                              </Badge>
                            </Group>
                          </div>
                          <Text size="xs" c="dimmed" style={{ flexShrink: 0 }}>{dateLabel}</Text>
                        </Group>
                      </Paper>
                    );
                  })}
                    </Stack>
                  ) : (
                      <Text size="sm" c="dimmed">
                        No inbox messages yet. New conversations will appear here.
                      </Text>
              )}
            </Stack>
          </Paper>
        </Tabs.Panel>

        <Tabs.Panel value="payouts" pt="md">
          <Paper withBorder radius="lg" p="md" className="tienda-panel">
            <Stack gap="sm">
              <Group justify="space-between" align="center" wrap="wrap" gap="xs">
                <Text fw={600}>Payouts</Text>
                <Button component="a" disabled href={`/tienda/${store.slug}/payouts`} variant="light" leftSection={<IconCreditCard size={14} />}>
                  View payouts
                </Button>
              </Group>
              <Text size="sm" c="dimmed">
                Activate Stripe Connect here when you are ready. Once it is live, your payout information will show up here.
              </Text>
            </Stack>
          </Paper>
        </Tabs.Panel>
      </Tabs>
    </Stack>
  );
}
