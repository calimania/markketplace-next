'use client';

import { useEffect, useMemo, useState } from 'react';
import { SegmentedControl, Stack } from '@mantine/core';
import NavTable from '@/app/components/ui/nav.table';
import type { Page } from '@/markket/page.d';
import { tiendaClient } from '@/markket/api.tienda';
import { TIENDA_CONTENT_LIST_QUERY } from '../content.list.queries';
import { isPublished } from '@/markket/helpers.publication';
import { readTiendaAuthToken, parseTiendaResponse, getTiendaItemKey } from '@/markket/helpers.tienda';
import { resolvePagePreviewHref } from '@/markket/helpers.preview';

type PagesListClientProps = {
  storeSlug: string;
  initialPages: Page[];
};

function sortByRecent(items: Page[]) {
  return [...items].sort((a, b) => {
    const aTime = new Date(a.updatedAt || a.createdAt || 0).getTime();
    const bTime = new Date(b.updatedAt || b.createdAt || 0).getTime();
    return bTime - aTime;
  });
}

export default function PagesListClient({ storeSlug, initialPages }: PagesListClientProps) {
  const [pages, setPages] = useState<Page[]>(sortByRecent(initialPages || []));
  const [loading, setLoading] = useState((initialPages || []).length === 0);
  const [sortMode, setSortMode] = useState<'recent' | 'alpha' | 'alpha-desc'>('recent');

  useEffect(() => {
    const token = readTiendaAuthToken();
    if (!token) {
      setLoading(false);
      return;
    }

    const loadAllContent = async () => {
      try {
        const response = await tiendaClient.listContent(storeSlug, 'page', {
          token,
          query: TIENDA_CONTENT_LIST_QUERY.page,
        });

        const merged = new Map<string, Page>();
        const allItems = parseTiendaResponse<Page>(response) || [];

        if (allItems.length > 0) {
          allItems.forEach((page) => {
            merged.set(getTiendaItemKey(page), page);
          });
          setPages(sortByRecent(Array.from(merged.values())));
        } else {
          setPages([]);
        }
      } catch (error) {
        console.error('[PagesListClient] Failed to load pages:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAllContent();
  }, [storeSlug]);

  const formatDate = (value?: string) => (value ? new Date(value).toLocaleDateString() : 'No date');

  const sortedPages = useMemo(() => {
    if (sortMode === 'alpha') {
      return [...pages].sort((a, b) => (a.Title || '').localeCompare(b.Title || ''));
    }

    if (sortMode === 'alpha-desc') {
      return [...pages].sort((a, b) => (b.Title || '').localeCompare(a.Title || ''));
    }

    return sortByRecent(pages);
  }, [pages, sortMode]);

  const items = useMemo(
    () =>
      sortedPages.map((page) => {
        const key = getTiendaItemKey(page);
        const statusText = isPublished(page) ? 'Published' : 'Draft';

        return {
          key,
          title: page.Title || 'Untitled page',
          subtitle: `${statusText} · ${formatDate(page.updatedAt || page.createdAt)} · ${page.documentId || page.slug || 'no-id'}`,
          href: `/tienda/${storeSlug}/pages/${page.documentId || page.slug}`,
          previewHref: isPublished(page) && page.slug ? resolvePagePreviewHref(storeSlug, page.slug || '') : undefined,
          icon: 'page' as const,
        };
      }),
    [sortedPages, storeSlug],
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
        emptyText="No pages yet. Create your first page to start shaping your site."
        items={items}
        loading={loading}
        searchPlaceholder="Search pages by title"
      />
    </Stack>
  );
}
