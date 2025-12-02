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

  return (
    <Container size="lg" py="xl">
      <Box maw={680} mx="auto">
        <Stack gap="lg" align="center" mb="xl">
          <Box
            style={{
              width: 80,
              height: 80,
              borderRadius: 20,
              background: `linear-gradient(135deg, ${markketColors.sections.newsletter.main} 0%, ${markketColors.sections.newsletter.main}dd 100%)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 16px rgba(228, 0, 124, 0.2)',
            }}
          >
            <IconMail size={40} color={markketColors.neutral.white} stroke={2} />
          </Box>

          <Stack gap="xs" align="center">
            <Text
              size="2rem"
              fw={600}
              ta="center"
              c={markketColors.neutral.charcoal}
              style={{ lineHeight: 1.2 }}
            >
              {title}
            </Text>
            <Text
              size="md"
              c={markketColors.neutral.mediumGray}
              ta="center"
              maw={560}
            >
              Stay in the loop with original updates
            </Text>
          </Stack>
        </Stack>

        <Stack gap="xl">
          {page?.Content?.length > 0 && (
            <Box>
              <PageContent params={{ page }} />
            </Box>
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
      </Box>
    </Container>
  );
};
