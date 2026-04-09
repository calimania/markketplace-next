import { Button } from '@mantine/core';
import { IconListSearch, IconPlus } from '@tabler/icons-react';
import { strapiClient } from '@/markket/api.strapi';
import type { Article } from '@/markket/article';
import NavTable from '@/app/components/ui/nav.table';
import TiendaListShell from '@/app/components/ui/tienda.list.shell';

type TiendaBlogPageProps = {
  params: Promise<{ storeSlug: string }>;
};

export default async function TiendaBlogPage({ params }: TiendaBlogPageProps) {
  const { storeSlug } = await params;

  const postsResponse = await strapiClient.getPosts({ page: 1, pageSize: 50 }, { sort: 'createdAt:desc' }, storeSlug);

  const posts = (postsResponse?.data || []) as Article[];
  const formatDate = (value?: string) => (value ? new Date(value).toLocaleDateString() : 'No date');

  return (
    <TiendaListShell
      breadcrumbs={[
        { label: 'Tienda', href: '/tienda' },
        { label: storeSlug, href: `/tienda/${storeSlug}` },
        { label: 'Blog' },
      ]}
      title="Blog"
      subtitle={`Articles for ${storeSlug}`}
      routePath={`/tienda/${storeSlug}/blog`}
      sectionTitle="Articles"
      actions={
        <>
            <Button
              component="a"
              href={`/tienda/${storeSlug}/articles`}
              variant="default"
              leftSection={<IconListSearch size={16} />}
            >
              Open Editor
            </Button>
            <Button component="a" href={`/tienda/${storeSlug}/articles/new`} leftSection={<IconPlus size={16} />}>
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
          href: `/tienda/${storeSlug}/blog/${post.documentId || post.slug}`,
          icon: 'article',
        }))}
      />
    </TiendaListShell>
  );
}