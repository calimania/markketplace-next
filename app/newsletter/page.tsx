import { Paper, Container, LoadingOverlay, Stack, Title } from '@mantine/core';
import { strapiClient } from '@/markket/api.strapi';
import { SubscribeForm } from '@/app/components/ui/subscribe.form';
import { Store } from '@/markket/store';
import PageContent from '@/app/components/ui/page.content';
import { generateSEOMetadata } from '@/markket/metadata';
import { Page } from "@/markket/page";
import { Metadata } from "next";
import { Suspense } from 'react';

export async function generateMetadata(): Promise<Metadata> {
  const slug = 'newsletter';
  const response = await strapiClient.getPage(slug);
  const page = response?.data?.[0] as Page;

  const storeResponse = await strapiClient.getStore();
  const store = storeResponse?.data?.[0] as Store;

  return generateSEOMetadata({
    slug: store?.slug || 'markket',
    entity: {
      url: `/store/${store.slug}/about/newsletter`,
      SEO: page?.SEO,
      Title: page?.Title,
    },
    type: 'article',
    defaultTitle: 'Newsletter',
    defaultDescription: 'Subscribe to our newsletter for updates, stories, and exclusive content.',
    keywords: ['newsletter', 'subscribe', 'updates', 'stories'],
  });
};

export default async function NewsletterPage() {
  const { data: [page] } = await strapiClient.getPage('newsletter') || { data: [] };

  const { data: [store] } = await strapiClient.getStore();
  const title = page?.Title || `Newsletter for ${store?.SEO?.metaTitle}`;
  const image = page?.SEO?.socialImage || store?.SEO?.socialImage;

  return (
    <Container size={'640'}>
      <Stack gap="xl">
        <Title>{title}</Title>
        <PageContent params={{ page }} />
        <Suspense fallback={<LoadingOverlay visible />}>
        <SubscribeForm
            store={store as Store}
        />
          <div>
            {image && (
              <Paper withBorder p="xs">
                <img src={image.url} alt={page?.SEO?.metaTitle || store?.SEO?.metaTitle} />
              </Paper>
            )}
          </div>
        </Suspense>
      </Stack>
    </Container>
  );
};
