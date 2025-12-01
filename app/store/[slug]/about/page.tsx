import { Container, LoadingOverlay } from '@mantine/core';
import { strapiClient } from '@/markket/api.strapi';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { IconInfoCircle } from '@tabler/icons-react';
import { PageList } from '@/app/components/ui/pages.list';
import { generateSEOMetadata } from '@/markket/metadata';
import { Page } from "@/markket/page";
import { Metadata } from "next";
import StorePageHeader from '@/app/components/ui/store.page.header';

interface AboutPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: AboutPageProps): Promise<Metadata> {
  const { slug } = await params;

  const response = await strapiClient.getPage('about', slug);
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

  const systemPages = ['home', 'about', 'blog', 'products', 'events'];

  const customPages = pagesResponse?.data
    ?.filter(p => !systemPages.includes(p.slug))
    .sort((a, b) => a.Title.localeCompare(b.Title)) || [];

  const image = aboutPage?.SEO?.socialImage || store?.SEO?.socialImage;

  return (
    <Container size="lg" py="xl">
      <StorePageHeader
        icon={<IconInfoCircle size={48} />}
        title={aboutPage?.Title || `About ${store.SEO?.metaTitle || store?.title}`}
        description={aboutPage?.SEO?.metaDescription || store.SEO?.metaDescription}
        page={aboutPage}
        backgroundImage={image?.url || store?.Cover?.url}
        iconColor="var(--mantine-color-teal-6)"
      />

      <Suspense fallback={<LoadingOverlay visible />}>
        <PageList pages={customPages} storeSlug={slug} />
      </Suspense>
    </Container>
  );
};
