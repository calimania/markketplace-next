'use client';

import { useEffect, useMemo, useState } from 'react';
import NavTable from '@/app/components/ui/nav.table';
import type { Product } from '@/markket/product';
import { tiendaClient } from '@/markket/api.tienda';
import { TIENDA_CONTENT_LIST_QUERY } from '../content.list.queries';

type ProductListClientProps = {
  storeSlug: string;
  initialProducts: Product[];
};

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

function itemKey(product: Partial<Product>) {
  return String(product.documentId || product.id || product.slug || product.Name || Math.random());
}

function isPublished(product: Partial<Product>) {
  return Boolean(product.publishedAt);
}

function sortByRecent(items: Product[]) {
  return [...items].sort((a, b) => {
    const aTime = new Date(a.updatedAt || a.createdAt || 0).getTime();
    const bTime = new Date(b.updatedAt || b.createdAt || 0).getTime();
    return bTime - aTime;
  });
}

export default function ProductListClient({ storeSlug, initialProducts }: ProductListClientProps) {
  const [products, setProducts] = useState<Product[]>(sortByRecent(initialProducts || []));

  useEffect(() => {
    const token = readAuthToken();
    if (!token) {
      console.log('[ProductListClient] No token in localStorage');
      return;
    }

    const loadAllContent = async () => {
      try {
        console.log('[ProductListClient] Fetching content for store:', storeSlug);
        const response = await tiendaClient.listContent(storeSlug, 'product', {
          token,
          query: TIENDA_CONTENT_LIST_QUERY.product,
        });

        console.log('[ProductListClient] API response:', { response, hasData: !!response?.data });

        const merged = new Map<string, Product>();
        const allItems = Array.isArray(response?.data) ? (response.data as Product[]) : (Array.isArray(response) ? (response as Product[]) : []);

        console.log('[ProductListClient] Parsed items:', { count: allItems.length, items: allItems.map(p => ({ id: p.documentId, title: p.Name, published: !!p.publishedAt })) });

        if (allItems.length > 0) {
          allItems.forEach((product) => {
            merged.set(itemKey(product), product);
          });
          setProducts(sortByRecent(Array.from(merged.values())));
        }
      } catch (error) {
        console.error('[ProductListClient] Failed to load products:', error);
      }
    };

    loadAllContent();
  }, [storeSlug]);

  const formatDate = (value?: string) => (value ? new Date(value).toLocaleDateString() : 'No date');

  const items = useMemo(
    () =>
      products.map((product) => {
        const key = itemKey(product);
        const statusText = isPublished(product) ? 'Published' : 'Draft';

        return {
          key,
          title: product.Name || 'Untitled product',
          subtitle: `${statusText} · ${formatDate(product.updatedAt || product.createdAt)} · ${product.slug}`,
          href: `/tienda/${storeSlug}/products/${product.documentId || product.slug}`,
          icon: 'product' as const,
        };
      }),
    [products, storeSlug],
  );

  return <NavTable emptyText="No products yet." items={items} />;
}
