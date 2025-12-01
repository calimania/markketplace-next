import { Stack, LoadingOverlay, Container } from '@mantine/core';
import { strapiClient } from '@/markket/api.strapi';
import { SubscribeForm } from '@/app/components/ui/subscribe.form';
import { Store } from '@/markket/store';
import { Suspense } from 'react';
import { IconMail } from '@tabler/icons-react';
import { generateSEOMetadata } from '@/markket/metadata';
import { Page } from "@/markket/page";
import { Metadata } from "next";
import StorePageHeader from '@/app/components/ui/store.page.header';

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
  const title = page?.Title || `Newsletter`;
  const image = page?.SEO?.socialImage || store?.SEO?.socialImage;

  return (
    <Container size="lg" py="xl">
      <StorePageHeader
        icon={<IconMail size={48} />}
        title={title}
        description="Stay updated with our latest news, products, and exclusive offers."
        page={page}
        backgroundImage={image?.url || store?.Cover?.url}
        iconColor="var(--mantine-color-orange-6)"
      />

      <Stack gap="xl">
        <Suspense fallback={<LoadingOverlay visible />}>
          <SubscribeForm
            store={store as Store}
          />
        </Suspense>
      </Stack>
    </Container>
  );
};
