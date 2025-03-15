import { strapiClient } from '@/markket/api.strapi';
import { Album } from '@/markket/album';
import { generateSEOMetadata } from '@/markket/metadata';
import TracksPage from '@/app/components/ui/album.track.page';
import { Store } from '@/markket/store.d';
import { notFound } from 'next/navigation';

interface PageProps {
  params: Promise<{ slug: string, album_slug: string , track_slug: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { slug, album_slug, track_slug } = await params;

  const response = await strapiClient.getAlbum(album_slug, slug);
  const collection = response?.data?.[0] as Album;
  const track = collection?.tracks?.find((track) => track.slug === track_slug);

  return generateSEOMetadata({
    slug,
    entity: {
      url: `/store/${slug}/${album_slug}/${track_slug}`,
      SEO: track?.SEO|| collection?.SEO,
    },
    type: 'article',
  });
};

export default async function TrackPage({ params }: PageProps) {
  const { slug, album_slug , track_slug} = await params;
  const storeResponse = await strapiClient.getStore(slug);
  const response = await strapiClient.getAlbum(album_slug, slug);
  const album = response?.data?.[0] as Album;
  const store = storeResponse?.data?.[0] as Store;
  const track = album?.tracks?.find((track) => track.slug === track_slug);

  if (!album || !store || !track) {
    notFound();
  }

  return <TracksPage album={{
    ...album,
    tracks: album.tracks?.filter((t) => t.slug !== track_slug),
  }} store={store} track={track} />;
};
