import { Badge, Box, Container, Paper, SimpleGrid, Stack, Text, Title } from '@mantine/core';
import Link from 'next/link';
import { notFound } from 'next/navigation';
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

interface AboutDetailPageProps {
  params: Promise<{ page_slug: string }>;
}

export async function generateMetadata({ params }: AboutDetailPageProps): Promise<Metadata> {
  const { page_slug } = await params;
  const response = await strapiClient.getPage(page_slug, PLATFORM_SLUG);
  const page = response?.data?.[0] as Page | undefined;

  return generateSEOMetadata({
    slug: 'about',
    entity: {
      url: `/about/${page_slug}`,
      SEO: page?.SEO,
      Title: page?.Title,
    },
    type: 'article',
    defaultTitle: 'About',
  });
}

export default async function AboutDetailPage({ params }: AboutDetailPageProps) {
  const { page_slug } = await params;

  const [pageResponse, pagesResponse] = await Promise.all([
    strapiClient.getPage(page_slug, PLATFORM_SLUG),
    strapiClient.getPages(PLATFORM_SLUG),
  ]);

  const page = pageResponse?.data?.[0] as Page | undefined;
  if (!page) {
    notFound();
  }

  const allPages = (pagesResponse?.data || []) as Page[];
  const otherPages = allPages
    .filter((p) => p?.slug && p.slug !== page_slug && !SYSTEM_PAGE_SLUGS.has(p.slug))
    .filter((p) => isPublishedEntry(p as PublicationEntry))
    .filter((p) => !isInternalPage(p))
    .sort((a, b) => (a?.Title || '').localeCompare(b?.Title || ''));

  return (
    <Container size="lg" py="xl">
      <Stack gap="xl">
        <Box
          style={{
            position: 'relative',
            overflow: 'hidden',
            borderRadius: 20,
            padding: '30px 24px',
            background: `linear-gradient(145deg, ${markketColors.sections.about.light} 0%, #ffffff 56%, #f7fbfc 100%)`,
            border: `1px solid ${markketColors.sections.about.main}33`,
          }}
        >
          <Box
            style={{
              position: 'absolute',
              top: -20,
              right: -12,
              width: 120,
              height: 120,
              borderRadius: 22,
              border: `1px solid ${markketColors.sections.about.main}44`,
              transform: 'rotate(12deg)',
              opacity: 0.55,
              pointerEvents: 'none',
            }}
          />
          <Stack gap="xs">
            <Badge variant="light" radius="xl" style={{ width: 'fit-content', color: markketColors.sections.about.main }}>
              About
            </Badge>
            <Title order={1}>{page.Title || page.slug}</Title>
            {page?.SEO?.metaDescription ? <Text c="dimmed">{page.SEO.metaDescription}</Text> : null}
          </Stack>
        </Box>

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
          <PageContent params={{ page }} />
        </Paper>

        {otherPages.length > 0 ? (
          <Stack gap="sm">
            <Text size="xs" tt="uppercase" fw={700} c="dimmed" style={{ letterSpacing: '0.1em' }}>
              More pages
            </Text>
            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
              <Link href="/about" style={{ textDecoration: 'none' }}>
                <Paper
                  withBorder
                  radius="lg"
                  p="md"
                  style={{
                    height: '100%',
                    borderColor: `${markketColors.sections.about.main}45`,
                    background: `linear-gradient(140deg, ${markketColors.sections.about.light} 0%, #ffffff 80%)`,
                  }}
                >
                  <Stack gap={6}>
                    <Badge variant="filled" radius="md" style={{ width: 'fit-content' }}>About Home</Badge>
                    <Text size="sm" c="dimmed">Back to the about home page.</Text>
                  </Stack>
                </Paper>
              </Link>
              {otherPages.slice(0, 10).map((p) => (
                <Link key={p.documentId || p.id || p.slug} href={`/about/${p.slug}`} style={{ textDecoration: 'none' }}>
                  <Paper
                    withBorder
                    radius="lg"
                    p="md"
                    style={{
                      height: '100%',
                      borderColor: `${markketColors.sections.about.main}2f`,
                      background: '#fff',
                    }}
                  >
                    <Stack gap={6}>
                      <Text fw={700} style={{ color: markketColors.neutral.charcoal }}>
                        {p.Title || p.slug}
                      </Text>
                      <Text size="sm" c="dimmed" lineClamp={3}>
                        {p?.SEO?.metaDescription || 'Open this page to learn more.'}
                      </Text>
                    </Stack>
                  </Paper>
                </Link>
              ))}
            </SimpleGrid>
          </Stack>
        ) : null}
      </Stack>
    </Container>
  );
}
