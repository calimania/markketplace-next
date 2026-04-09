import { notFound } from 'next/navigation';
import { Button } from '@mantine/core';
import { IconListSearch, IconPlus } from '@tabler/icons-react';
import { strapiClient } from '@/markket/api.strapi';
import type { Page } from '@/markket/page';
import type { Store } from '@/markket/store';
import NavTable from '@/app/components/ui/nav.table';
import TiendaListShell from '@/app/components/ui/tienda.list.shell';

type TiendaAboutPageProps = {
  params: Promise<{ storeSlug: string }>;
};

export default async function TiendaAboutPage({ params }: TiendaAboutPageProps) {
  const { storeSlug } = await params;

  const [storeResponse, pagesResponse] = await Promise.all([
    strapiClient.getStore(storeSlug),
    strapiClient.getPages(storeSlug),
  ]);

  const store = storeResponse?.data?.[0] as Store | undefined;
  if (!store) notFound();

  const pages = (pagesResponse?.data || []) as Page[];
  const formatDate = (value?: string) => (value ? new Date(value).toLocaleDateString() : 'No date');

  return (
    <TiendaListShell
      breadcrumbs={[
        { label: 'Tienda', href: '/tienda' },
        { label: store.slug, href: `/tienda/${store.slug}` },
        { label: 'Pages' },
      ]}
      title="Pages"
      subtitle={`About/content pages for ${store.title}`}
      routePath={`/tienda/${store.slug}/about`}
      sectionTitle="Pages"
      actions={
        <>
            <Button
              component="a"
              href={`/tienda/${store.slug}/pages`}
              variant="default"
              leftSection={<IconListSearch size={16} />}
            >
              Open Editor
            </Button>
            <Button component="a" href={`/tienda/${store.slug}/pages/new`} leftSection={<IconPlus size={16} />}>
              New Page
            </Button>
        </>
      }
    >
      <NavTable
        emptyText="No pages yet."
        items={pages.map((page) => ({
          key: page.documentId || page.slug,
          title: page.Title || 'Untitled page',
          subtitle: `${formatDate(page.createdAt)} · ${page.slug}`,
          href: `/tienda/${store.slug}/about/${page.documentId || page.slug}`,
          icon: 'page',
        }))}
      />
    </TiendaListShell>
  );
}