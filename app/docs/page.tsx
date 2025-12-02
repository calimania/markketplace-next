import { Container, Title, Text, Stack } from "@mantine/core";
import { strapiClient } from '@/markket/api.strapi';
import { Article } from "@/markket/article.d";
import DocsGrid from '@/app/components/docs/grid';
import { generateSEOMetadata } from '@/markket/metadata';
import { Page } from "@/markket/page";
import { Metadata } from "next";
import PageContent from "../components/ui/page.content";

const defaultLogo = `https://markketplace.nyc3.digitaloceanspaces.com/uploads/1a82697eaeeb5b376d6983f452d1bf3d.png`;

export async function generateMetadata(): Promise<Metadata> {
  const response = await strapiClient.getPage('blog');
  const page = response?.data?.[0] as Page;

  return generateSEOMetadata({
    slug: 'docs',
    entity: {
      url: '/docs',
      SEO: page?.SEO,
      Title: page?.Title,
    },
    defaultTitle: 'Documentation',
    type: 'website',
  });
}

export default async function DocsPage() {
  const storeResponse = await strapiClient.getStore();
  const store = storeResponse.data[0];

  const response = await strapiClient.getPosts(
    { page: 1, pageSize: 30 },
    { filter: '', sort: 'createdAt:desc' }
  );

  const articles = response?.data as Article[] || [];

  const pageResponse = await strapiClient.getPage('blog');
  const page = pageResponse?.data?.[0] as Page;

  return (
    <Container size="xl" className="py-20">
      <Stack gap="xl">
        {/* Hero Section */}
        <div className="text-center">
          <img
            src={store?.Logo?.url || defaultLogo}
            alt={store?.SEO?.metaTitle || 'Markket Logo'}
            width={200}
            height={200}
            className="mx-auto mb-8"
          />
          <Title className="text-4xl md:text-5xl mb-4">
            {page?.Title || 'Documentation & Articles'}
          </Title>
          <Text size="xl" c="dimmed" className="mx-auto mb-8">
            {page?.SEO?.metaDescription || store?.SEO?.metaDescription || 'Knowledge base and articles'}
          </Text>
        </div>

        <Title order={2} className="text-center mb-8">
          Documentation & Articles
        </Title>
        <DocsGrid posts={articles} />
        <PageContent params={{ page }} />
      </Stack>
    </Container>
  );
}
