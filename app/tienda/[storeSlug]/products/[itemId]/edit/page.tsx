import { notFound } from 'next/navigation';
import TiendaDetailShell from '@/app/components/ui/tienda.detail.shell';
import ProductEditorForm from '../../product.editor.form';
import { findProduct } from '../../products.find';

type TiendaProductEditProps = {
  params: Promise<{ storeSlug: string; itemId: string }>;
};

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
          sourceUrl: product.SEO?.metaUrl,
        }}
      />
    </TiendaDetailShell>
  );
}
