'use client';

import { useEffect, useState } from 'react';
import { Badge, Button, Divider, Paper, Stack, Text } from '@mantine/core';
import TiendaItemSkeleton from '@/app/components/ui/tienda.item.skeleton';
import SmartBackButton from '@/app/components/ui/smart.back.button';
import TiendaDetailShell from '@/app/components/ui/tienda.detail.shell';
import BlogItemActions from './blog.item.actions';
import { findBlogArticle } from './blog.find';
import ContentMediaPreview from '@/app/components/ui/content.media.preview';
import PageContent from '@/app/components/ui/page.content';
import PublicLinkActions from '@/app/components/ui/public.link.actions';
import { getPublishLabel, isPublished } from '@/markket/helpers.publication';
import { readTiendaAuthToken } from '../content.find';
import type { Article } from '@/markket/article';

type TiendaBlogItemPageClientProps = {
  storeSlug: string;
  itemId: string;
};

export default function TiendaBlogItemPageClient({ storeSlug, itemId }: TiendaBlogItemPageClientProps) {
  const [post, setPost] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const token = readTiendaAuthToken();

    if (!token) {
      setError('Authentication required to view this article.');
      setLoading(false);
      return;
    }

    const loadPost = async () => {
      try {
        const article = await findBlogArticle(itemId, storeSlug, token);
        if (!active) return;

        if (!article) {
          setError('This article could not be found.');
          return;
        }

        setPost(article);
      } catch (err) {
        console.error('Tienda blog item load error', err);
        if (!active) return;
        setError('Unable to load the article. Please refresh.');
      } finally {
        if (active) setLoading(false);
      }
    };

    loadPost();

    return () => {
      active = false;
    };
  }, [itemId, storeSlug]);

  if (loading) return <TiendaItemSkeleton />;

  if (error || !post) {
    return (
      <TiendaDetailShell
        breadcrumbs={[
          { label: 'Tienda', href: '/tienda' },
          { label: storeSlug, href: `/tienda/${storeSlug}` },
          { label: 'Blog', href: `/tienda/${storeSlug}/blog` },
          { label: itemId },
        ]}
        title="Article not found"
        routePath={`/tienda/${storeSlug}/blog/${itemId}`}
      >
        <Stack gap="md">
          <Text c="dimmed">{error || 'This article does not exist.'}</Text>
          <Button component="a" href={`/tienda/${storeSlug}/blog`} variant="outline">
            Back to articles
          </Button>
        </Stack>
      </TiendaDetailShell>
    );
  }

  const editorId = post.documentId || post.slug || itemId;
  const postIsPublished = isPublished(post);
  const itemDocumentId = post.documentId || itemId;
  const storeRef = storeSlug;
  const refreshPostAfterUpload = async () => {
    const token = readTiendaAuthToken();
    if (!token) return;

    try {
      const nextPost = await findBlogArticle(itemId, storeSlug, token);
      if (nextPost) {
        setPost(nextPost);
      }
    } catch (err) {
      console.error('Tienda blog media refresh error', err);
    }
  };

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
            publishLabel={getPublishLabel(post)}
          />
        </>
      }
    >
      <Stack gap="md">
        <Text c="dimmed">{post.SEO?.metaDescription || 'No summary yet.'}</Text>

        <ContentMediaPreview
          storeRef={storeRef}
          contentType="article"
          itemDocumentId={itemDocumentId}
          onUpload={() => {
            void refreshPostAfterUpload();
          }}
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

        <Divider
          label={<Badge variant="dot" color="gray" size="sm">Story preview</Badge>}
          labelPosition="left"
        />

        <Paper
          withBorder
          p="lg"
          radius="md"
          style={{ background: 'var(--mantine-color-gray-0, #fafafa)' }}
        >
          {post.Content?.length ? (
            <PageContent params={{ post }} />
          ) : (
            <Text c="dimmed" size="sm" ta="center" py="xl">
                Nothing here yet.{' '}
              <a href={`/tienda/${storeSlug}/blog/${editorId}/edit`} style={{ color: 'inherit', textDecoration: 'underline' }}>
                  Add your first section →
              </a>
            </Text>
          )}
        </Paper>

        <PublicLinkActions
          path={`/${storeSlug}/blog/${post.slug || post.documentId || itemId}`}
          openLabel="View live article"
          isPublicEnabled={postIsPublished}
        />
      </Stack>
    </TiendaDetailShell>
  );
}
