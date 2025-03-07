
import { strapiClient } from '@/markket/api';
import { notFound } from 'next/navigation';
import { Container, Title, Text, Stack, } from "@mantine/core";
import PageContent from '@/app/components/ui/page.content';
import { StoreTabs } from '@/app/components/ui/store.tabs';
import Markdown from '@/app/components/ui/page.markdown';

import { generateSEOMetadata } from '@/markket/metadata';
import { Store } from "@/markket/store.d";
import { Metadata } from "next";
import StoreHeaderButtons from '@/app/components/ui/store.header.buttons';

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
    <Container size="lg" className="pb-20">
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
            {store?.title || store?.SEO?.metaTitle}
          </Title>

          <StoreHeaderButtons store={store} />

          {store?.Description ?
            <Markdown content={store.Description} /> :
            (<Text size="xl" c="dimmed" className="mx-auto mb-8">
              store?.SEO?.metaDescription</Text>)
          }
        </div>
        <PageContent params={{ page: homePage }} />
        <StoreTabs urls={store?.URLS} />
      </Stack>
    </Container>
  );
};
