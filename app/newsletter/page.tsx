import { Paper, Container, LoadingOverlay, Stack, Title, Text, Box, Group, Badge } from '@mantine/core';
import { SubscribeForm } from '@/app/components/ui/subscribe.form';
import { Store } from '@/markket/store';
import { strapiClient } from '@/markket/api.strapi';
import PageContent from '@/app/components/ui/page.content';
import { generateSEOMetadata } from '@/markket/metadata';
import { Page } from "@/markket/page";
import { Metadata } from "next";
import { Suspense } from 'react';
import { markketColors } from '@/markket/colors.config';
import { IconMailStar, } from '@tabler/icons-react';

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
  const description = page?.SEO?.metaDescription || store?.SEO?.metaDescription || 'Stories, updates, and featured releases from the community.';

  return (
    <Container size="xl" pt={0} pb={{ base: 'xl', md: 60 }}>
      <Stack gap="xl">
        <Box
          style={{
            background: `linear-gradient(120deg, ${markketColors.rosa.main} 0%, ${markketColors.sections.blog.main} 55%, ${markketColors.sections.shop.main} 100%)`,
            marginLeft: 'calc(50% - 50vw)',
            marginRight: 'calc(50% - 50vw)',
            paddingTop: 50,
            paddingBottom: 56,
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          <Box
            style={{
              inset: 0,
              position: 'absolute',
              background: 'radial-gradient(circle at 22% 18%, rgba(255,255,255,0.24), transparent 38%), radial-gradient(circle at 78% 72%, rgba(255,255,255,0.18), transparent 36%)',
              pointerEvents: 'none',
            }}
          />
          <Container size="md" style={{ position: 'relative', zIndex: 1 }}>
            <Stack align="center" gap="md">
              <Badge variant="light" radius="xl" style={{ background: 'rgba(255,255,255,0.92)', color: markketColors.neutral.charcoal }}>
                Community Dispatch
              </Badge>
              <Title ta="center" c="white" style={{ fontSize: 'clamp(1.9rem, 5vw, 3rem)', fontWeight: 850, lineHeight: 1.15 }}>
                {title}
              </Title>
              <Text size="lg" ta="center" c="rgba(255,255,255,0.96)" maw={700} style={{ lineHeight: 1.58 }}>
                {description}
              </Text>
            </Stack>
          </Container>
        </Box>

        <Container size="md">
          <Stack gap="lg">
            <Paper
              withBorder
              radius="xl"
              p={{ base: 'lg', md: 'xl' }}
              style={{ borderColor: markketColors.neutral.lightGray, boxShadow: '0 10px 28px rgba(0,0,0,0.06)' }}
            >
              <Group gap="xs" mb="sm">
                <IconMailStar size={18} color={markketColors.rosa.main} />
                <Text fw={700} style={{ color: markketColors.neutral.charcoal }}>
                  Get the next issue in your inbox
                </Text>
              </Group>
              <Suspense fallback={<LoadingOverlay visible />}>
                <SubscribeForm store={store as Store} />
              </Suspense>
            </Paper>

            {page?.Title && (
              <Paper withBorder radius="lg" p={{ base: 'md', md: 'lg' }} style={{ borderColor: markketColors.neutral.lightGray }}>
                <PageContent params={{ page }} />
              </Paper>
            )}

            {image && (
              <Paper withBorder radius="lg" p="xs" style={{ borderColor: markketColors.neutral.lightGray }}>
                <img
                  src={image.url}
                  alt={page?.SEO?.metaTitle || store?.SEO?.metaTitle || 'Newsletter image'}
                  style={{ width: '100%', height: 'auto', borderRadius: 10, display: 'block' }}
                />
              </Paper>
            )}
          </Stack>
        </Container>
      </Stack>
    </Container>
  );
};
