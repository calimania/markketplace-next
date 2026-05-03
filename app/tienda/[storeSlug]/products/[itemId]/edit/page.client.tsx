'use client';

import { useEffect, useState } from 'react';
import { Center, Text } from '@mantine/core';
import TiendaDetailShell from '@/app/components/ui/tienda.detail.shell';
import ProductEditorForm from '../../product.editor.form';
import { findProduct } from '../../products.find';
import { readTiendaAuthToken } from '../../../content.find';
import type { Product } from '@/markket/product';

type TiendaProductEditPageClientProps = {
  storeSlug: string;
  itemId: string;
};

export default function TiendaProductEditPageClient({ storeSlug, itemId }: TiendaProductEditPageClientProps) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const token = readTiendaAuthToken();

    if (!token) {
      setError('Authentication required to edit this product.');
      setLoading(false);
      return;
    }

    const loadProduct = async () => {
      try {
        const data = await findProduct(itemId, storeSlug, token);
        if (!active) return;

        if (!data) {
          setError('This product could not be found.');
          return;
        }

        setProduct(data);
      } catch (err) {
        console.error('Tienda product edit load error', err);
        if (!active) return;
        setError('Unable to load the product. Please refresh.');
      } finally {
        if (active) setLoading(false);
      }
    };

    loadProduct();
    return () => {
      active = false;
    };
  }, [itemId, storeSlug]);

  if (loading) {
    return (
      <Center py="xl">
        <Text c="dimmed">Loading product editor…</Text>
      </Center>
    );
  }

  if (error || !product) {
    return (
      <TiendaDetailShell
        breadcrumbs={[
          { label: 'Tienda', href: '/tienda' },
          { label: storeSlug, href: `/tienda/${storeSlug}` },
          { label: 'Products', href: `/tienda/${storeSlug}/products` },
          { label: itemId },
          { label: 'Edit' },
        ]}
        title="Product not found"
        routePath={`/tienda/${storeSlug}/products/${itemId}/edit`}
      >
        <Text c="dimmed">{error || 'This product does not exist.'}</Text>
      </TiendaDetailShell>
    );
  }

  return (
    <TiendaDetailShell
      breadcrumbs={[
        { label: 'Tienda', href: '/tienda' },
        { label: storeSlug, href: `/tienda/${storeSlug}` },
        { label: 'Products', href: `/tienda/${storeSlug}/products` },
        { label: product.slug || itemId, href: `/tienda/${storeSlug}/products/${product.slug || itemId}` },
        { label: 'Edit' },
      ]}
      title={`Edit: ${product.Name || 'Product'}`}
      routePath={`/tienda/${storeSlug}/products/${product.slug || itemId}/edit`}
    >
      <ProductEditorForm
        storeSlug={storeSlug}
        mode="edit"
        itemDocumentId={product.documentId || itemId}
        initial={{
          name: product.Name,
          slug: product.slug,
          description: product.Description || undefined,
          seoTitle: product.SEO?.metaTitle || undefined,
          seoDescription: product.SEO?.metaDescription || undefined,
        }}
      />
    </TiendaDetailShell>
  );
}
