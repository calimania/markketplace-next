import type { Metadata } from 'next';
import { Button } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import { strapiClient } from '@/markket/api.strapi';
import type { Album } from '@/markket/album';
import TiendaListShell from '@/app/components/ui/tienda.list.shell';
import AlbumListClient from './album-list.client';

type TiendaAlbumsPageProps = {
  params: Promise<{ storeSlug: string }>;
};

export const metadata: Metadata = {
  title: 'Albums',
};

export default async function TiendaAlbumsPage({ params }: TiendaAlbumsPageProps) {
  const { storeSlug } = await params;

  const albumsResponse = await strapiClient.fetch<Album>({
    contentType: 'albums',
    filters: { store: { slug: { $eq: storeSlug } } },
    populate: 'cover,SEO',
    sort: 'createdAt:desc',
    paginate: { page: 1, pageSize: 50 },
    includeAuth: true,
  });

  const albums = (albumsResponse?.data || []) as Album[];

  return (
    <TiendaListShell
      breadcrumbs={[
        { label: 'Tienda', href: '/tienda' },
        { label: storeSlug, href: `/tienda/${storeSlug}` },
        { label: 'Albums' },
      ]}
      title="Albums"
      subtitle={`Albums for ${storeSlug}`}
      routePath={`/tienda/${storeSlug}/albums`}
      sectionTitle="Albums"
      tone="albums"
      actions={
        <Button component="a" href={`/tienda/${storeSlug}/albums/new`} leftSection={<IconPlus size={16} />}>
          New Album
        </Button>
      }
    >
      <AlbumListClient storeSlug={storeSlug} initialAlbums={albums} />
    </TiendaListShell>
  );
}
