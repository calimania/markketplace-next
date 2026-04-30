import type { Metadata } from 'next';
import { Button } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import type { Product } from '@/markket/product';
import TiendaListShell from '@/app/components/ui/tienda.list.shell';
import ProductListClient from './product-list.client';

type TiendaProductsPageProps = {
  params: Promise<{ storeSlug: string }>;
};

export const metadata: Metadata = {
  title: 'Products',
};

export default async function TiendaProductsPage({ params }: TiendaProductsPageProps) {
  const { storeSlug } = await params;

  const products: Product[] = [];

  return (
    <TiendaListShell
      breadcrumbs={[
        { label: 'Tienda', href: '/tienda' },
        { label: storeSlug, href: `/tienda/${storeSlug}` },
        { label: 'Products' },
      ]}
      title="Products"
      subtitle={`Catalog for ${storeSlug}`}
      routePath={`/tienda/${storeSlug}/products`}
      sectionTitle="Products"
      tone="products"
      actions={
        <>
          <Button component="a" href={`/tienda/${storeSlug}/products/new`} leftSection={<IconPlus size={16} />}>
            New Product
          </Button>
        </>
      }
    >
      <ProductListClient storeSlug={storeSlug} initialProducts={products} />
    </TiendaListShell>
  );
}
