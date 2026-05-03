'use client';

import { useEffect, useState } from 'react';
import { Badge, Button, Center, Divider, Paper, Stack, Text } from '@mantine/core';
import SmartBackButton from '@/app/components/ui/smart.back.button';
import TiendaDetailShell from '@/app/components/ui/tienda.detail.shell';
import ContentMediaPreview from '@/app/components/ui/content.media.preview';
import PublicLinkActions from '@/app/components/ui/public.link.actions';
import AlbumItemActions from './album.item.actions';
import { findAlbum } from './albums.find';
import { isPublished } from '@/markket/helpers.publication';
import { readTiendaAuthToken } from '../content.find';
import type { Album } from '@/markket/album';

type TiendaAlbumItemPageClientProps = {
  storeSlug: string;
  itemId: string;
};

export default function TiendaAlbumItemPageClient({ storeSlug, itemId }: TiendaAlbumItemPageClientProps) {
  const [album, setAlbum] = useState<Album | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const token = readTiendaAuthToken();

    if (!token) {
      setError('Authentication required to view this album.');
      setLoading(false);
      return;
    }

    const loadAlbum = async () => {
      try {
        const data = await findAlbum(itemId, storeSlug, token);
        if (!active) return;

        if (!data) {
          setError('This album could not be found.');
          return;
        }

        setAlbum(data);
      } catch (err) {
        console.error('Tienda album item load error', err);
        if (!active) return;
        setError('Unable to load the album. Please refresh.');
      } finally {
        if (active) setLoading(false);
      }
    };

    loadAlbum();

    return () => {
      active = false;
    };
  }, [itemId, storeSlug]);

  if (loading) {
    return (
      <Center py="xl">
        <Text c="dimmed">Loading album preview…</Text>
      </Center>
    );
  }

  if (error || !album) {
    return (
      <TiendaDetailShell
        breadcrumbs={[
          { label: 'Tienda', href: '/tienda' },
          { label: storeSlug, href: `/tienda/${storeSlug}` },
          { label: 'Albums', href: `/tienda/${storeSlug}/albums` },
          { label: itemId },
        ]}
        title="Album not found"
        routePath={`/tienda/${storeSlug}/albums/${itemId}`}
      >
        <Stack gap="md">
          <Text c="dimmed">{error || 'This album does not exist.'}</Text>
          <Button component="a" href={`/tienda/${storeSlug}/albums`} variant="outline">
            Back to albums
          </Button>
        </Stack>
      </TiendaDetailShell>
    );
  }

  const editorId = album.documentId || album.slug || itemId;
  const itemDocumentId = album.documentId || itemId;

  return (
    <TiendaDetailShell
      breadcrumbs={[
        { label: 'Tienda', href: '/tienda' },
        { label: storeSlug, href: `/tienda/${storeSlug}` },
        { label: 'Albums', href: `/tienda/${storeSlug}/albums` },
        { label: album.slug || itemId },
      ]}
      title={album.title || 'Untitled album'}
      routePath={`/tienda/${storeSlug}/albums/${album.slug || itemId}`}
      actions={
        <>
          <SmartBackButton fallbackHref={`/tienda/${storeSlug}/albums`} />
          <AlbumItemActions
            storeSlug={storeSlug}
            itemDocumentId={itemDocumentId}
            editorId={editorId}
            isPublished={isPublished(album)}
          />
        </>
      }
    >
      <Stack gap="md">
        <Text c="dimmed">{album.SEO?.metaDescription || album.description || 'No description yet.'}</Text>

        <ContentMediaPreview
          storeRef={storeSlug}
          contentType="album"
          itemDocumentId={itemDocumentId}
          slots={[
            {
              label: 'Cover',
              field: 'cover',
              src: album.cover?.url,
              alt: album.cover?.alternativeText || album.title,
            },
            {
              label: 'Social Image',
              field: 'SEO.socialImage',
              src: album.SEO?.socialImage?.url,
              alt: album.SEO?.socialImage?.alternativeText || album.title,
            },
          ]}
        />

        {album.tracks && album.tracks.length > 0 ? (
          <>
            <Divider
              label={<Badge variant="dot" color="gray" size="sm">Tracks ({album.tracks.length})</Badge>}
              labelPosition="left"
            />

            <Paper withBorder p="md" radius="md">
              <Stack gap="xs">
                {album.tracks.map((track, index) => (
                  <Text key={track.documentId || track.id || index} size="sm">
                    {index + 1}. {track.title || 'Untitled track'}
                  </Text>
                ))}
              </Stack>
            </Paper>
          </>
        ) : (
          <Paper withBorder p="lg" radius="md" bg="var(--mantine-color-gray-0)">
            <Text c="dimmed" ta="center" size="sm">No tracks yet.</Text>
          </Paper>
        )}

        <PublicLinkActions
          path={`/${storeSlug}/${album.slug || album.documentId || itemId}`}
          openLabel="Open public album"
        />
      </Stack>
    </TiendaDetailShell>
  );
}
