'use client';

import { useEffect, useState } from 'react';
import { Badge, Button, Center, Divider, Paper, Stack, Text } from '@mantine/core';
import { IconExternalLink, } from '@tabler/icons-react';
import SmartBackButton from '@/app/components/ui/smart.back.button';
import TiendaDetailShell from '@/app/components/ui/tienda.detail.shell';
import Markdown from '@/app/components/ui/page.markdown';
import ContentMediaPreview from '@/app/components/ui/content.media.preview';
import PublicLinkActions from '@/app/components/ui/public.link.actions';
import ProductItemActions from './product.item.actions';
import { findProduct } from './products.find';
import { isPublished } from '@/markket/helpers.publication';
import { readTiendaAuthToken } from '../content.find';
import type { Product } from '@/markket/product';

type TiendaProductItemPageClientProps = {
  storeSlug: string;
  itemId: string;
};

export default function TiendaProductItemPageClient({ storeSlug, itemId }: TiendaProductItemPageClientProps) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const token = readTiendaAuthToken();

    if (!token) {
      setError('Authentication required to view this product.');
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
        console.error('Tienda product item load error', err);
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
        <Text c="dimmed">Loading product preview…</Text>
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
        ]}
        title="Product not found"
        routePath={`/tienda/${storeSlug}/products/${itemId}`}
      >
        <Stack gap="md">
          <Text c="dimmed">{error || 'This product does not exist.'}</Text>
          <Button component="a" href={`/tienda/${storeSlug}/products`} variant="outline">
            Back to products
          </Button>
        </Stack>
      </TiendaDetailShell>
    );
  }

  const editorId = product.documentId || product.slug || itemId;
  const itemDocumentId = product.documentId || itemId;
  const slideSlots = (product.Slides || []).map((slide, index) => ({
    label: `Slide ${index + 1}`,
    field: 'Slides',
    src: slide?.formats?.small?.url || slide?.url,
    alt: slide?.alternativeText || `${product.Name || 'Product'} slide ${index + 1}`,
  }));

  return (
    <TiendaDetailShell
      breadcrumbs={[
        { label: 'Tienda', href: '/tienda' },
        { label: storeSlug, href: `/tienda/${storeSlug}` },
        { label: 'Products', href: `/tienda/${storeSlug}/products` },
        { label: product.slug || itemId },
      ]}
      title={product.Name || 'Untitled product'}
      routePath={`/tienda/${storeSlug}/products/${product.slug || itemId}`}
      actions={
        <>
          <SmartBackButton fallbackHref={`/tienda/${storeSlug}/products`} />
          <ProductItemActions
            storeSlug={storeSlug}
            itemDocumentId={itemDocumentId}
            editorId={editorId}
            isPublished={isPublished(product)}
          />
        </>
      }
    >
      <Stack gap="md">
        <Text c="dimmed">{product.SEO?.metaDescription || 'No summary yet.'}</Text>

        <ContentMediaPreview
          storeRef={storeSlug}
          contentType="product"
          itemDocumentId={itemDocumentId}
          slots={[
            {
              label: 'Thumbnail',
              field: 'Thumbnail',
              src: product.Thumbnail?.url,
              alt: product.Thumbnail?.alternativeText || product.Name,
            },
            {
              label: 'Cover / Social',
              field: 'SEO.socialImage',
              src: product.SEO?.socialImage?.url,
              alt: product.SEO?.socialImage?.alternativeText || product.Name,
            },
            ...slideSlots,
            {
              label: 'Add Slide',
              field: 'Slides',
              alt: `${product.Name || 'Product'} slide`,
            },
          ]}
        />

        <Divider label={<Badge variant="dot" color="gray" size="sm">Description</Badge>} labelPosition="left" />

        {product.Description && (
          <Paper withBorder p="lg" radius="md" className="prose dark:prose-dark max-w-none">
            <Markdown content={product.Description} />
          </Paper>
        )}
        {!product.Description && product.SEO?.metaDescription && (
          <Paper withBorder p="lg" radius="md">
            {product.SEO.metaDescription}
          </Paper>
        )}
        {!product.Description && !product.SEO?.metaDescription && (
          <Paper withBorder p="lg" radius="md" bg="var(--mantine-color-gray-0)">
            No description yet.
          </Paper>
        )}

        <PublicLinkActions
          path={`/${storeSlug}/products/${product.slug || product.documentId || itemId}`}
          openLabel="Open public product"
        />

        {product.SEO?.metaUrl && (
          <>
            <Divider />
            <Button
              component="a"
              href={product.SEO.metaUrl}
              target="_blank"
              rel="noopener noreferrer"
              size="lg"
              fullWidth
              rightSection={<IconExternalLink size={16} />}
            >
              Buy at {new URL(product.SEO.metaUrl).hostname}
            </Button>
          </>
        )}
      </Stack>
    </TiendaDetailShell>
  );
}
