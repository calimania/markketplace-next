import { Container, Title, Text, LoadingOverlay } from '@mantine/core';
import { strapiClient } from '@/markket/api';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { PageList } from '@/app/components/ui/pages.list';

interface AboutPageProps {
  params: Promise<{ slug: string }>;
}

export default async function AboutPage({ params }: AboutPageProps) {
  const { slug } = await params;
  const storeResponse = await strapiClient.getStore(slug);
  const store = storeResponse?.data?.[0];

  if (!store) {
    notFound();
  }

  const aboutPageResponse = await strapiClient.getPage('about', slug);
  const aboutPage = aboutPageResponse?.data?.[0];

  const pagesResponse = await strapiClient.getPages(slug);
  const pages = pagesResponse?.data?.sort((a, b) =>
    a.Title.localeCompare(b.Title)
  ) || [];

  return (
    <Container size="lg" py="xl">
      <div className="text-center mb-12">
        <Title className="mb-4">{aboutPage?.Title || `About ${store.SEO?.metaTitle}`}</Title>
        <Text c="dimmed" size="lg">
          {aboutPage?.SEO?.metaDescription || store.SEO?.metaDescription}
        </Text>
      </div>
      <Suspense fallback={<LoadingOverlay visible />}>
        <PageList pages={pages} storeSlug={slug} />
      </Suspense>
    </Container>
  );
};
