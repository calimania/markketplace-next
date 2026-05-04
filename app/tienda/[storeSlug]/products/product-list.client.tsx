'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import NavTable from '@/app/components/ui/nav.table';
import type { Product } from '@/markket/product';
import { tiendaClient } from '@/markket/api.tienda';
import { TIENDA_CONTENT_LIST_QUERY } from '../content.list.queries';
import { isPublished } from '@/markket/helpers.publication';

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

function sortByRecent(items: Product[]) {
  return [...items].sort((a, b) => {
    const aTime = new Date(a.updatedAt || a.createdAt || 0).getTime();
    const bTime = new Date(b.updatedAt || b.createdAt || 0).getTime();
    return bTime - aTime;
  });
}

export default function ProductListClient({ storeSlug, initialProducts }: ProductListClientProps) {
  const [products, setProducts] = useState<Product[]>(sortByRecent(initialProducts || []));
  const [loading, setLoaading] = useState(true);

  useEffect(() => {
    const token = readAuthToken();
    if (!token) return;

    const loadAllContent = async () => {
      try {
        const response = await tiendaClient.listContent(storeSlug, 'product', {
          token,
          query: TIENDA_CONTENT_LIST_QUERY.product,
        });

        const allItems = Array.isArray(response?.data) ? (response.data as Product[]) : (Array.isArray(response) ? (response as Product[]) : []);

        if (allItems.length > 0) {
          allItems.forEach((product) => {
            merged.set(itemKey(product), product);
          });
          setProducts(sortByRecent(Array.from(merged.values())));
        }
      } catch (error) {
        console.error('[ProductListClient] Failed to load products:', error);
      }
      setLoaading(false);
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
          thumbnailUrl: product.Thumbnail?.url || product?.SEO?.socialImage?.url || product?.Slides?.[0]?.url,
        };
      }),
    [products, storeSlug],
  );

  return <NavTable emptyText="No products yet." items={items} loading={loading} />;
}
