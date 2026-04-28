import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { strapiClient } from '@/markket/api.strapi';
import { findStoreForTienda } from './store.find';
import StoreOverview from './store.overview';
import type { Store } from '@/markket/store';
import type { Article } from '@/markket/article';
import type { Page } from '@/markket/page';
import type { Product } from '@/markket/product';
import type { Event } from '@/markket/event';
import { TIENDA_OVERVIEW_PREVIEW_LIMIT } from './content.list.queries';

type TiendaStorePageProps = {
  params: Promise<{ storeSlug: string }>;
};

export const metadata: Metadata = {
  title: 'Overview',
};

export const fetchCache = 'force-no-store';
export const revalidate = 0;

export default async function TiendaStorePage({ params }: TiendaStorePageProps) {
  const { storeSlug } = await params;

  const [store, postsResponse, pagesResponse, productsResponse, eventsResponse] = await Promise.all([
    findStoreForTienda(storeSlug),
    strapiClient.fetch<Article>({
      contentType: 'articles',
      filters: {
        store: {
          slug: {
            $eq: storeSlug,
          },
        },
      },
      sort: 'updatedAt:desc',
      paginate: { page: 1, pageSize: TIENDA_OVERVIEW_PREVIEW_LIMIT },
      populate: 'SEO.socialImage,Tags,cover,store',
      status: 'all',
      includeAuth: true,
    }),
    strapiClient.fetch<Page>({
      contentType: 'pages',
      filters: {
        store: {
          slug: {
            $eq: storeSlug,
          },
        },
      },
      populate: 'SEO.socialImage',
      status: 'all',
      includeAuth: true,
    }),
    strapiClient.fetch<Product>({
      contentType: 'products',
      filters: {
        stores: {
          slug: {
            $eq: storeSlug,
          },
        },
      },
      sort: 'updatedAt:desc',
      paginate: { page: 1, pageSize: TIENDA_OVERVIEW_PREVIEW_LIMIT },
      populate: 'SEO.socialImage,Thumbnail,Slides,PRICES,stores',
      status: 'all',
      includeAuth: true,
    }),
    strapiClient.fetch<Event>({
      contentType: 'events',
      filters: {
        stores: {
          slug: {
            $eq: storeSlug,
          },
        },
      },
      populate: 'SEO,SEO.socialImage,Tag,Thumbnail,Slides,stores',
      status: 'all',
      includeAuth: true,
    }),
  ]);

  if (!store) {
    notFound();
  }

  const latestPosts = ((postsResponse?.data || []) as Article[]).slice(0, TIENDA_OVERVIEW_PREVIEW_LIMIT);
  const allPages = (pagesResponse?.data || []) as Page[];
  const latestPages = allPages
    .sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt))
    .slice(0, TIENDA_OVERVIEW_PREVIEW_LIMIT);

  const allProducts = ((productsResponse?.data || []) as Product[]).slice(0, TIENDA_OVERVIEW_PREVIEW_LIMIT);
  const upcomingEvents = ((eventsResponse?.data || []) as Event[])
    .sort((a, b) => +new Date(a.startDate) - +new Date(b.startDate))
    .slice(0, TIENDA_OVERVIEW_PREVIEW_LIMIT);

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
