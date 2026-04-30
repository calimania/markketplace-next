import { strapiClient } from '@/markket/api.strapi';
import type { Store } from '@/markket/store';
import { cache } from 'react';

type StoreStatus = 'all' | 'draft' | 'published';

async function findStoreByStatus(slug: string, status: StoreStatus = 'all') {
  return strapiClient.fetch<Store>({
    contentType: 'stores',
    filters: {
      slug: {
        $eq: slug,
      },
    },
    status,
    populate: 'Logo,SEO,SEO.socialImage,Favicon,URLS,Cover,Slides',
    paginate: { page: 1, pageSize: 1 },
    includeAuth: true,
  });
}

export const findStoreForTienda = cache(async (slug: string) => {
  const statusesToTry: StoreStatus[] = ['published', 'draft', 'all'];

  for (const status of statusesToTry) {
    const response = await findStoreByStatus(slug, status);
    if (response?.data?.[0]) {
      return response.data[0] as Store;
    }
  }

  return undefined;
});
