'use client';

import { useEffect, useState } from 'react';
import { Badge, Button, Center, Divider, Paper, Stack, Text } from '@mantine/core';
import { IconEdit } from '@tabler/icons-react';
import SmartBackButton from '@/app/components/ui/smart.back.button';
import TiendaDetailShell from '@/app/components/ui/tienda.detail.shell';
import BlogItemActions from './blog.item.actions';
import { findBlogArticle } from './blog.find';
import ContentMediaPreview from '@/app/components/ui/content.media.preview';
import PageContent from '@/app/components/ui/page.content';
import PublicLinkActions from '@/app/components/ui/public.link.actions';
import { isPublished } from '@/markket/helpers.publication';
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

  if (loading) {
    return (
      <Center py="xl">
        <Text c="dimmed">Loading article preview…</Text>
      </Center>
    );
  }

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

        <Divider
          label={<Badge variant="dot" color="gray" size="sm">Content preview</Badge>}
          labelPosition="left"
        />

        <Paper
          withBorder
          p="lg"
          radius="md"
          style={{ background: 'var(--mantine-color-gray-0, #fafafa)', position: 'relative' }}
        >
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
