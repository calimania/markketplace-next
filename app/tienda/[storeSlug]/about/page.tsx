import { Button } from '@mantine/core';
import { IconListSearch, IconPlus } from '@tabler/icons-react';
import { strapiClient } from '@/markket/api.strapi';
import { resolvePagePreviewHref } from '@/markket/helpers.preview';
import { isPublished } from '@/markket/helpers.publication';
import type { Page } from '@/markket/page';
import NavTable from '@/app/components/ui/nav.table';
import TiendaListShell from '@/app/components/ui/tienda.list.shell';

type TiendaAboutPageProps = {
  params: Promise<{ storeSlug: string }>;
};

export default async function TiendaAboutPage({ params }: TiendaAboutPageProps) {
  const { storeSlug } = await params;

  const pagesResponse = await strapiClient.getPages(storeSlug, true);

  const pages = ((pagesResponse?.data || []) as Page[]);
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
            href={`/${storeSlug}/about`}
            variant="default"
            leftSection={<IconListSearch size={16} />}
            target="_blank"
          >
            View live page
          </Button>
          <Button component="a" href={`/tienda/${storeSlug}/pages/new`} leftSection={<IconPlus size={16} />}>
            New Page
          </Button>
        </>
      }
    >
      <NavTable
        emptyText="No pages yet."
        searchPlaceholder="Search pages"
        items={pages.map((page) => ({
          key: page.documentId || page.slug,
          title: page.Title || 'Untitled page',
          subtitle: `${formatDate(page.createdAt)} · ${page.slug}`,
          href: `/tienda/${storeSlug}/about/${page.documentId || page.slug}`,
          previewHref: isPublished(page) && page.slug ? resolvePagePreviewHref(storeSlug, page.slug || '') : undefined,
          icon: 'page' as const,
        }))}
      />
    </TiendaListShell>
  );
}