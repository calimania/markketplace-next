import { Stack, Title, LoadingOverlay } from '@mantine/core';
import { strapiClient } from '@/markket/api';
import { SubscribeForm } from '@/app/components/ui/subscribe.form';
import { Store } from '@/markket/store';
import { Suspense } from 'react';
import PageContent from '@/app/components/ui/page.content';
import { generateSEOMetadata } from '@/markket/metadata';
import { Page } from "@/markket/page";
import { Metadata } from "next";

interface NewsletterPageProps {
  params: Promise<{  slug: string }>;
}

export async function generateMetadata({ params }: NewsletterPageProps): Promise<Metadata> {
  const { slug, } = await params;

  const response = await strapiClient.getPage('newsletter', slug);
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

export default async function NewsletterPage({ params }: NewsletterPageProps) {
  const { slug } = await params;
  const { data: [page] } = await strapiClient.getPage('newsletter', slug);
  const { data: [store] } = await strapiClient.getStore(slug);
  const title = page?.Title || `Newsletter for ${store?.SEO?.metaTitle}`;
  const image = page?.SEO?.socialImage || store?.SEO?.socialImage;

  return (
    <Stack gap="xl">
      <Title>{title}</Title>
      <PageContent params={{ page }} />
      <Suspense fallback={<LoadingOverlay visible />}>
        <SubscribeForm
          store={store as Store}
        />
        <div>
          {image && (
            <img src={image.url} alt={page?.SEO?.metaTitle || store?.SEO?.metaTitle} />
          )}
        </div>
      </Suspense>
    </Stack>
  );
};
