import { Container, Title, Text, Stack } from "@mantine/core";
import { strapiClient } from '@/markket/api.strapi';
import { Store } from "@/markket/store.d";
import StoreGrid from '@/app/components/stores/grid';
import { generateSEOMetadata } from '@/markket/metadata';
import { Page } from "@/markket/page";
import { Metadata } from "next";
import PageContent from "../components/ui/page.content";

const defaultLogo = `https://markketplace.nyc3.digitaloceanspaces.com/uploads/1a82697eaeeb5b376d6983f452d1bf3d.png`;

export async function generateMetadata(): Promise<Metadata> {
  const response = await strapiClient.getPage('stores');
  const page = response?.data?.[0] as Page;

  return generateSEOMetadata({
    slug: 'stores',
    entity: {
      url: '/stores',
      SEO: page?.SEO,
      Title: page?.Title,
    },
    defaultTitle: 'Stores',
    type: 'website',
  });
}

export default async function StoresPage() {
  const storeResponse = await strapiClient.getStore();
  const store = storeResponse.data[0];

  const response = await strapiClient.getStores(
    { page: 1, pageSize: 30 },
    { filter: '', sort: 'title' }
  );

  const stores = response?.data?.sort((a, b) =>
    a.title.localeCompare(b.title)
  ) as Store[] || [];

  const pageResponse = await strapiClient.getPage('stores');
  const page = pageResponse?.data?.[0] as Page;

  return (
    <Container size="xl" className="py-20">
      <Stack gap="xl">
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
            {page?.SEO?.metaDescription || store?.SEO?.metaDescription || 'Discover amazing stores'}
          </Text>
        </div>

        <StoreGrid stores={stores} />
        <PageContent params={{ page }} />
      </Stack>
    </Container>
  );
}
