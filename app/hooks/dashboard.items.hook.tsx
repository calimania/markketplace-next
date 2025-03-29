import { useState, useEffect } from 'react';
import { strapiClient as strapi } from '@/markket/api.strapi';
import { Store } from '@/markket/store';

type ContentType = 'articles' | 'pages' | 'products' | 'albums' | 'tracks' | 'events'  | 'subscribers' | 'inbox';

interface FetchOptions {
  populate?: string[];
  sort?: string;
  includeAuth?: boolean;
  status?: string;
}

const DEFAULT_OPTIONS: Record<ContentType, FetchOptions> = {
  articles: {
    populate: ['Tags', 'SEO', 'SEO.socialImage'],
    sort: 'updatedAt:desc'
  },
  pages: {
    populate: ['SEO', 'SEO.socialImage'],
    sort: 'updatedAt:desc'
  },
  products: {
    populate: ['SEO', 'SEO.socialImage'],
    sort: 'updatedAt:desc',
  },
  albums: {
    populate: ['SEO', 'SEO.socialImage', 'tracks'],
    sort: 'updatedAt:desc'
  },
  tracks: {
    populate: ['SEO', 'SEO.socialImage'],
    sort: 'updatedAt:desc'
  },
  events: {
    populate: ['SEO', 'SEO.socialImage'],
    sort: 'updatedAt:desc'
  },
  subscribers: {
    populate: [],
    sort: 'updatedAt:desc'
  },
  inbox: {
    populate: [],
    sort: 'updatedAt:desc'
  }
};

export function useCMSItems<T>(
  contentType: ContentType,
  store?: Store | null,
  options?: Partial<FetchOptions>
) {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchItems = async () => {
      setLoading(true);
      setError(null);

      try {
        const mergedOptions = {
          ...DEFAULT_OPTIONS[contentType],
          ...options
        };

        const response = await strapi.fetch({
          contentType,
          filters: {
            //  some models connect with multiple stores - and some are 1:1
            [['products'].includes(contentType)  ? 'stores' : 'store']: {
              $eq: store?.id,
            },
          },
          populate: mergedOptions?.populate?.join(','),
          sort: mergedOptions.sort,
          includeAuth: mergedOptions.includeAuth,
        });

        setItems((response?.data || []) as T[]);
      } catch (error) {
        console.error(`Failed to fetch ${contentType}:`, error);
        setError(error as Error);
      } finally {
        setLoading(false);
      }
    };

    if (store?.id) {
      fetchItems();
    } else {
      setItems([]);
    }
  }, [contentType, store?.id, options]);

  return { items, loading, error };
};

