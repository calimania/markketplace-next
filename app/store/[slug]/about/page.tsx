import { Badge, Container, Group, LoadingOverlay, Paper, SimpleGrid, Stack, Text, ThemeIcon, rem } from '@mantine/core';
import { strapiClient } from '@/markket/api.strapi';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { IconInfoCircle, IconNotebook, IconSparkles } from '@tabler/icons-react';
import { PageList } from '@/app/components/ui/pages.list';
import { generateSEOMetadata } from '@/markket/metadata';
import { Page } from "@/markket/page";
import { Metadata } from "next";
import StorePageHeader from '@/app/components/ui/store.page.header';
import PageContent from '@/app/components/ui/page.content';
import { markketColors } from '@/markket/colors.config';
import { StoreTabs } from '@/app/components/ui/store.tabs';
import StoreCrosslinks from '@/app/components/ui/store.crosslinks';

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
      title: page?.Title,
    },
    type: 'article',
    defaultTitle: 'About',
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

      <Stack gap="xl">
        <Paper
          withBorder
          radius="xl"
          p={{ base: 'md', sm: 'lg' }}
          style={{
            borderColor: 'rgba(15, 23, 42, 0.08)',
            background: 'linear-gradient(135deg, rgba(224,247,250,0.28) 0%, rgba(255,255,255,0.98) 55%, rgba(252,228,236,0.35) 100%)',
            boxShadow: '0 10px 28px rgba(15, 23, 42, 0.05)',
          }}
        >
          <Stack gap="md">
            <Group justify="space-between" align="flex-start" wrap="wrap">
              <Group align="flex-start" wrap="nowrap">
                {store?.Logo?.url ? (
                  <img
                    src={store.Logo.url}
                    alt={store.title || slug}
                    style={{ width: rem(72), height: rem(72), objectFit: 'cover', borderRadius: rem(18), flexShrink: 0 }}
                  />
                ) : (
                  <ThemeIcon size={72} radius="xl" color="cyan" variant="light">
                    <IconInfoCircle size={34} />
                  </ThemeIcon>
                )}

                <Stack gap={4}>
                  <Badge size="lg" radius="xl" variant="light" color="cyan" leftSection={<IconSparkles size={14} />}>
                    Store story
                  </Badge>
                  <Text fw={700} size="xl" style={{ letterSpacing: '-0.03em' }}>
                    Learn the shape of the project behind the storefront.
                  </Text>
                  <Text c="dimmed" lh={1.7} maw={620}>
                    This space is for context, process, and everything that gives the catalog a point of view.
                  </Text>
                </Stack>
              </Group>

              <SimpleGrid cols={2} spacing="sm" maw={260} style={{ flex: 1 }}>
                <Paper withBorder radius="lg" p="sm" bg={markketColors.sections.about.light} style={{ borderColor: markketColors.sections.about.main }}>
                  <Text size="xs" tt="uppercase" fw={700} style={{ letterSpacing: '0.08em', color: markketColors.sections.about.main }}>Custom pages</Text>
                  <Text fw={700} size="lg">{customPages.length}</Text>
                </Paper>
                <Paper withBorder radius="lg" p="sm" bg={markketColors.sections.blog.light} style={{ borderColor: markketColors.sections.blog.main }}>
                  <Text size="xs" tt="uppercase" fw={700} style={{ letterSpacing: '0.08em', color: markketColors.sections.blog.main }}>Journal</Text>
                  <Text fw={700} size="lg">{store?.URLS?.length || 0}</Text>
                </Paper>
              </SimpleGrid>
            </Group>

            {store?.URLS?.length > 0 && (
              <StoreTabs urls={store.URLS} basePath={`/${slug}`} />
            )}
          </Stack>
        </Paper>

        <Paper
          withBorder
          radius="xl"
          p={{ base: 'md', sm: 'xl' }}
          style={{ borderColor: 'rgba(15, 23, 42, 0.08)', boxShadow: '0 10px 24px rgba(15, 23, 42, 0.04)' }}
        >
          <PageContent params={{ page: aboutPage }} />
        </Paper>

        {customPages.length > 0 && (
          <Stack gap="md">
            <Group gap="xs">
              <IconNotebook size={18} color={markketColors.sections.about.main} />
              <Text fw={700} size="sm" tt="uppercase" c="dimmed" style={{ letterSpacing: '0.1em' }}>
                More pages
              </Text>
            </Group>

            <Suspense fallback={<LoadingOverlay visible />}>
              <PageList pages={customPages} storeSlug={slug} />
            </Suspense>
          </Stack>
        )}

        <StoreCrosslinks
          slug={slug}
          store={store}
          currentSection="about"
          items={customPages.slice(0, 4).map((page) => ({
            href: `/${slug}/about/${page.slug}`,
            label: page.Title || page.slug,
          }))}
        />
      </Stack>
    </Container>
  );
};
