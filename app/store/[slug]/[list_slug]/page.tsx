import { strapiClient } from "@/markket/api.strapi";
import { Album } from "@/markket/album";
import { Title } from "@mantine/core";
import { notFound } from "next/navigation";

import { generateSEOMetadata } from '@/markket/metadata';

export async function generateMetadata({ params }: any) {
  const { slug, list_slug } = await params;

  const response = await strapiClient.getAlbum(list_slug, slug);
  const collection = response?.data?.[0] as Album;

  return generateSEOMetadata({
    slug,
    entity: {
      url: `/store/${slug}/${list_slug}`,
      SEO: collection?.SEO,
    },
    type: 'article',
  });
};

type CollectionPageProps = {
  params: Promise<{
    slug: string;
    list_slug: string
  }>;
};


const ListPage = async ({params}: CollectionPageProps) => {
  const { slug, list_slug } = await params;

  const { data } = await strapiClient.getAlbum(list_slug, slug);
  const { data: [store] } = await strapiClient.getStore(slug);

  const list = data[0] as Album;

  if (!list || !store) {
    return notFound();
  }

  return (
    <div>
      <Title order={1}>{list.title}</Title>
      <p>Slug: {slug}</p>
      <p>Collection Slug: {list.slug}</p>
    </div>
  );
};

export default ListPage;
