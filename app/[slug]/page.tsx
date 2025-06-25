import { Container, Title, Text, Group, Stack } from "@mantine/core";
import { strapiClient } from '@/markket/api.strapi';
import { Store } from "@/markket/store.d";
import { Article } from "@/markket/article.d";

import StoreGrid from '@/app/components/stores/grid';
import DocsGrid from '@/app/components/docs/grid';
import { notFound } from 'next/navigation';

const defaultLogo = `https://markketplace.nyc3.digitaloceanspaces.com/uploads/1a82697eaeeb5b376d6983f452d1bf3d.png`;

import { generateSEOMetadata } from '@/markket/metadata';
import { Page } from "@/markket/page";
import { Metadata } from "next";
import PageContent from "../components/ui/page.content";
import { redirect } from 'next/navigation';

interface AnyPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: AnyPageProps): Promise<Metadata> {
  const { slug } = await params;

  let response;
  switch (slug) {
    case 'docs':
      response = await strapiClient.getPage('blog');
      break;
    case 'stores':
      response = await strapiClient.getPage('stores');
      break;
    default:
      const storeResponse = await strapiClient.getStore(slug);
      if (!storeResponse?.data?.length) {
        return notFound();
      }
      response = storeResponse;
  }

  const page = response?.data?.[0] as Page | Store;

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
    collection = response?.data?.sort((a, b) =>
      a.title.localeCompare(b.title)
    ) as Store[] || [];
  }

  if (key === 'docs') {
    const response = await strapiClient.getPosts({ page: 1, pageSize: 30 }, { filter: '', sort: 'createdAt:desc' });
    collection = response?.data as Store[] || [];
  }

  console.log({ key, collection: collection.length, });

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

  if (!['home', 'docs', 'stores'].includes(slug)) {
    const storeResponse = await strapiClient.getStore(slug);

    if (!storeResponse?.data?.length) {
      return notFound();
    }

    /** Planning to use this for shorter urls - and future redirection to custom template | domain when setting present */
    return redirect(`/store/${slug}`);
  }

  const collection = await getCollection(slug);
  const store = a.data[0];

  let page;
  if (slug == 'stores') {
    const response = await strapiClient.getPage('stores');
    page = response?.data?.[0] as Page;
  }

  if (slug == 'docs') {
    const response = await strapiClient.getPage('blog');
    page = response?.data?.[0] as Page;
  }

  return (
    <Container size="xl" className="py-20">
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
            {page?.Title || `Stores at ${store.title}`}
          </Title>
          <Text size="xl" c="dimmed" className="mx-auto mb-8">
            {page?.SEO?.metaDescription || store?.SEO?.metaDescription || 'eCommerce'}
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
