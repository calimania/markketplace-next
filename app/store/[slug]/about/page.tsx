import { Container, Title, Text, LoadingOverlay } from '@mantine/core';
import { strapiClient } from '@/markket/api';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { PageList } from '@/app/components/ui/pages.list';
import PageContent from '@/app/components/ui/page.content';
import { generateSEOMetadata } from '@/markket/metadata';
import { Page } from "@/markket/page";
import { Metadata } from "next";

interface AboutPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: AboutPageProps): Promise<Metadata> {
  const { slug } = await params;

  const response = await strapiClient.getPage('about');
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

  const image = aboutPage?.SEO?.socialImage || store?.SEO?.socialImage;


  return (
    <Container size="lg" py="xl">
      <div className="text-center mb-12">
        <Title className="mb-4">{aboutPage?.Title || `About ${store.SEO?.metaTitle}`}</Title>


        {aboutPage?.Content ?
          (<PageContent params={{ page: aboutPage }} />) :
          (
            <Text c="dimmed" size="lg">
              {aboutPage?.SEO?.metaDescription || store.SEO?.metaDescription}
            </Text>
          )}
      </div>
      <Suspense fallback={<LoadingOverlay visible />}>
        <PageList pages={pages.filter(p => !(p.slug == 'about')).sort((a, b) => a.Title.localeCompare(b.Title))} storeSlug={slug} />
        <div className='mt-10 mb-4'>
          {image && (
            <img src={image.url} alt={aboutPage?.SEO?.metaTitle || store?.SEO?.metaTitle} />
          )}
        </div>
      </Suspense>
    </Container>
  );
};
