import TiendaDetailShell from '@/app/components/ui/tienda.detail.shell';
import ProductEditorForm from '../product.editor.form';

type TiendaProductNewProps = {
  params: Promise<{ storeSlug: string }>;
};

export default async function TiendaProductNewPage({ params }: TiendaProductNewProps) {
  const { storeSlug } = await params;

  return (
    <TiendaDetailShell
      breadcrumbs={[
        { label: 'Tienda', href: '/tienda' },
        { label: storeSlug, href: `/tienda/${storeSlug}` },
        { label: 'Products', href: `/tienda/${storeSlug}/products` },
        { label: 'New Product' },
      ]}
      title="New Product"
      routePath={`/tienda/${storeSlug}/products/new`}
    >
      <ProductEditorForm storeSlug={storeSlug} mode="new" />
    </TiendaDetailShell>
  );
}
