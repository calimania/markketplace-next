
import { strapiClient } from '@/markket/api.strapi';
import { notFound } from 'next/navigation';
import { Container, Title, Text, Stack, Paper, Box, Overlay } from "@mantine/core";
import PageContent from '@/app/components/ui/page.content';
import { StoreTabs } from '@/app/components/ui/store.tabs';
import Markdown from '@/app/components/ui/page.markdown';

import CollectionList from '@/app/components/ui/collection.list';

import { generateSEOMetadata } from '@/markket/metadata';
import { Store } from "@/markket/store.d";
import { Metadata } from "next";
import StoreHeaderButtons from '@/app/components/ui/store.header.buttons';
import { Collection } from '@/markket/collection';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;

  const response = await strapiClient.getStore(slug);
  const store = response?.data?.[0] as Store;

  return generateSEOMetadata({
    slug,
    entity: {
      url: `/${slug}`,
      SEO: store?.SEO,
      id: store?.id?.toString(),
    },
    type: 'article',
  });
};

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
    <div>
      <Box pos="relative" h={300} mb={50}>
        <Box
          style={{
            backgroundImage: `url(${store.Cover?.url || store?.SEO?.socialImage?.url || ''})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            height: '100%',
            width: '100%',
          }}
        >
          <Overlay
            gradient="linear-gradient(180deg, rgba(36, 85, 214, 0.2) 0%, rgba(36, 85, 214, 0.4) 100%)"
            opacity={0.6}
            zIndex={1}
          />
        </Box>

        <Paper
          pos="absolute"
          left="50%"
          style={{ transform: 'translate(-50%, 50%)' }}
          bottom={0}
          shadow="xl"
          p="md"
          withBorder
          radius="md"
          bg="white"
          className="z-10"
        >
          {store?.Logo?.url && (
            <img
              src={store.Logo.url}
              alt={store.SEO?.metaTitle}
              width={150}
              height={150}
              className="rounded-md object-contain"
            />
          )}
        </Paper>
      </Box>

      <Container size="lg" className="pb-20">
        <Stack gap="xl">
          <div className="text-center pt-12">
            <Title className="text-4xl md:text-5xl mb-4">
              {store?.title || store?.SEO?.metaTitle}
            </Title>

            <StoreHeaderButtons store={store} />

            {store?.Description ? (
              <Markdown content={store.Description} />
            ) : (
              <Text size="xl" c="dimmed" className="mx-auto mb-8">
                {store?.SEO?.metaDescription}
              </Text>
            )}
          </div>
          <PageContent params={{ page: homePage }} />
          <StoreTabs urls={store?.URLS} />
          <CollectionList collections={homePage?.collections as Collection[]} store_slug={store.slug} />
        </Stack>
      </Container>
    </div>
  );
};
