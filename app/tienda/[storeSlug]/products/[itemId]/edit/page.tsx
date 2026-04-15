import { notFound } from 'next/navigation';
import TiendaDetailShell from '@/app/components/ui/tienda.detail.shell';
import { strapiClient } from '@/markket/api.strapi';
import type { Product } from '@/markket/product';
import ProductEditorForm from '../../product.editor.form';

type TiendaProductEditProps = {
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

export default async function TiendaProductEditPage({ params }: TiendaProductEditProps) {
  const { storeSlug, itemId } = await params;
  const product = await findProduct(itemId, storeSlug);

  if (!product) notFound();

  return (
    <TiendaDetailShell
      breadcrumbs={[
        { label: 'Tienda', href: '/tienda' },
        { label: storeSlug, href: `/tienda/${storeSlug}` },
        { label: 'Products', href: `/tienda/${storeSlug}/products` },
        { label: product.documentId || product.slug || itemId, href: `/tienda/${storeSlug}/products/${product.documentId || product.slug || itemId}` },
        { label: 'Edit' },
      ]}
      title={`Edit: ${product.Name || 'Product'}`}
      routePath={`/tienda/${storeSlug}/products/${product.documentId || product.slug || itemId}/edit`}
    >
      <ProductEditorForm
        storeSlug={storeSlug}
        mode="edit"
        itemDocumentId={product.documentId || itemId}
        initial={{
          name: product.Name,
          slug: product.slug,
          description: product.Description || '',
          seoTitle: product.SEO?.metaTitle,
          seoDescription: product.SEO?.metaDescription,
        }}
      />
    </TiendaDetailShell>
  );
}
