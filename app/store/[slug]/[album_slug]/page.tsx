import { strapiClient } from '@/markket/api.strapi';
import { Album } from '@/markket/album';
import { generateSEOMetadata } from '@/markket/metadata';
import AlbumsPage from '@/app/components/ui/albums.page';
import { Store } from '@/markket/store.d';
import { notFound } from 'next/navigation';

export async function generateMetadata({ params }: any) {
  const { slug, album_slug } = await params;

  const response = await strapiClient.getAlbum(album_slug, slug);
  const collection = response?.data?.[0] as Album;

  return generateSEOMetadata({
    slug,
    entity: {
      url: `/store/${slug}/${album_slug}`,
      SEO: collection?.SEO,
    },
    type: 'article',
  });
};

interface PageProps {
  params: Promise<{ slug: string, album_slug: string }>;
}

export default async function AlbumPage({ params }: PageProps) {
  const { slug, album_slug } = await params;
  const storeResponse = await strapiClient.getStore(slug);
  const response = await strapiClient.getAlbum(album_slug, slug);
  const album = response?.data?.[0] as Album;
  const store = storeResponse?.data?.[0] as Store;

  if (!album || !store) {
    notFound();
  }

  return <AlbumsPage album={album} store={store} />;
};
