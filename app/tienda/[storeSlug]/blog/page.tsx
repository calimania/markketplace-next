import type { Metadata } from 'next';
import { Button } from '@mantine/core';
import { IconListSearch, IconPlus } from '@tabler/icons-react';
import type { Article } from '@/markket/article';
import TiendaListShell from '@/app/components/ui/tienda.list.shell';
import BlogListClient from './blog.list.client';

type TiendaBlogPageProps = {
  params: Promise<{ storeSlug: string }>;
};

export const metadata: Metadata = {
  title: 'Articles',
};

export default async function TiendaBlogPage({ params }: TiendaBlogPageProps) {
  const { storeSlug } = await params;

  const posts: Article[] = [];

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
      tone="blog"
      actions={
        <>
            <Button
              component="a"
              href={`/tienda/${storeSlug}/blog`}
              variant="default"
              leftSection={<IconListSearch size={16} />}
            >
              Open Editor
            </Button>
            <Button component="a" href={`/tienda/${storeSlug}/blog/new`} leftSection={<IconPlus size={16} />}>
              New Article
            </Button>
        </>
      }
    >
      <BlogListClient storeSlug={storeSlug} initialPosts={posts} />
    </TiendaListShell>
  );
}