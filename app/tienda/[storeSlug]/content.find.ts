import { tiendaClient } from '@/markket/api.tienda';
import type { TiendaContentType } from '@/markket/tienda.endpoints';
import type { Article } from '@/markket/article';
import type { Page } from '@/markket/page';
import type { Product } from '@/markket/product';
import type { Event } from '@/markket/event';
import type { Album } from '@/markket/album';

const DEFAULT_CONTENT_POPULATE: Record<TiendaContentType, string[]> = {
  article: ['SEO', 'SEO.socialImage', 'Tags', 'cover', 'store', 'store.Logo'],
  page: ['SEO', 'SEO.socialImage', 'store', 'store.Logo', 'albums', 'albums.cover', 'albums.SEO', 'albums.tracks'],
  product: ['SEO', 'SEO.socialImage', 'Thumbnail', 'Slides', 'PRICES', 'stores', 'stores.Logo', 'extras'],
  event: ['SEO', 'SEO.socialImage', 'Tag', 'Thumbnail', 'Slides', 'stores'],
  album: ['SEO', 'cover', 'tracks', 'tracks.SEO', 'tracks.media', 'store', 'store.Logo'],
  track: ['SEO', 'media', 'urls', 'store', 'store.Logo'],
  category: ['SEO'],
  shortner: ['SEO'],
  order: ['SEO'],
};

export function readTiendaAuthToken() {
  if (typeof window === 'undefined') return '';

  try {
    const raw = localStorage.getItem('markket.auth');
    const parsed = raw ? JSON.parse(raw) : null;
    return parsed?.jwt || '';
  } catch {
    return '';
  }
}

function getPopulateQuery(contentType: TiendaContentType) {
  const values = DEFAULT_CONTENT_POPULATE[contentType] || [];
  return values.length > 0 ? { 'populate[]': values } : {};
}

async function getContentById<T>(storeSlug: string, contentType: TiendaContentType, itemId: string, token: string) {
  const response = await tiendaClient.getContent(storeSlug, contentType, itemId, {
    token,
    query: {
      status: 'all',
      ...getPopulateQuery(contentType),
    },
  });

  return response?.data as T | undefined;
}

async function getContentBySlug<T>(storeSlug: string, contentType: TiendaContentType, slug: string, token: string) {
  const response = await tiendaClient.listContent(storeSlug, contentType, {
    token,
    query: {
      status: 'all',
      'pagination[page]': 1,
      'pagination[pageSize]': 1,
      'filters[slug][$eq]': slug,
      ...getPopulateQuery(contentType),
    },
  });

  if (Array.isArray(response?.data)) {
    return response.data[0] as T | undefined;
  }

  return undefined;
}

export async function findTiendaContent<T = Article | Page | Product | Event | Album>(
  storeSlug: string,
  contentType: TiendaContentType,
  itemId: string,
  token: string,
) {
  if (!token) return undefined;

  const byId = await getContentById<T>(storeSlug, contentType, itemId, token);
  if (byId) return byId;

  return getContentBySlug<T>(storeSlug, contentType, itemId, token);
}
