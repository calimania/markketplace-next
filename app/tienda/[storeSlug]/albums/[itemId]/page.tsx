import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Badge, Divider, Paper, Stack, Text } from '@mantine/core';
import SmartBackButton from '@/app/components/ui/smart.back.button';
import TiendaDetailShell from '@/app/components/ui/tienda.detail.shell';
import ContentMediaPreview from '@/app/components/ui/content.media.preview';
import PublicLinkActions from '@/app/components/ui/public.link.actions';
import AlbumItemActions from '../album.item.actions';
import { findAlbum } from '../albums.find';
import { strapiClient } from '@/markket/api.strapi';
import type { Store } from '@/markket/store';

type TiendaAlbumItemPageProps = {
  params: Promise<{ storeSlug: string; itemId: string }>;
};

export async function generateMetadata({ params }: TiendaAlbumItemPageProps): Promise<Metadata> {
  const { storeSlug, itemId } = await params;
  const album = await findAlbum(itemId, storeSlug);

  return {
    title: album?.title || 'Album Detail',
  };
}

export default async function TiendaAlbumItemPage({ params }: TiendaAlbumItemPageProps) {
  const { storeSlug, itemId } = await params;
  const [album, storeResponse] = await Promise.all([
    findAlbum(itemId, storeSlug),
    strapiClient.getStore(storeSlug),
  ]);

  if (!album) notFound();

  const store = storeResponse?.data?.[0] as Store | undefined;
  const editorId = album.documentId || album.slug;
  const itemDocumentId = album.documentId || itemId;
  const storeRef = store?.documentId || store?.slug || storeSlug;

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
            isPublished={String((album as any).status || '').toLowerCase() === 'published' || Boolean(album.publishedAt)}
          />
        </>
      }
    >
      <Stack gap="md">
        <Text c="dimmed">{album.SEO?.metaDescription || album.description || 'No description yet.'}</Text>

        <ContentMediaPreview
          storeRef={storeRef}
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

        {album.tracks && album.tracks.length > 0 && (
          <>
            <Divider label={
              <Badge variant="dot" color="gray" size="sm">Tracks ({album.tracks.length})</Badge>
            } labelPosition="left" />

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
        )}

        {(!album.tracks || album.tracks.length === 0) && (
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
