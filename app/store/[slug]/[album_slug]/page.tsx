import { strapiClient } from "@/markket/api.strapi";
import { Album } from "@/markket/album";
import { Title } from "@mantine/core";
import { notFound } from "next/navigation";

import { generateSEOMetadata } from '@/markket/metadata';

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

type AlbumPageProps = {
  params: Promise<{
    slug: string;
    album_slug: string
  }>;
};


const AlbumPage = async ({params}: AlbumPageProps) => {
  const { slug, album_slug } = await params;

  const { data } = await strapiClient.getAlbum(album_slug, slug);
  const { data: [store] } = await strapiClient.getStore(slug);

  const album = data[0] as Album;

  if (!album || !store) {
    return notFound();
  }

  return (
    <div>
      <Title order={1}>{album.title}</Title>
      <p>Store: {store?.title}</p>
      <p>Album Slug: {album.slug}</p>
    </div>
  );
};

export default AlbumPage;
