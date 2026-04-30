import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Badge, Button, Divider, Paper, Stack, Text } from '@mantine/core';
import { IconEdit, IconExternalLink, IconPhoto } from '@tabler/icons-react';
import SmartBackButton from '@/app/components/ui/smart.back.button';
import TiendaDetailShell from '@/app/components/ui/tienda.detail.shell';
import BlogItemActions from '../blog.item.actions';
import { findBlogArticle } from '../blog.find';
import ContentMediaPreview from '@/app/components/ui/content.media.preview';
import PageContent from '@/app/components/ui/page.content';
import PublicLinkActions from '@/app/components/ui/public.link.actions';
import { isPublished } from '@/markket/helpers.publication';

type TiendaBlogItemPageProps = {
  params: Promise<{ storeSlug: string; itemId: string }>;
};

export const fetchCache = 'force-no-store';
export const revalidate = 0;

export async function generateMetadata({ params }: TiendaBlogItemPageProps): Promise<Metadata> {
  const { storeSlug, itemId } = await params;
  const post = await findBlogArticle(itemId, storeSlug);

  return {
    title: post?.Title || 'Article Detail',
  };
}

export default async function TiendaBlogItemPage({ params }: TiendaBlogItemPageProps) {
  const { storeSlug, itemId } = await params;
  const post = await findBlogArticle(itemId, storeSlug);

  if (!post) notFound();

  const editorId = post.documentId || post.slug || itemId;
  const itemDocumentId = post.documentId || itemId;
  const storeRef = storeSlug;

  return (
    <TiendaDetailShell
      breadcrumbs={[
        { label: 'Tienda', href: '/tienda' },
        { label: storeSlug, href: `/tienda/${storeSlug}` },
        { label: 'Blog', href: `/tienda/${storeSlug}/blog` },
        { label: post.documentId || post.slug || itemId },
      ]}
      title={post.Title || 'Untitled article'}
      routePath={`/tienda/${storeSlug}/blog/${post.documentId || post.slug || itemId}`}
      actions={
        <>
          <SmartBackButton fallbackHref={`/tienda/${storeSlug}/blog`} />
          <BlogItemActions
            storeSlug={storeSlug}
            itemDocumentId={itemDocumentId}
            editorId={editorId}
            isPublished={isPublished(post)}
          />
        </>
      }
    >
      <Stack gap="md">
        <Text c="dimmed">{post.SEO?.metaDescription || 'No summary yet.'}</Text>

        {/* Media thumbnails: cover + SEO social image */}
        <ContentMediaPreview
          storeRef={storeRef}
          contentType="article"
          itemDocumentId={itemDocumentId}
          slots={[
            {
              label: 'Cover',
              field: 'cover',
              src: post.cover?.url || post.cover?.formats?.medium?.url,
              alt: post.Title,
            },
            {
              label: 'Social',
              field: 'SEO.socialImage',
              src: post.SEO?.socialImage?.url,
              alt: post.SEO?.socialImage?.alternativeText || post.Title,
            },
          ]}
        />

        <Divider label={
          <Badge variant="dot" color="gray" size="sm">Content preview</Badge>
        } labelPosition="left" />

        <Paper
          withBorder
          p="lg"
          radius="md"
          style={{ background: 'var(--mantine-color-gray-0, #fafafa)', position: 'relative' }}
        >
          {/* edit shortcut */}
          <Button
            component="a"
            href={`/tienda/${storeSlug}/blog/${editorId}/edit`}
            size="xs"
            variant="light"
            leftSection={<IconEdit size={13} />}
            style={{ position: 'absolute', top: 12, right: 12 }}
          >
            Edit
          </Button>

          {post.Content?.length ? (
            <PageContent params={{ post }} />
          ) : (
            <Text c="dimmed" size="sm" ta="center" py="xl">
              No content yet.{' '}
              <a href={`/tienda/${storeSlug}/blog/${editorId}/edit`} style={{ color: 'inherit', textDecoration: 'underline' }}>
                Start editing →
              </a>
            </Text>
          )}
        </Paper>

        <PublicLinkActions
          path={`/${storeSlug}/blog/${post.slug || post.documentId || itemId}`}
          openLabel="Open public article"
        />
      </Stack>
    </TiendaDetailShell>
  );
}