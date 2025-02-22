import { Container, Title, Text, LoadingOverlay } from '@mantine/core';
import { strapiClient } from '@/markket/api';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { PageList } from '@/app/components/ui/pages.list';
import { BlocksRenderer, type BlocksContent } from '@strapi/blocks-react-renderer';

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

  const image = aboutPage?.SEO?.socialImage || store?.SEO?.socialImage;


  return (
    <Container size="lg" py="xl">
      <div className="text-center mb-12">
        <Title className="mb-4">{aboutPage?.Title || `About ${store.SEO?.metaTitle}`}</Title>


        {aboutPage?.Content ?
          (<BlocksRenderer content={aboutPage.Content as BlocksContent} />) :
          (

            <Text c="dimmed" size="lg">
              {aboutPage?.SEO?.metaDescription || store.SEO?.metaDescription}
            </Text>
          )}
      </div>
      <Suspense fallback={<LoadingOverlay visible />}>
        <PageList pages={pages.filter(p => !(p.slug == 'about'))} storeSlug={slug} />
        <div className='mt-10 mb-4'>
          {image && (
            <img src={image.url} alt={aboutPage?.SEO?.metaTitle || store?.SEO?.metaTitle} />
          )}
        </div>
      </Suspense>
    </Container>
  );
};
