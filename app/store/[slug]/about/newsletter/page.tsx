import { Stack, Title, LoadingOverlay } from '@mantine/core';
import { strapiClient } from '@/markket/api';
import { BlocksRenderer, type BlocksContent } from '@strapi/blocks-react-renderer';
import { SubscribeForm } from '@/app/components/ui/subscribe.form';
import { Store } from '@/markket/store';
import { Suspense } from 'react';


interface NewsletterPageProps {
  params: Promise<{  slug: string }>;
}

export default async function Page({ params }: NewsletterPageProps) {
  const { slug } = await params;

  // @TODO: page data not returning when using this method?
  const { data: [page]} = await strapiClient.getPage('newsletter', slug);
  // @TODO: this page is calling this endpoint twice, in a higher up component already
  const { data: [store] } = await strapiClient.getStore(slug);

  const title = page?.Title || `Newsletter for ${store?.SEO?.metaTitle}`;

  const image = page?.SEO?.socialImage || store?.SEO?.socialImage;

  return (
    <Stack gap="xl">
      <Title>{title}</Title>
      <BlocksRenderer content={page?.Content as BlocksContent || []} />
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
