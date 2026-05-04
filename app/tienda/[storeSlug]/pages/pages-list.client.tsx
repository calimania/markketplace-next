'use client';

import { useEffect, useMemo, useState } from 'react';
import NavTable from '@/app/components/ui/nav.table';
import type { Page } from '@/markket/page.d';
import { tiendaClient } from '@/markket/api.tienda';
import { TIENDA_CONTENT_LIST_QUERY } from '../content.list.queries';
import { isPublished } from '@/markket/helpers.publication';

type PagesListClientProps = {
  storeSlug: string;
  initialPages: Page[];
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

function itemKey(page: Partial<Page>) {
  return String(page.documentId || page.id || page.slug || page.Title || Math.random());
}

function sortByRecent(items: Page[]) {
  return [...items].sort((a, b) => {
    const aTime = new Date(a.updatedAt || a.createdAt || 0).getTime();
    const bTime = new Date(b.updatedAt || b.createdAt || 0).getTime();
    return bTime - aTime;
  });
}

export default function PagesListClient({ storeSlug, initialPages }: PagesListClientProps) {
  const [pages, setPages] = useState<Page[]>(sortByRecent(initialPages || []));

  useEffect(() => {
    const token = readAuthToken();
    if (!token) {
      return;
    }

    const loadAllContent = async () => {
      try {
        const response = await tiendaClient.listContent(storeSlug, 'page', {
          token,
          query: TIENDA_CONTENT_LIST_QUERY.page,
        });

        const merged = new Map<string, Page>();
        const allItems = Array.isArray(response?.data) ? (response.data as Page[]) : (Array.isArray(response) ? (response as Page[]) : []);

        if (allItems.length > 0) {
          allItems.forEach((page) => {
            merged.set(itemKey(page), page);
          });
          setPages(sortByRecent(Array.from(merged.values())));
        }
      } catch (error) {
        console.error('[PagesListClient] Failed to load pages:', error);
      }
    };

    loadAllContent();
  }, [storeSlug]);

  const formatDate = (value?: string) => (value ? new Date(value).toLocaleDateString() : 'No date');

  const items = useMemo(
    () =>
      pages.map((page) => {
        const key = itemKey(page);
        const statusText = isPublished(page) ? 'Published' : 'Draft';

        return {
          key,
          title: page.Title || 'Untitled page',
          subtitle: `${statusText} · ${formatDate(page.updatedAt || page.createdAt)} · ${page.documentId || page.slug || 'no-id'}`,
          href: `/tienda/${storeSlug}/pages/${page.documentId || page.slug}`,
          icon: 'page' as const,
        };
      }),
    [pages, storeSlug],
  );

  return <NavTable emptyText="No pages yet." items={items} />;
}
