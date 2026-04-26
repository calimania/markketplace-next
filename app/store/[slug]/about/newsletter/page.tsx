import { Stack, LoadingOverlay, Container, Paper, Text, Box } from '@mantine/core';
import { strapiClient } from '@/markket/api.strapi';
import { SubscribeForm } from '@/app/components/ui/subscribe.form';
import { Store } from '@/markket/store';
import { Suspense } from 'react';
import { IconMail } from '@tabler/icons-react';
import { generateSEOMetadata } from '@/markket/metadata';
import { Page } from "@/markket/page";
import { Metadata } from "next";
import PageContent from '@/app/components/ui/page.content';
import { markketColors } from '@/markket/colors.config';
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
      url: `/${slug}/about/newsletter`,
      SEO: page?.SEO,
      Title: page?.Title,
    },
    type: 'article',
    defaultTitle: 'Newsletter',
    defaultDescription: 'Subscribe to our newsletter for updates, stories, and exclusive content.',
    keywords: ['newsletter', 'subscribe', 'updates', 'stories'],
  });
};

export default async function NewsletterPage({ params }: NewsletterPageProps) {
  const { slug } = await params;
  const { data: [page] } = await strapiClient.getPage('newsletter', slug);
  const { data: [store] } = await strapiClient.getStore(slug);
  const title = page?.Title || `Newsletter`;
  const subtitle = page?.SEO?.metaDescription || `A calm inbox with updates from ${store?.title || 'this store'}.`;

  return (
    <Container size="lg" py="xl">
      <Stack gap="xl">
        <StorePageHeader
          icon={<IconMail size={48} />}
          title={title}
          description={subtitle}
          page={page}
          backgroundImage={page?.SEO?.socialImage?.url || store?.SEO?.socialImage?.url || store?.Cover?.url}
          iconColor={markketColors.sections.newsletter.main}
        />

        {page?.Content?.length > 0 && (
          <Box>
            <PageContent params={{ page }} />
          </Box>
        )}

        {!(page?.Content?.length > 0) && (
          <Paper
            p="xl"
            radius="xl"
            withBorder
            style={{
              borderColor: `${markketColors.sections.newsletter.main}2e`,
              background: `linear-gradient(145deg, ${markketColors.sections.newsletter.light} 0%, #ffffff 70%)`,
              minHeight: 220,
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <Stack gap="sm" w="100%">
              <Text c={markketColors.neutral.charcoal} ta="center" fw={600}>
                New editions are on the way.
              </Text>
              <Text c={markketColors.neutral.mediumGray} ta="center" lh={1.7}>
                Expect thoughtful updates on new arrivals, upcoming events, and selected stories.
              </Text>
            </Stack>
          </Paper>
        )}

        <Paper
          p="xl"
          radius="xl"
          style={{
            backgroundColor: markketColors.neutral.offWhite,
            border: `1px solid ${markketColors.neutral.lightGray}`,
          }}
        >
          <Suspense fallback={<LoadingOverlay visible />}>
            <SubscribeForm store={store as Store} />
          </Suspense>
        </Paper>
      </Stack>
    </Container>
  );
};
