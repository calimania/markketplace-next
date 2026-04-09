import { notFound } from 'next/navigation';
import { Button, Text } from '@mantine/core';
import { strapiClient } from '@/markket/api.strapi';
import type { Product } from '@/markket/product';
import SmartBackButton from '@/app/components/ui/smart.back.button';
import TiendaDetailShell from '@/app/components/ui/tienda.detail.shell';

type TiendaProductItemPageProps = {
  params: Promise<{ storeSlug: string; itemId: string }>;
};

async function findProduct(itemId: string, storeSlug: string) {
  const byDocumentId = await strapiClient.fetch<Product>({
    contentType: 'products',
    filters: {
      documentId: itemId,
      stores: {
        slug: {
          $eq: storeSlug,
        },
      },
    },
    populate: 'SEO.socialImage,Thumbnail,Slides,PRICES,stores,extras',
    paginate: { page: 1, pageSize: 1 },
  });

  if (byDocumentId?.data?.[0]) return byDocumentId.data[0] as Product;

  const bySlug = await strapiClient.getProduct(itemId, storeSlug);
  return bySlug?.data?.[0] as Product | undefined;
}

export default async function TiendaProductItemPage({ params }: TiendaProductItemPageProps) {
  const { storeSlug, itemId } = await params;
  const product = await findProduct(itemId, storeSlug);

  if (!product) notFound();

  const editorId = product.documentId || product.slug;

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
          <Button component="a" href={`/tienda/${storeSlug}/products/edit/${editorId}`}>
            Edit
          </Button>
        </>
      }
    >
      <Text>{product.Description || product.SEO?.metaDescription || 'No description yet.'}</Text>
    </TiendaDetailShell>
  );
}
