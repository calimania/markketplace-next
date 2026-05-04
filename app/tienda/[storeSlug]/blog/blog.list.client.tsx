'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import NavTable from '@/app/components/ui/nav.table';
import type { Article } from '@/markket/article';
import { tiendaClient } from '@/markket/api.tienda';
import { TIENDA_CONTENT_LIST_QUERY } from '../content.list.queries';
import { isPublished } from '@/markket/helpers.publication';

type BlogListClientProps = {
  storeSlug: string;
  initialPosts: Article[];
};

function readAuthToken() {
  if (typeof window === 'undefined') return '';

  try {
    const raw = localStorage.getItem('markket.auth');
    const parsed = raw ? JSON.parse(raw) : null;
    return parsed?.jwt || '';
  } catch {
    return '';
  }
}

function itemKey(post: Partial<Article>) {
  return String(post.documentId || post.id || post.slug || post.Title || Math.random());
}

function sortByRecent(items: Article[]) {
  return [...items].sort((a, b) => {
    const aTime = new Date(a.updatedAt || a.createdAt || 0).getTime();
    const bTime = new Date(b.updatedAt || b.createdAt || 0).getTime();
    return bTime - aTime;
  });
}

export default function BlogListClient({ storeSlug, initialPosts }: BlogListClientProps) {
  const [posts, setPosts] = useState<Article[]>(sortByRecent(initialPosts || []));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = readAuthToken();
    if (!token) return;

    const loadAllContent = async () => {
      try {
        const response = await tiendaClient.listContent(storeSlug, 'article', {
          token,
          query: TIENDA_CONTENT_LIST_QUERY.article,
        });

        const merged = new Map<string, Article>();
        const allItems = Array.isArray(response?.data) ? (response.data as Article[]) : (Array.isArray(response) ? (response as Article[]) : []);

        if (allItems.length > 0) {
          allItems.forEach((post) => {
            merged.set(itemKey(post), post);
          });
          setPosts(sortByRecent(Array.from(merged.values())));
        }
      } catch (error) {
        console.error('[BlogListClient] Failed to load posts:', error);
      }
      setLoading(false);
    };

    loadAllContent();
  }, [storeSlug]);

  const formatDate = (value?: string) => (value ? new Date(value).toLocaleDateString() : 'No date');

  const items = useMemo(
    () =>
      posts.map((post) => {
        const key = itemKey(post);
        const statusText = isPublished(post) ? 'Published' : 'Draft';

        return {
          key,
          title: post.Title || 'Untitled article',
          publishedAt: post.publishedAt,
          subtitle: `${statusText} · ${formatDate(post.updatedAt || post.createdAt)} · ${post.documentId || post.slug || 'no-id'}`,
          href: `/tienda/${storeSlug}/blog/${post.documentId || post.slug}`,
          icon: 'article' as const,
        };
      }),
    [posts, storeSlug],
  );

  return <NavTable emptyText="No articles yet." items={items} loading={loading} />;
}
