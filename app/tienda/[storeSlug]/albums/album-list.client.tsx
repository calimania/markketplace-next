'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import NavTable from '@/app/components/ui/nav.table';
import type { Album } from '@/markket/album';
import { tiendaClient } from '@/markket/api.tienda';
import { isPublished } from '@/markket/helpers.publication';

type AlbumListClientProps = {
  storeSlug: string;
  initialAlbums: Album[];
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

function itemKey(album: Partial<Album>) {
  return String(album.documentId || album.id || album.slug || album.title || Math.random());
}

function sortByRecent(items: Album[]) {
  return [...items].sort((a, b) => {
    const aTime = new Date(a.updatedAt || a.createdAt || 0).getTime();
    const bTime = new Date(b.updatedAt || b.createdAt || 0).getTime();
    return bTime - aTime;
  });
}

export default function AlbumListClient({ storeSlug, initialAlbums }: AlbumListClientProps) {
  const [albums, setAlbums] = useState<Album[]>(sortByRecent(initialAlbums || []));
  const fetchedStoreSlugRef = useRef<string | null>(null);

  useEffect(() => {
    const token = readAuthToken();
    if (!token) return;

    if (fetchedStoreSlugRef.current === storeSlug) {
      return;
    }

    fetchedStoreSlugRef.current = storeSlug;

    const loadAllContent = async () => {
      try {
        const response = await tiendaClient.listContent(storeSlug, 'album', {
          token,
          query: { sort: 'updatedAt:desc', pageSize: 200 },
        });

        const allItems = Array.isArray(response?.data) ? (response.data as Album[]) : (Array.isArray(response) ? (response as Album[]) : []);

        if (allItems.length > 0) {
          const merged = new Map<string, Album>();
          allItems.forEach((album) => {
            merged.set(itemKey(album), album);
          });
          setAlbums(sortByRecent(Array.from(merged.values())));
        }
      } catch (error) {
        fetchedStoreSlugRef.current = null;
        console.error('[AlbumListClient] Failed to load albums:', error);
      }
    };

    loadAllContent();
  }, [storeSlug]);

  const formatDate = (value?: string) => (value ? new Date(value).toLocaleDateString() : 'No date');

  const items = useMemo(
    () =>
      albums.map((album) => {
        const key = itemKey(album);
        const statusText = isPublished(album) ? 'Published' : 'Draft';

        return {
          key,
          title: album.title || 'Untitled album',
          subtitle: `${statusText} · ${formatDate(album.updatedAt || album.createdAt)} · ${album.documentId || album.slug || 'no-id'}`,
          href: `/tienda/${storeSlug}/albums/${album.documentId || album.slug}`,
          icon: 'album' as const,
        };
      }),
    [albums, storeSlug],
  );

  return <NavTable emptyText="No albums yet." items={items} />;
}
