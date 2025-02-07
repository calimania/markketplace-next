import { Container, Title, Text, Button, Group, Stack } from "@mantine/core";
import { strapiClient } from '@/markket/api';
import { Store } from "@/markket/store.d";

import StoreGrid from '@/app/components/stores/grid';

const defaultLogo = `https://markketplace.nyc3.digitaloceanspaces.com/uploads/1a82697eaeeb5b376d6983f452d1bf3d.png`;

const getCollection = async (key: string) => {
  let collection: Store[] = [];

  if (key === 'stores') {
    const response = await strapiClient.getStores({ page: 1, pageSize: 30 }, { filter: '', sort: 'title' });
    collection = response?.data as Store[] || [];
  }

  console.log({ collection })

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
export default async function AnyPage({ params }: { params: Promise<{ slug: string }> }) {
  const a = await strapiClient.getStore();
  const page_slug = (await params).slug;

  const collection = await getCollection(page_slug);
  const store = a.data[0];

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

        {page_slug === 'stores' && (
          <StoreGrid stores={collection.data} />
        )}

      </Stack>
    </Container>
  );
}
