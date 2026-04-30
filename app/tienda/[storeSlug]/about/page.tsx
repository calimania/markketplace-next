import { Button } from '@mantine/core';
import { IconListSearch, IconPlus } from '@tabler/icons-react';
import { strapiClient } from '@/markket/api.strapi';
import type { Page } from '@/markket/page';
import NavTable from '@/app/components/ui/nav.table';
import TiendaListShell from '@/app/components/ui/tienda.list.shell';

type TiendaAboutPageProps = {
  params: Promise<{ storeSlug: string }>;
};

export default async function TiendaAboutPage({ params }: TiendaAboutPageProps) {
  const { storeSlug } = await params;

  const pagesResponse = await strapiClient.getPages(storeSlug);

  const pages = ((pagesResponse?.data || []) as Page[])
    .filter((page) => page.slug !== 'home');
  const formatDate = (value?: string) => (value ? new Date(value).toLocaleDateString() : 'No date');

  return (
    <TiendaListShell
      breadcrumbs={[
        { label: 'Tienda', href: '/tienda' },
        { label: storeSlug, href: `/tienda/${storeSlug}` },
        { label: 'Pages' },
      ]}
      title="Pages"
      subtitle={`About/content pages for ${storeSlug}`}
      routePath={`/tienda/${storeSlug}/about`}
      sectionTitle="Pages"
      tone="pages"
      actions={
        <>
            <Button
              component="a"
              href={`/tienda/${storeSlug}/pages`}
              variant="default"
              leftSection={<IconListSearch size={16} />}
            >
              Open Editor
            </Button>
            <Button component="a" href={`/tienda/${storeSlug}/pages/new`} leftSection={<IconPlus size={16} />}>
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
          href: `/tienda/${storeSlug}/about/${page.documentId || page.slug}`,
          icon: 'page',
        }))}
      />
    </TiendaListShell>
  );
}