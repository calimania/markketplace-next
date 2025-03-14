import { strapiClient } from "@/markket/api.strapi";
import { Collection } from "@/markket/collection";
import { Title } from "@mantine/core";
import { notFound } from "next/navigation";

import { generateSEOMetadata } from '@/markket/metadata';

export async function generateMetadata({ params }: any) {
  const { slug, collection_slug } = await params;

  const response = await strapiClient.getCollection(collection_slug, slug);
  const collection = response?.data?.[0] as Collection;

  return generateSEOMetadata({
    slug,
    entity: {
      url: `/store/${slug}/${collection_slug}`,
      SEO: collection?.SEO,
    },
    type: 'article',
  });
};

type CollectionPageProps = {
  params: Promise<{
    slug: string;
    collection_slug: string
  }>;
};


const CollectionPage = async ({params}: CollectionPageProps) => {
  const { slug, collection_slug } = await params;

  const { data } = await strapiClient.getCollection(collection_slug, slug);

  const collection = data[0] as Collection;

  if (!collection) {
    notFound();
  }

  return (
    <div>
      <Title order={1}>{collection.title}</Title>
      <p>Slug: {slug}</p>
      <p>Collection Slug: {collection_slug}</p>
    </div>
  );
};

export default CollectionPage;
