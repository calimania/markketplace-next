import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { tiendaClient } from '@/markket/api.tienda';
import { findStoreForTienda } from './store.find';
import StoreOverview from './store.overview';
import type { Store } from '@/markket/store';
import type { Article } from '@/markket/article';
import type { Page } from '@/markket/page';
import type { Product } from '@/markket/product';
import type { Event } from '@/markket/event';
import { TIENDA_CONTENT_LIST_QUERY, TIENDA_OVERVIEW_PREVIEW_LIMIT } from './content.list.queries';

type TiendaStorePageProps = {
  params: Promise<{ storeSlug: string }>;
};

export async function generateMetadata({ params }: TiendaStorePageProps): Promise<Metadata> {
  const { storeSlug } = await params;
  return { title: `Overview · ${storeSlug}` };
}

export const fetchCache = 'force-no-store';
export const revalidate = 0;

function extractArray<T>(response: unknown): T[] {
  if (!response || typeof response !== 'object') return [];
  const payload = response as { status?: number; data?: unknown } | null;
  if (payload?.status && payload.status >= 400) return [];
  if (Array.isArray(payload?.data)) return payload.data as T[];
  if (Array.isArray(response)) return response as T[];
  return [];
}

export default async function TiendaStorePage({ params }: TiendaStorePageProps) {
  const { storeSlug } = await params;

  const store = await findStoreForTienda(storeSlug) as Store | undefined;

  if (!store) {
    notFound();
  }

  // For server-side initial render, fetch overview content using Tienda API
  let latestPosts: Article[] = [];
  let latestPages: Page[] = [];
  let allProducts: Product[] = [];
  let upcomingEvents: Event[] = [];

  try {
    // Get server auth token if available (optional for initial render, client will refresh with user token)
    const overviewResponse = await tiendaClient.listOverviewContent(storeSlug, {
      token: process.env.TIENDA_API_TOKEN || 'server-fetch',
      queries: {
        article: TIENDA_CONTENT_LIST_QUERY.article,
        page: TIENDA_CONTENT_LIST_QUERY.page,
        product: TIENDA_CONTENT_LIST_QUERY.product,
        event: TIENDA_CONTENT_LIST_QUERY.event,
      },
    });

    const posts = extractArray<Article>(overviewResponse?.article).slice(0, TIENDA_OVERVIEW_PREVIEW_LIMIT);
    const pages = extractArray<Page>(overviewResponse?.page)
      .sort((a, b) => +new Date(b.updatedAt || 0) - +new Date(a.updatedAt || 0))
      .slice(0, TIENDA_OVERVIEW_PREVIEW_LIMIT);
    const products = extractArray<Product>(overviewResponse?.product).slice(0, TIENDA_OVERVIEW_PREVIEW_LIMIT);
    const events = extractArray<Event>(overviewResponse?.event)
      .sort((a, b) => +new Date(a.startDate || 0) - +new Date(b.startDate || 0))
      .slice(0, TIENDA_OVERVIEW_PREVIEW_LIMIT);

    latestPosts = posts;
    latestPages = pages;
    allProducts = products;
    upcomingEvents = events;
  } catch (error) {
    console.error('[tienda.page] failed to fetch overview content', error instanceof Error ? error.message : String(error));
    // Fall back to empty arrays; client will refresh
  }

  return (
    <StoreOverview
      store={store}
      latestPosts={latestPosts}
      latestPages={latestPages}
      allProducts={allProducts}
      upcomingEvents={upcomingEvents}
    />
  );
}
