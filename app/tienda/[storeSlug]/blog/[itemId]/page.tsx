import { notFound } from 'next/navigation';
import { Button, Text } from '@mantine/core';
import { strapiClient } from '@/markket/api.strapi';
import type { Article } from '@/markket/article';
import SmartBackButton from '@/app/components/ui/smart.back.button';
import TiendaDetailShell from '@/app/components/ui/tienda.detail.shell';

type TiendaBlogItemPageProps = {
  params: Promise<{ storeSlug: string; itemId: string }>;
};

async function findPost(itemId: string, storeSlug: string) {
  const byDocumentId = await strapiClient.fetch<Article>({
    contentType: 'articles',
    filters: {
      documentId: itemId,
      store: {
        slug: {
          $eq: storeSlug,
        },
      },
    },
    populate: 'SEO.socialImage,Tags,cover,store',
    paginate: { page: 1, pageSize: 1 },
  });

  if (byDocumentId?.data?.[0]) return byDocumentId.data[0] as Article;

  const bySlug = await strapiClient.getPost(itemId, storeSlug);
  return bySlug?.data?.[0] as Article | undefined;
}

export default async function TiendaBlogItemPage({ params }: TiendaBlogItemPageProps) {
  const { storeSlug, itemId } = await params;
  const post = await findPost(itemId, storeSlug);

  if (!post) notFound();

  const editorId = post.documentId || post.slug;

  return (
    <TiendaDetailShell
      breadcrumbs={[
        { label: 'Tienda', href: '/tienda' },
        { label: storeSlug, href: `/tienda/${storeSlug}` },
        { label: 'Blog', href: `/tienda/${storeSlug}/blog` },
        { label: post.slug || itemId },
      ]}
      title={post.Title || 'Untitled article'}
      routePath={`/tienda/${storeSlug}/blog/${post.slug || itemId}`}
      actions={
        <>
            <SmartBackButton fallbackHref={`/tienda/${storeSlug}/blog`} />
            <Button component="a" href={`/tienda/${storeSlug}/articles/edit/${editorId}`}>
              Edit
            </Button>
        </>
      }
    >
      <Text>{post.SEO?.metaDescription || 'No summary yet.'}</Text>
    </TiendaDetailShell>
  );
}