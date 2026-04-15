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
import { strapiClient } from '@/markket/api.strapi';
import type { Store } from '@/markket/store';

type TiendaBlogItemPageProps = {
  params: Promise<{ storeSlug: string; itemId: string }>;
};

export async function generateMetadata({ params }: TiendaBlogItemPageProps): Promise<Metadata> {
  const { storeSlug, itemId } = await params;
  const post = await findBlogArticle(itemId, storeSlug);

  return {
    title: post?.Title || 'Article Detail',
  };
}

export default async function TiendaBlogItemPage({ params }: TiendaBlogItemPageProps) {
  const { storeSlug, itemId } = await params;
  const [post, storeResponse] = await Promise.all([
    findBlogArticle(itemId, storeSlug),
    strapiClient.getStore(storeSlug),
  ]);

  if (!post) notFound();

  const store = storeResponse?.data?.[0] as Store | undefined;
  const editorId = post.documentId || post.slug || itemId;
  const itemDocumentId = post.documentId || itemId;
  const storeRef = store?.documentId || store?.slug || storeSlug;

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
            isPublished={Boolean(post.publishedAt)}
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
          studioHref={`/tienda/${storeSlug}/snapshot`}
          slots={[
            {
              label: 'Cover / Social',
              field: 'SEO.socialImage',
              src: post.cover?.url || post.cover?.formats?.medium?.url,
              alt: post.Title,
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

        {/* public link */}
        <Text size="xs" c="dimmed">
          Public URL:{' '}
          <a
            href={`/${storeSlug}/blog/${post.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: 'inherit', textDecoration: 'underline' }}
          >
            /{storeSlug}/blog/{post.slug}
            <IconExternalLink size={11} />
          </a>
        </Text>
      </Stack>
    </TiendaDetailShell>
  );
}