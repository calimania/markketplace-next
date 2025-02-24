import { strapiClient } from "@/markket/api";
const MARKKETPLACE_URL = process.env.NEXT_PUBLIC_MARKKETPLACE_URL || 'https://de.markket.place';
import { Store } from "@/markket/store";

import type { MetadataRoute } from 'next'

const buildUrl = (slug: string, base: string) => new URL(slug, base).toString();

export default async function sitemap(): Promise<MetadataRoute.Sitemap[]> {

  const stores = await strapiClient.getStores({ page: 1, pageSize: 100 }, { filter: '', sort: '' });
  const list: any[] = [];

  stores?.data?.map((store: Store) => (
    list.push({
      url: buildUrl(`store/${store.slug}`, MARKKETPLACE_URL),
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
     } ,{
      url: buildUrl(`store/${store.slug}/blog`, MARKKETPLACE_URL),
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },{
      url: buildUrl(`store/${store.slug}/products`, MARKKETPLACE_URL),
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },{
      url: buildUrl(`store/${store.slug}/about/newsletter`, MARKKETPLACE_URL),
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: buildUrl(`store/${store.slug}/about`, MARKKETPLACE_URL),
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    })
  ));

  return [
    {
      url: MARKKETPLACE_URL,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: buildUrl(`docs`, MARKKETPLACE_URL),
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.5,
    },
    {
      url: buildUrl(`stores`, MARKKETPLACE_URL),
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.5,
    },
     {
      url: buildUrl(`auth/register`, MARKKETPLACE_URL),
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: buildUrl(`auth/login`, MARKKETPLACE_URL),
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    ...list,
  ] as MetadataRoute.Sitemap[];
};
