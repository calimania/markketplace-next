import type { MetadataRoute } from 'next';
import { strapiClient } from '@/markket/api.strapi';
import { markketplace } from '@/markket/config';
import type { Store } from '@/markket/store.d';
import type { Article } from '@/markket/article';
import type { Page } from '@/markket/page.d';
import type { Event } from '@/markket/event.d';
import type { Product } from '@/markket/product.d';

const MARKKETPLACE_URL = process.env.NEXT_PUBLIC_MARKKETPLACE_URL || markketplace.markket_url || 'https://markket.place';

const buildUrl = (path: string) => new URL(path, MARKKETPLACE_URL).toString();

const toDate = (value?: string) => {
  if (!value) return new Date();
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
};

const uniqueByUrl = (entries: MetadataRoute.Sitemap): MetadataRoute.Sitemap => {
  const seen = new Set<string>();

  return entries.filter((entry) => {
    if (seen.has(entry.url)) {
      return false;
    }

    seen.add(entry.url);
    return true;
  });
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [
    storesResponse,
    communityPostsResponse,
    communityPagesResponse,
    communityEventsResponse,
    communityProductsResponse,
  ] = await Promise.all([
    strapiClient.getStores({ page: 1, pageSize: 200 }, { filter: { active: { $eq: true } }, sort: 'updatedAt:desc' }),
    strapiClient.getCommunityPosts({ page: 1, pageSize: 200 }, { sort: 'publishedAt:desc' }),
    strapiClient.getCommunityPages({ page: 1, pageSize: 200 }, { sort: 'updatedAt:desc' }),
    strapiClient.getCommunityEvents({ page: 1, pageSize: 200 }, { sort: 'startDate:asc' }),
    strapiClient.getCommunityProducts({ page: 1, pageSize: 200 }, { sort: 'updatedAt:desc' }),
  ]);

  const stores = (storesResponse?.data || []) as Store[];
  const posts = (communityPostsResponse?.data || []) as Article[];
  const pages = (communityPagesResponse?.data || []) as Page[];
  const events = (communityEventsResponse?.data || []) as Event[];
  const products = (communityProductsResponse?.data || []) as Product[];

  const staticEntries: MetadataRoute.Sitemap = [
    {
      url: MARKKETPLACE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: buildUrl('/stores'),
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: buildUrl('/blog'),
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: buildUrl('/newsletter'),
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.6,
    },
    {
      url: buildUrl('/docs'),
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.5,
    },
  ];

  const storeEntries: MetadataRoute.Sitemap = stores.flatMap((store) => {
    const lastModified = toDate(store.updatedAt || store.publishedAt);

    return [
      {
        url: buildUrl(`/${store.slug}`),
        lastModified,
        changeFrequency: 'weekly',
        priority: 0.9,
      },
      {
        url: buildUrl(`/${store.slug}/about`),
        lastModified,
        changeFrequency: 'weekly',
        priority: 0.7,
      },
      {
        url: buildUrl(`/${store.slug}/blog`),
        lastModified,
        changeFrequency: 'weekly',
        priority: 0.7,
      },
      {
        url: buildUrl(`/${store.slug}/products`),
        lastModified,
        changeFrequency: 'weekly',
        priority: 0.8,
      },
      {
        url: buildUrl(`/${store.slug}/events`),
        lastModified,
        changeFrequency: 'weekly',
        priority: 0.7,
      },
      {
        url: buildUrl(`/${store.slug}/about/newsletter`),
        lastModified,
        changeFrequency: 'weekly',
        priority: 0.5,
      },
    ];
  });

  const pageEntries: MetadataRoute.Sitemap = pages
    .filter((page) => page.slug && !['home', 'about', 'newsletter'].includes(page.slug))
    .map((page) => ({
      url: buildUrl(`/${page.store?.slug}/about/${page.slug}`),
      lastModified: toDate(page.updatedAt || page.publishedAt),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    }))
    .filter((entry) => !entry.url.includes('/undefined/'));

  const postEntries: MetadataRoute.Sitemap = posts
    .map((post) => ({
      url: buildUrl(`/${post.store?.slug}/blog/${post.slug}`),
      lastModified: toDate(post.updatedAt || post.publishedAt),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    }))
    .filter((entry) => !entry.url.includes('/undefined/'));

  const eventEntries: MetadataRoute.Sitemap = events
    .map((event) => ({
      url: buildUrl(`/${(event as any)?.stores?.[0]?.slug}/events/${event.slug}`),
      lastModified: toDate(event.updatedAt || event.publishedAt || event.startDate),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }))
    .filter((entry) => !entry.url.includes('/undefined/'));

  const productEntries: MetadataRoute.Sitemap = products
    .map((product) => ({
      url: buildUrl(`/${(product as any)?.stores?.[0]?.slug}/products/${product.slug}`),
      lastModified: toDate(product.updatedAt || product.publishedAt),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }))
    .filter((entry) => !entry.url.includes('/undefined/'));

  return uniqueByUrl([
    ...staticEntries,
    ...storeEntries,
    ...pageEntries,
    ...postEntries,
    ...eventEntries,
    ...productEntries,
  ]);
}
