import { Container, Title, Stack, Paper } from '@mantine/core';
import { strapiClient } from '@/markket/api.strapi';
import { notFound } from 'next/navigation';
import PageContent from '@/app/components/ui/page.content';
import { generateSEOMetadata } from '@/markket/metadata';
import { Page, Album } from "@/markket";
import { Metadata } from "next";
import Albums from '@/app/components/ui/albums.grid';
import StoreCrosslinks from '@/app/components/ui/store.crosslinks';
import StorePageHeader from '@/app/components/ui/store.page.header';
import { IconNotebook } from '@tabler/icons-react';
import { markketColors } from '@/markket/colors.config';

interface PageProps {
  params: Promise<{ page_slug: string, slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug, page_slug } = await params;

  const response = await strapiClient.getPage(page_slug, slug);
  const page = response?.data?.[0] as Page;

  return generateSEOMetadata({
    slug,
    entity: {
      url: `/${slug}/about/${page_slug}`,
      SEO: page?.SEO,
      Title: page?.Title,  // Use page title from database
    },
    type: 'article',
    defaultTitle: 'About',
  });
};

export default async function AboutPage({ params }: PageProps) {
  const { page_slug, slug } = await params;
  const [response, storeResponse, relatedPagesResponse] = await Promise.all([
    strapiClient.getPage(page_slug, slug),
    strapiClient.getStore(slug),
    strapiClient.getPages(slug),
  ]);
  const page = response?.data?.[0];
  const store = storeResponse?.data?.[0];
  const relatedPages = (relatedPagesResponse?.data || []) as Page[];
  const otherPages = relatedPages.filter((p) => p.slug !== page_slug && !['home', 'about'].includes(p.slug || ''));

  if (!page) {
    notFound();
  }

  return (
    <Container size="md">
      <Stack gap="xl">
        <StorePageHeader
          icon={<IconNotebook size={48} />}
          title={page.Title || 'Page'}
          description={page?.SEO?.metaDescription || store?.SEO?.metaDescription}
          page={page}
          backgroundImage={page?.SEO?.socialImage?.url || store?.SEO?.socialImage?.url || store?.Cover?.url}
          iconColor={markketColors.sections.about.main}
        />

        <Paper withBorder radius="xl" p={{ base: 'md', sm: 'xl' }} style={{ borderColor: 'rgba(15, 23, 42, 0.08)' }}>
          <PageContent params={{ page }} />
        </Paper>

        {page?.albums && page.albums.length > 0 && (
          <Stack gap="md">
            <Title order={2} size="h3" ta="left">
              Gallery
            </Title>
            <Albums albums={page.albums as Album[]} store_slug={slug as ''} />
          </Stack>
        )}

        <StoreCrosslinks
          slug={slug}
          store={store}
          currentSection="about"
          items={otherPages.map((p) => ({
            href: `/${slug}/about/${p.slug}`,
            label: p.Title || p.slug,
          }))}
        />
      </Stack>
    </Container>
  );
};
