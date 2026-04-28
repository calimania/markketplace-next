import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Badge, Button, Divider, Paper, Stack, Text } from '@mantine/core';
import { IconExternalLink } from '@tabler/icons-react';
import SmartBackButton from '@/app/components/ui/smart.back.button';
import TiendaDetailShell from '@/app/components/ui/tienda.detail.shell';
import Markdown from '@/app/components/ui/page.markdown';
import ContentMediaPreview from '@/app/components/ui/content.media.preview';
import PublicLinkActions from '@/app/components/ui/public.link.actions';
import ProductItemActions from '../product.item.actions';
import { findProduct } from '../products.find';
import { strapiClient } from '@/markket/api.strapi';
import type { Store } from '@/markket/store';

type TiendaProductItemPageProps = {
  params: Promise<{ storeSlug: string; itemId: string }>;
};

export async function generateMetadata({ params }: TiendaProductItemPageProps): Promise<Metadata> {
  const { storeSlug, itemId } = await params;
  const product = await findProduct(itemId, storeSlug);

  return {
    title: product?.Name || 'Product Detail',
  };
}

export default async function TiendaProductItemPage({ params }: TiendaProductItemPageProps) {
  const { storeSlug, itemId } = await params;
  const [product, storeResponse] = await Promise.all([
    findProduct(itemId, storeSlug),
    strapiClient.getStore(storeSlug),
  ]);

  if (!product) notFound();

  const store = storeResponse?.data?.[0] as Store | undefined;
  const editorId = product.documentId || product.slug;
  const itemDocumentId = product.documentId || itemId;
  const storeRef = store?.documentId || store?.slug || storeSlug;
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
            isPublished={String((product as any).status || '').toLowerCase() === 'published' || Boolean(product.publishedAt)}
          />
        </>
      }
    >
      <Stack gap="md">
        <Text c="dimmed">{product.SEO?.metaDescription || 'No summary yet.'}</Text>

        <ContentMediaPreview
          storeRef={storeRef}
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

        <Divider label={
          <Badge variant="dot" color="gray" size="sm">Description</Badge>
        } labelPosition="left" />

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
