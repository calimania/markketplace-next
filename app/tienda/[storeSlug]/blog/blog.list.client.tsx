'use client';

import { useEffect, useMemo, useState, useCallback } from 'react';
import { SegmentedControl, Stack } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import NavTable from '@/app/components/ui/nav.table';
import type { Article } from '@/markket/article';
import { tiendaClient } from '@/markket/api.tienda';
import { TIENDA_CONTENT_LIST_QUERY } from '../content.list.queries';
import { isPublished } from '@/markket/helpers.publication';
import { readTiendaAuthToken, parseTiendaResponse, getTiendaItemKey } from '@/markket/helpers.tienda';

type BlogListClientProps = {
  storeSlug: string;
  initialPosts: Article[];
};

function sortByRecent(items: Article[]) {
  return [...items].sort((a, b) => {
    const aTime = new Date(a.updatedAt || a.createdAt || 0).getTime();
    const bTime = new Date(b.updatedAt || b.createdAt || 0).getTime();
    return bTime - aTime;
  });
}

export default function BlogListClient({ storeSlug, initialPosts }: BlogListClientProps) {
  const [posts, setPosts] = useState<Article[]>(sortByRecent(initialPosts || []));
  const [loading, setLoading] = useState((initialPosts || []).length === 0);
  const [sortMode, setSortMode] = useState<'recent' | 'alpha' | 'alpha-desc'>('recent');

  useEffect(() => {
    let isMounted = true;

    const token = readTiendaAuthToken();
    if (!token) {
      setLoading(false);
      return;
    }

    const loadAllContent = async () => {
      try {
        const response = await tiendaClient.listContent(storeSlug, 'article', {
          token,
          query: TIENDA_CONTENT_LIST_QUERY.article,
        });

        if (!isMounted) return;

        const allItems = parseTiendaResponse<Article>(response);

        if (allItems && allItems.length > 0) {
          setPosts(sortByRecent(allItems));
        } else {
          setPosts([]);
        }
      } catch (error) {
        console.error('[BlogListClient] Failed to load posts:', error);
        if (isMounted) setPosts([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadAllContent();

    return () => {
      isMounted = false;
    };
  }, [storeSlug]);

  const formatDate = (value?: string) => (value ? new Date(value).toLocaleDateString() : 'No date');

  const handlePublishToggle = useCallback(async (navItem: { key: string }) => {
    const token = readTiendaAuthToken();
    if (!token) return;
    const post = posts.find(p => getTiendaItemKey(p) === navItem.key);
    if (!post) return;
    const published = isPublished(post);
    const data = published ? { unpublishNow: true, saveAsDraft: true } : { publishNow: true };
    try {
      await tiendaClient.updateContent(storeSlug, 'article', post.documentId || post.slug || '', data, { token });
      setPosts(prev => prev.map(p =>
        getTiendaItemKey(p) === navItem.key
          ? { ...p, publishedAt: published ? null : new Date().toISOString() }
          : p
      ));
      notifications.show({
        title: published ? 'Now in draft' : 'Now live',
        message: published ? 'Your article is hidden from the public site.' : 'Your article is now visible on your live site.',
        color: published ? 'yellow' : 'green',
      });
    } catch {
      notifications.show({ title: 'Could not save', message: 'Please try publishing again.', color: 'red' });
    }
  }, [posts, storeSlug]);

  const sortedPosts = useMemo(() => {
    if (sortMode === 'alpha') {
      return [...posts].sort((a, b) => (a.Title || '').localeCompare(b.Title || ''));
    }

    if (sortMode === 'alpha-desc') {
      return [...posts].sort((a, b) => (b.Title || '').localeCompare(a.Title || ''));
    }

    return sortByRecent(posts);
  }, [posts, sortMode]);

  const items = useMemo(
    () =>
      sortedPosts.map((post) => {
        const key = getTiendaItemKey(post);
        const statusText = isPublished(post) ? 'Published' : 'Draft';

        return {
          key,
          title: post.Title || 'Untitled article',
          publishedAt: post.publishedAt,
          subtitle: `${statusText} · ${formatDate(post.updatedAt || post.createdAt)} · ${post.documentId || post.slug || 'no-id'}`,
          href: `/tienda/${storeSlug}/blog/${post.documentId || post.slug}`,
          previewHref: isPublished(post) && post.slug ? `/${storeSlug}/blog/${post.slug}` : undefined,
          icon: 'article' as const,
          status: isPublished(post) ? 'published' as const : 'draft' as const,
        };
      }),
    [sortedPosts, storeSlug],
  );

  return (
    <Stack gap="xs">
      <SegmentedControl
        size="xs"
        value={sortMode}
        onChange={(value) => setSortMode(value as 'recent' | 'alpha' | 'alpha-desc')}
        data={[
          { label: 'Recent', value: 'recent' },
          { label: 'A-Z', value: 'alpha' },
          { label: 'Z-A', value: 'alpha-desc' },
        ]}
      />
      <NavTable
        emptyText="No articles yet. Publish your first story to get started."
        items={items}
        loading={loading}
        onPublishToggle={handlePublishToggle}
        searchPlaceholder="Search articles by title"
      />
    </Stack>
  );
}
