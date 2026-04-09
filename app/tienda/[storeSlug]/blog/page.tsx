import { notFound } from 'next/navigation';
import { Button } from '@mantine/core';
import { IconListSearch, IconPlus } from '@tabler/icons-react';
import { strapiClient } from '@/markket/api.strapi';
import type { Article } from '@/markket/article';
import type { Store } from '@/markket/store';
import NavTable from '@/app/components/ui/nav.table';
import TiendaListShell from '@/app/components/ui/tienda.list.shell';

type TiendaBlogPageProps = {
  params: Promise<{ storeSlug: string }>;
};

export default async function TiendaBlogPage({ params }: TiendaBlogPageProps) {
  const { storeSlug } = await params;

  const [storeResponse, postsResponse] = await Promise.all([
    strapiClient.getStore(storeSlug),
    strapiClient.getPosts({ page: 1, pageSize: 50 }, { sort: 'createdAt:desc' }, storeSlug),
  ]);

  const store = storeResponse?.data?.[0] as Store | undefined;
  if (!store) notFound();

  const posts = (postsResponse?.data || []) as Article[];
  const formatDate = (value?: string) => (value ? new Date(value).toLocaleDateString() : 'No date');

  return (
    <TiendaListShell
      breadcrumbs={[
        { label: 'Tienda', href: '/tienda' },
        { label: store.slug, href: `/tienda/${store.slug}` },
        { label: 'Blog' },
      ]}
      title="Blog"
      subtitle={`Articles for ${store.title}`}
      routePath={`/tienda/${store.slug}/blog`}
      sectionTitle="Articles"
      actions={
        <>
            <Button
              component="a"
              href={`/tienda/${store.slug}/articles`}
              variant="default"
              leftSection={<IconListSearch size={16} />}
            >
              Open Editor
            </Button>
            <Button component="a" href={`/tienda/${store.slug}/articles/new`} leftSection={<IconPlus size={16} />}>
              New Article
            </Button>
        </>
      }
    >
      <NavTable
        emptyText="No articles yet."
        items={posts.map((post) => ({
          key: post.documentId || post.slug,
          title: post.Title || 'Untitled article',
          subtitle: `${formatDate(post.createdAt)} · ${post.slug}`,
          href: `/tienda/${store.slug}/blog/${post.documentId || post.slug}`,
          icon: 'article',
        }))}
      />
    </TiendaListShell>
  );
}