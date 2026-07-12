import { Badge, Box, Container, Group, Paper, SimpleGrid, Stack, Text, Title } from '@mantine/core';
import Link from 'next/link';
import { strapiClient } from '@/markket/api.strapi';
import { markketplace } from '@/markket/config';
import { generateSEOMetadata } from '@/markket/metadata';
import type { Metadata } from 'next';
import type { Page } from '@/markket/page';
import PageContent from '@/app/components/ui/page.content';
import { markketColors } from '@/markket/colors.config';

const PLATFORM_SLUG = process.env.NEXT_PUBLIC_MARKKET_STORE_SLUG || markketplace.slug || 'next';
const SYSTEM_PAGE_SLUGS = new Set(['home', 'about', 'blog', 'products', 'events']);
const INTERNAL_PAGE_HINTS = [
  'login',
  'auth',
  'dashboard',
  'navigation',
  'crm',
  'receipt',
  'notification',
  'account',
  'code',
  'comms-disclosure-internal',
];

type PublicationEntry = {
  publishedAt?: string | null;
  tiendaPublication?: { visibleStatus?: string | null };
};

const isPublishedEntry = (entry: PublicationEntry): boolean => {
  const visibleStatus = entry?.tiendaPublication?.visibleStatus;
  if (visibleStatus) {
    return visibleStatus === 'published';
  }

  if (typeof entry?.publishedAt === 'string') {
    return entry.publishedAt.length > 0;
  }

  return Boolean(entry?.publishedAt);
};

const isInternalPage = (page: Page): boolean => {
  const slug = (page?.slug || '').toLowerCase();
  const title = (page?.Title || '').toLowerCase();
  const combined = `${slug} ${title}`;

  return INTERNAL_PAGE_HINTS.some((hint) => combined.includes(hint));
};

export async function generateMetadata(): Promise<Metadata> {
  const response = await strapiClient.getPage('about', PLATFORM_SLUG);
  const page = response?.data?.[0] as Page | undefined;

  return generateSEOMetadata({
    slug: 'about',
    entity: {
      url: '/about',
      SEO: page?.SEO,
      Title: page?.Title,
    },
    type: 'website',
    defaultTitle: 'About',
    defaultDescription: 'About Markketplace, including our story, terms, and policies.',
  });
}

export default async function PlatformAboutPage() {
  const [storeResponse, aboutResponse, pagesResponse] = await Promise.all([
    strapiClient.getStore(PLATFORM_SLUG),
    strapiClient.getPage('about', PLATFORM_SLUG),
    strapiClient.getPages(PLATFORM_SLUG),
  ]);

  const store = storeResponse?.data?.[0];
  const aboutPage = aboutResponse?.data?.[0] as Page | undefined;
  const allPages = (pagesResponse?.data || []) as Page[];

  const cmsPages = allPages
    .filter((page) => page?.slug && !SYSTEM_PAGE_SLUGS.has(page.slug))
    .filter((page) => isPublishedEntry(page as PublicationEntry))
    .filter((page) => !isInternalPage(page))
    .sort((a, b) => (a?.Title || '').localeCompare(b?.Title || ''));

  const title = aboutPage?.Title || 'About Markketplace';
  const description = aboutPage?.SEO?.metaDescription
    || store?.SEO?.metaDescription
    || 'Learn about Markketplace and explore helpful pages.';
  const contactEmail = `${PLATFORM_SLUG}@markket.place`;

  return (
    <Container size="lg" py="xl">
      <Stack gap="xl">
        <Paper
          withBorder
          radius="xl"
          p={{ base: 'lg', sm: 'xl' }}
          style={{
            position: 'relative',
            overflow: 'hidden',
            borderColor: `${markketColors.sections.about.main}33`,
            background: `linear-gradient(145deg, ${markketColors.sections.about.light} 0%, #ffffff 55%, #f7fbfc 100%)`,
          }}
        >
          <Box
            style={{
              position: 'absolute',
              top: -26,
              right: -18,
              width: 140,
              height: 140,
              borderRadius: 26,
              border: `1px solid ${markketColors.sections.about.main}44`,
              transform: 'rotate(14deg)',
              opacity: 0.55,
              pointerEvents: 'none',
            }}
          />
          <Stack gap="sm" style={{ position: 'relative', zIndex: 1 }}>
            <Badge
              variant="light"
              radius="sm"
              style={{
                width: 'fit-content',
                background: `${markketColors.sections.about.main}1a`,
                color: markketColors.sections.about.main,
              }}
            >
              About
            </Badge>
            <Title
              order={1}
              style={{
                color: markketColors.neutral.charcoal,
                fontSize: 'clamp(1.8rem, 4vw, 2.7rem)',
                letterSpacing: '-0.03em',
              }}
            >
              {title}
            </Title>
            <Text c={markketColors.neutral.darkGray} maw={760} style={{ lineHeight: 1.7 }}>
              {description}
            </Text>
          </Stack>
        </Paper>

        {aboutPage ? (
          <Paper
            withBorder
            radius="xl"
            p={{ base: 'md', sm: 'xl' }}
            style={{
              borderColor: markketColors.neutral.lightGray,
              background: '#ffffff',
              boxShadow: '0 10px 24px rgba(15, 23, 42, 0.05)',
            }}
          >
            <PageContent params={{ page: aboutPage }} />
          </Paper>
        ) : null}

        {cmsPages.length > 0 ? (
          <Stack gap="md">
            <Group justify="space-between" align="center" wrap="wrap">
              <Title order={2} size="h3" style={{ letterSpacing: '-0.02em' }}>Explore</Title>
              <Text size="sm" c="dimmed">{cmsPages.length} helpful pages</Text>
            </Group>
            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
              {cmsPages.map((page) => (
                <Link key={page.documentId || page.id || page.slug} href={`/about/${page.slug}`} style={{ textDecoration: 'none' }}>
                  <Paper
                    withBorder
                    radius="lg"
                    p="md"
                    style={{
                      position: 'relative',
                      overflow: 'hidden',
                      height: '100%',
                      borderColor: `${markketColors.sections.about.main}2f`,
                      background: `linear-gradient(140deg, ${markketColors.sections.about.light} 0%, #ffffff 80%)`,
                      boxShadow: '0 8px 18px rgba(15, 23, 42, 0.05)',
                    }}
                  >
                    <Box
                      style={{
                        position: 'absolute',
                        right: -12,
                        top: -12,
                        width: 70,
                        height: 70,
                        borderRadius: 14,
                        border: `1px dashed ${markketColors.sections.about.main}44`,
                        transform: 'rotate(12deg)',
                        opacity: 0.6,
                        pointerEvents: 'none',
                      }}
                    />
                    <Stack gap={6} style={{ position: 'relative', zIndex: 1 }}>
                      <Text fw={700} style={{ color: markketColors.neutral.charcoal }}>
                        {page.Title || page.slug}
                      </Text>
                      <Text size="sm" c="dimmed" lineClamp={3}>
                        {page?.SEO?.metaDescription || 'Open this page to learn more.'}
                      </Text>
                    </Stack>
                  </Paper>
                </Link>
              ))}
            </SimpleGrid>
          </Stack>
        ) : null}

        <Paper
          withBorder
          radius="xl"
          p="md"
          style={{
            borderColor: markketColors.neutral.lightGray,
            background: 'linear-gradient(180deg, #ffffff 0%, #fafafa 100%)',
          }}
        >
          <Text size="sm" c="dimmed">
            Contact: {contactEmail}
          </Text>
        </Paper>
      </Stack>
    </Container>
  );
}
