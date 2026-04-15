import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { strapiClient } from '@/markket/api.strapi';
import StoreOverview from './store.overview';
import type { Store } from '@/markket/store';
import type { Article } from '@/markket/article';
import type { Page } from '@/markket/page';
import type { Product } from '@/markket/product';
import type { Event } from '@/markket/event';

type TiendaStorePageProps = {
  params: Promise<{ storeSlug: string }>;
};

export const metadata: Metadata = {
  title: 'Overview',
};

export default async function TiendaStorePage({ params }: TiendaStorePageProps) {
  const { storeSlug } = await params;

  const [storeResponse, postsResponse, pagesResponse, productsResponse, eventsResponse] = await Promise.all([
    strapiClient.getStore(storeSlug),
    strapiClient.getPosts({ page: 1, pageSize: 5 }, { sort: 'createdAt:desc' }, storeSlug),
    strapiClient.getPages(storeSlug),
    strapiClient.getProducts({ page: 1, pageSize: 5 }, { filter: '', sort: 'updatedAt:desc' }, storeSlug),
    strapiClient.getEvents(storeSlug),
  ]);

  const store = storeResponse?.data?.[0] as Store | undefined;

  if (!store) {
    notFound();
  }

  const latestPosts = ((postsResponse?.data || []) as Article[]).slice(0, 5);
  const allPages = (pagesResponse?.data || []) as Page[];
  const latestPages = allPages
    .filter((page) => page.slug !== 'home')
    .sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt))
    .slice(0, 5);

  const allProducts = ((productsResponse?.data || []) as Product[]).slice(0, 5);
  const upcomingThreshold = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const upcomingEvents = ((eventsResponse?.data || []) as Event[])
    .filter((event) => new Date(event.startDate) >= upcomingThreshold)
    .sort((a, b) => +new Date(a.startDate) - +new Date(b.startDate))
    .slice(0, 5);

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
