import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Badge, Button, Divider, Paper, Stack, Text } from '@mantine/core';
import { IconPhoto } from '@tabler/icons-react';
import SmartBackButton from '@/app/components/ui/smart.back.button';
import TiendaDetailShell from '@/app/components/ui/tienda.detail.shell';
import Markdown from '@/app/components/ui/page.markdown';
import ContentMediaPreview from '@/app/components/ui/content.media.preview';
import PublicLinkActions from '@/app/components/ui/public.link.actions';
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
          <Button component="a" href={`/tienda/${storeSlug}/products/${editorId}/edit`}>
            Edit
          </Button>
        </>
      }
    >
      <Stack gap="md">
        <Text c="dimmed">{product.SEO?.metaDescription || 'No summary yet.'}</Text>

        <ContentMediaPreview
          storeRef={storeRef}
          contentType="product"
          itemDocumentId={itemDocumentId}
          studioHref={`/tienda/${storeSlug}/snapshot`}
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
      </Stack>
    </TiendaDetailShell>
  );
}
