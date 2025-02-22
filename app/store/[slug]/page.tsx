
import { strapiClient } from '@/markket/api';
import { notFound } from 'next/navigation';
import { Container, Title, Text, Stack, Group, Button } from "@mantine/core";
import { IconNews, IconShoppingBag, IconFiles } from '@tabler/icons-react';

import {
  BlocksRenderer,
  type BlocksContent,
} from "@strapi/blocks-react-renderer";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function StorePage({
  params
}: PageProps) {
  const { slug } = await params;
  const response = await strapiClient.getStore(slug);

  const pageQuery = await strapiClient.getPage('home', slug);

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

          <Group justify="center" gap="md">
            <Button
              component="a"
              href={`/store/${store.slug}/blog`}
              variant="light"
              leftSection={<IconNews size={20} />}
            >
              Blog
            </Button>
            <Button
              component="a"
              href={`/store/${store.slug}/products`}
              variant="light"
              leftSection={<IconShoppingBag size={20} />}
            >
              Products
            </Button>
            <Button
              component="a"
              href={`/store/${store.slug}/about`}
              variant="light"
              leftSection={<IconFiles size={20} />}
            >
              Pages
            </Button>
          </Group>
        </div>

        <section className="">
          <BlocksRenderer
            content={homePage?.Content as unknown as BlocksContent || ([] as BlocksContent)}
          />
        </section>
      </Stack>
    </Container>
  );
};
