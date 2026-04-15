
import { strapiClient } from '@/markket/api.strapi';
import { generateSEOMetadata } from '@/markket/metadata';
import { Metadata } from "next";
import HomePageComponent from '@/app/components/ui/home.page';
import type { Article } from '@/markket/article';
import type { Store } from '@/markket/store.d';
import type { Page } from '@/markket/page.d';
import type { Event } from '@/markket/event.d';

export async function generateMetadata(): Promise<Metadata> {
  const { data: [page] } = await strapiClient.getPage('home');

  return generateSEOMetadata({
    slug: process.env.NEXT_PUBLIC_MARKKET_STORE_SLUG as string,
    entity: {
      SEO: page?.SEO,
      title: page?.Title || 'Homepage',
      url: `/`,
    },
    type: 'website',
    defaultTitle: `${page?.Title}` || 'Homepage',
  });
};

/**
 * home page for the markketplace
 *
 * @returns {JSX.Element}
 */
export default async function Home() {
  const [{ data: [store] }, { data: [page] }, communityPostsResponse, storesResponse, communityPagesResponse, communityEventsResponse] = await Promise.all([
    strapiClient.getStore(),
    strapiClient.getPage('home'),
    strapiClient.getCommunityPosts({ page: 1, pageSize: 6 }, { sort: 'publishedAt:desc' }),
    strapiClient.getStores({ page: 1, pageSize: 6 }, { filter: { 'active': { $eq: true } }, sort: 'updatedAt:desc' }),
    strapiClient.getCommunityPages({ page: 1, pageSize: 6 }, { sort: 'updatedAt:desc' }),
    strapiClient.getCommunityEvents({ page: 1, pageSize: 6 }, { sort: 'startDate:asc' }),
  ]);

  const communityPosts = (communityPostsResponse?.data || []) as Article[];
  const featuredStores = (storesResponse?.data || []) as Store[];
  const communityPages = (communityPagesResponse?.data || []) as Page[];
  const communityEvents = (communityEventsResponse?.data || []) as Event[];

  return <HomePageComponent store={store} page={page} communityPosts={communityPosts} featuredStores={featuredStores} communityPages={communityPages} communityEvents={communityEvents} />;
};
