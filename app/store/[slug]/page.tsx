import { Container, Title, Text, Stack, Group } from "@mantine/core";
import { strapiClient } from '@/markket/api';
import { notFound } from 'next/navigation';
import {
  BlocksRenderer,
  type BlocksContent,
} from "@strapi/blocks-react-renderer";

import { type LayoutProps } from './layout';

export default async function StorePage({
  params
}: LayoutProps) {
  const response = await strapiClient.getStore(params.slug);

  const pageQuery = await strapiClient.getPage('home', params.slug);

  const homePage = pageQuery?.data?.[0];


  const store = response?.data?.[0];


  if (!store) {
    notFound();
  }

  return (
    <Container size="lg" className="py-20">
      <Stack gap="xl">
        <div className="text-center">
          <img
            src={store.Logo?.url}
            alt={store.SEO?.metaTitle}
            width={200}
            height={200}
            className="mx-auto mb-8"
          />
          <Title className="text-4xl md:text-5xl mb-4">
            {store.SEO?.metaTitle}
          </Title>
          <Text size="xl" c="dimmed" className="mx-auto mb-8">
            {store.SEO?.metaDescription}
          </Text>
        </div>

        <section className="">
          <BlocksRenderer
            content={homePage?.Content || ([] as BlocksContent[])}
          />
        </section>

        {/* Products Section */}
        {store.Products?.length > 0 && (
          <div>
            <Title order={2} className="mb-4">Products</Title>
            {/* Add your ProductGrid component here */}
          </div>
        )}

        {/* Articles Section */}
        {store.Articles?.length > 0 && (
          <div>
            <Title order={2} className="mb-4">Latest Articles</Title>
            {/* Add your ArticlesGrid component here */}
          </div>
        )}
      </Stack>
    </Container>
  );
}