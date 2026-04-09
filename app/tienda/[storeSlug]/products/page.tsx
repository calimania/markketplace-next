import { notFound } from 'next/navigation';
import { Button } from '@mantine/core';
import { IconListSearch, IconPlus } from '@tabler/icons-react';
import { strapiClient } from '@/markket/api.strapi';
import type { Product } from '@/markket/product';
import type { Store } from '@/markket/store';
import NavTable from '@/app/components/ui/nav.table';
import TiendaListShell from '@/app/components/ui/tienda.list.shell';

type TiendaProductsPageProps = {
  params: Promise<{ storeSlug: string }>;
};

export default async function TiendaProductsPage({ params }: TiendaProductsPageProps) {
  const { storeSlug } = await params;

  const [storeResponse, productsResponse] = await Promise.all([
    strapiClient.getStore(storeSlug),
    strapiClient.getProducts({ page: 1, pageSize: 100 }, { filter: '', sort: 'updatedAt:desc' }, storeSlug),
  ]);

  const store = storeResponse?.data?.[0] as Store | undefined;
  if (!store) notFound();

  const products = (productsResponse?.data || []) as Product[];
  const formatDate = (value?: string) => (value ? new Date(value).toLocaleDateString() : 'No date');

  return (
    <TiendaListShell
      breadcrumbs={[
        { label: 'Tienda', href: '/tienda' },
        { label: store.slug, href: `/tienda/${store.slug}` },
        { label: 'Products' },
      ]}
      title="Products"
      subtitle={`Catalog for ${store.title}`}
      routePath={`/tienda/${store.slug}/products`}
      sectionTitle="Products"
      actions={
        <>
          <Button
            component="a"
            href={`/dashboard/products?store=${encodeURIComponent(store.slug)}`}
            variant="default"
            leftSection={<IconListSearch size={16} />}
          >
            Open Editor
          </Button>
          <Button component="a" href={`/tienda/${store.slug}/products/new`} leftSection={<IconPlus size={16} />}>
            New Product
          </Button>
        </>
      }
    >
      <NavTable
        emptyText="No products yet."
        items={products.map((product) => ({
          key: product.documentId || product.slug,
          title: product.Name || 'Untitled product',
          subtitle: `${formatDate(product.updatedAt)} · ${product.slug}`,
          href: `/tienda/${store.slug}/products/${product.documentId || product.slug}`,
          icon: 'product',
        }))}
      />
    </TiendaListShell>
  );
}
