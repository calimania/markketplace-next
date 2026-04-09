import { notFound } from 'next/navigation';
import { Button, Text } from '@mantine/core';
import { strapiClient } from '@/markket/api.strapi';
import type { Page } from '@/markket/page';
import SmartBackButton from '@/app/components/ui/smart.back.button';
import TiendaDetailShell from '@/app/components/ui/tienda.detail.shell';

type TiendaAboutItemPageProps = {
  params: Promise<{ storeSlug: string; itemId: string }>;
};

async function findPage(itemId: string, storeSlug: string) {
  const byDocumentId = await strapiClient.fetch<Page>({
    contentType: 'pages',
    filters: {
      documentId: itemId,
      store: {
        slug: {
          $eq: storeSlug,
        },
      },
    },
    populate: 'SEO.socialImage,store',
    paginate: { page: 1, pageSize: 1 },
  });

  if (byDocumentId?.data?.[0]) return byDocumentId.data[0] as Page;

  const bySlug = await strapiClient.getPage(itemId, storeSlug);
  return bySlug?.data?.[0] as Page | undefined;
}

export default async function TiendaAboutItemPage({ params }: TiendaAboutItemPageProps) {
  const { storeSlug, itemId } = await params;
  const page = await findPage(itemId, storeSlug);

  if (!page) notFound();

  const editorId = page.documentId || page.slug;

  return (
    <TiendaDetailShell
      breadcrumbs={[
        { label: 'Tienda', href: '/tienda' },
        { label: storeSlug, href: `/tienda/${storeSlug}` },
        { label: 'Pages', href: `/tienda/${storeSlug}/about` },
        { label: page.slug || itemId },
      ]}
      title={page.Title || 'Untitled page'}
      routePath={`/tienda/${storeSlug}/about/${page.slug || itemId}`}
      actions={
        <>
            <SmartBackButton fallbackHref={`/tienda/${storeSlug}/about`} />
            <Button component="a" href={`/tienda/${storeSlug}/pages/edit/${editorId}`}>
              Edit
            </Button>
        </>
      }
    >
      <Text>{page.SEO?.metaDescription || 'No summary yet.'}</Text>
    </TiendaDetailShell>
  );
}