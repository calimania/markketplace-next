import { Container, Title, Text, Group, Stack } from "@mantine/core";
import { strapiClient } from '@/markket/api';
import { Store } from "@/markket/store.d";
import { Article } from "@/markket/article.d";

import StoreGrid from '@/app/components/stores/grid';
import DocsGrid from '@/app/components/docs/grid';

const defaultLogo = `https://markketplace.nyc3.digitaloceanspaces.com/uploads/1a82697eaeeb5b376d6983f452d1bf3d.png`;

import { generateSEOMetadata } from '@/markket/metadata';
import { Page } from "@/markket/page";
import { Metadata } from "next";
import PageContent from "../components/ui/page.content";

interface AnyPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: AnyPageProps): Promise<Metadata> {
  const { slug } = await params;

  let response;
  if (slug == 'docs') {
    response = await strapiClient.getPage('blog');
  }

  if (slug == 'stores') {
    response = await strapiClient.getPage('stores');
  }

  const page = response?.data?.[0] as Page;

  return generateSEOMetadata({
    slug,
    entity: {
      url: `/${slug}`,
      SEO: page?.SEO,
    },
    type: 'article',
  });
};

const getCollection = async (key: string) => {
  let collection: Store[] = [];

  if (key === 'stores') {
    const response = await strapiClient.getStores({ page: 1, pageSize: 30 }, { filter: '', sort: 'title' });
    collection = response?.data as Store[] || [];
  }

  if (key === 'docs') {
    const response = await strapiClient.getPosts({ page: 1, pageSize: 30 }, { filter: '', sort: 'createdAt:desc' });
    collection = response?.data as Store[] || [];
  }

  console.log({ collection: collection.length, key });

  return {
    data: collection || [],
    key
  };
};

/**
 * Displays a page or collection matching the slug
 *
 * @param {Object} props - The props object
 * @returns
 */
export default async function AnyPage({ params }: AnyPageProps) {
  const { slug } = await params;
  const a = await strapiClient.getStore();

  const collection = await getCollection(slug);
  const store = a.data[0];

  let page;
  if (slug == 'stores') {
    const response = await strapiClient.getPage('stores');
    page = response?.data?.[0] as Page;
  }

  return (
    <Container size="lg" className="py-20">
      <Stack gap="xl">
        {/* Hero Section */}
        <div className="text-center">
          <img
            src={store?.Logo?.url || defaultLogo}
            alt={store?.SEO?.metaTitle || 'Markket Logo'}
            width={200}
            height={200}
            className="mx-auto mb-8"
          />
          <Title className="text-4xl md:text-5xl mb-4">
            Welcome to {store?.SEO?.metaTitle || 'Markket'}
          </Title>
          <Text size="xl" c="dimmed" className="mx-auto mb-8">
            {store?.SEO?.metaDescription || 'eCommerce'}
          </Text>
        </div>

        {/* Links Section */}
        <Group justify="center" gap="md" wrap="wrap">

        </Group>

        {slug === 'stores' && (
          <StoreGrid stores={collection.data as Store[]} />
        )}

        {slug === 'docs' && (
          <>
            <Title order={2} className="text-center mb-8">
              Documentation & Articles
            </Title>
            <DocsGrid posts={collection.data as unknown as Article[]} />
          </>
        )}
        <PageContent params={{ page }} />
      </Stack>
    </Container>
  );
}
