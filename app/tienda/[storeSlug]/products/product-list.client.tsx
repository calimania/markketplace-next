'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { SegmentedControl, Stack } from '@mantine/core';
import NavTable from '@/app/components/ui/nav.table';
import type { Product } from '@/markket/product';
import { tiendaClient } from '@/markket/api.tienda';
import { TIENDA_CONTENT_LIST_QUERY } from '../content.list.queries';
import { isPublished } from '@/markket/helpers.publication';
import { readTiendaAuthToken, parseTiendaResponse, getTiendaItemKey } from '@/markket/helpers.tienda';

type ProductListClientProps = {
  storeSlug: string;
  initialProducts: Product[];
};

function sortByRecent(items: Product[]) {
  return [...items].sort((a, b) => {
    const aTime = new Date(a.updatedAt || a.createdAt || 0).getTime();
    const bTime = new Date(b.updatedAt || b.createdAt || 0).getTime();
    return bTime - aTime;
  });
}

export default function ProductListClient({ storeSlug, initialProducts }: ProductListClientProps) {
  const [products, setProducts] = useState<Product[]>(sortByRecent(initialProducts || []));
  const [loading, setLoading] = useState(true);
  const [sortMode, setSortMode] = useState<'recent' | 'alpha' | 'alpha-desc'>('recent');

  useEffect(() => {
    let isMounted = true;

    const token = readTiendaAuthToken();
    if (!token) {
      setLoading(false);
      return;
    }

    const loadAllContent = async () => {
      try {
        const response = await tiendaClient.listContent(storeSlug, 'product', {
          token,
          query: TIENDA_CONTENT_LIST_QUERY.product,
        });

        if (!isMounted) return;

        const allItems = parseTiendaResponse<Product>(response);

        if (allItems && allItems.length > 0) {
          setProducts(sortByRecent(allItems));
        } else {
          setProducts([]);
        }
      } catch (error) {
        console.error('[ProductListClient] Failed to load products:', error);
        if (isMounted) setProducts([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadAllContent();

    return () => {
      isMounted = false;
    };
  }, [storeSlug]);

  const formatDate = (value?: string) => (value ? new Date(value).toLocaleDateString() : 'No date');

  const sortedProducts = useMemo(() => {
    if (sortMode === 'alpha') {
      return [...products].sort((a, b) => (a.Name || '').localeCompare(b.Name || ''));
    }

    if (sortMode === 'alpha-desc') {
      return [...products].sort((a, b) => (b.Name || '').localeCompare(a.Name || ''));
    }

    return sortByRecent(products);
  }, [products, sortMode]);

  const items = useMemo(
    () =>
      sortedProducts.map((product) => {
        const key = getTiendaItemKey(product);
        const statusText = isPublished(product) ? 'Published' : 'Draft';

        return {
          key,
          title: product.Name || 'Untitled product',
          subtitle: `${statusText} · ${formatDate(product.updatedAt || product.createdAt)} · ${product.slug}`,
          href: `/tienda/${storeSlug}/products/${product.documentId || product.slug}`,
          previewHref: `/${storeSlug}/products/${product.slug}`,
          icon: 'product' as const,
          thumbnailUrl: product.Thumbnail?.url || product?.SEO?.socialImage?.url || product?.Slides?.[0]?.url,
        };
      }),
    [sortedProducts, storeSlug],
  );

  return (
    <Stack gap="xs">
      <SegmentedControl
        size="xs"
        value={sortMode}
        onChange={(value) => setSortMode(value as 'recent' | 'alpha' | 'alpha-desc')}
        data={[
          { label: 'Recent', value: 'recent' },
          { label: 'A-Z', value: 'alpha' },
          { label: 'Z-A', value: 'alpha-desc' },
        ]}
      />
      <NavTable emptyText="No products yet." items={items} loading={loading} />
    </Stack>
  );
}
