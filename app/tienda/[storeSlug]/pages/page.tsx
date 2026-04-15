import type { Metadata } from 'next';
import { Button } from '@mantine/core';
import { IconListSearch, IconPlus } from '@tabler/icons-react';
import { strapiClient } from '@/markket/api.strapi';
import type { Page } from '@/markket/page.d';
import TiendaListShell from '@/app/components/ui/tienda.list.shell';
import PagesListClient from './pages-list.client';

type TiendaPagesPageProps = {
  params: Promise<{ storeSlug: string }>;
};

export const metadata: Metadata = {
  title: 'Pages',
};

export default async function TiendaPagesPage({ params }: TiendaPagesPageProps) {
  const { storeSlug } = await params;

  const pagesResponse = await strapiClient.getPages(storeSlug);
  const pages = (pagesResponse?.data || []) as Page[];

  return (
    <TiendaListShell
      breadcrumbs={[
        { label: 'Tienda', href: '/tienda' },
        { label: storeSlug, href: `/tienda/${storeSlug}` },
        { label: 'Pages' },
      ]}
      title="Pages"
      subtitle={`Pages for ${storeSlug}`}
      routePath={`/tienda/${storeSlug}/pages`}
      sectionTitle="Pages"
      actions={
        <>
          <Button
            component="a"
            href={`/tienda/${storeSlug}/pages`}
            variant="default"
            leftSection={<IconListSearch size={16} />}
          >
            View All
          </Button>
          <Button component="a" href={`/tienda/${storeSlug}/pages/new`} leftSection={<IconPlus size={16} />}>
            New Page
          </Button>
        </>
      }
    >
      <PagesListClient storeSlug={storeSlug} initialPages={pages} />
    </TiendaListShell>
  );
}
