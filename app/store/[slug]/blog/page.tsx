import { Container, Title, Text, Stack, SimpleGrid } from "@mantine/core";
import { strapiClient } from '@/markket/api';
import { BlogPostCard } from '@/app/components/docs/card';
import { notFound } from 'next/navigation';
import { Store } from "@/markket/store.d";
import { Article } from "@/markket/article";
import { generateSEOMetadata } from '@/markket/metadata';
import { Page } from "@/markket/page";
import { Metadata } from "next";
import PageContent from "@/app/components/ui/page.content";

interface BlogPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: BlogPageProps): Promise<Metadata> {
  const { slug } = await params;
  let response;

  if (slug) {
    response = await strapiClient.getPage('blog', slug);
  }

  const page = response?.data?.[0] as Page;

  return generateSEOMetadata({
    slug,
    entity: {
      SEO: page?.SEO,
      title: page?.Title || 'Blog',
      id: page?.id?.toString(),
      url: `/store/${slug}/blog`,
    },
    type: 'article',
    defaultTitle: `${page?.Title}` || 'Blog',
  });
};

export default async function StoreBlogPage({ params }: BlogPageProps) {
  const { slug } = await params;
  const storeResponse = await strapiClient.getStore(slug);
  const store = storeResponse?.data?.[0] as Store;


  if (!store) {
    notFound();
  }

  const blogResponse = await strapiClient.getPage('blog', slug);
  const page = blogResponse?.data?.[0] as Page;
  const postsResponse = await strapiClient.getPosts({
    page: 1,
    pageSize: 50
  }, {
    sort: 'createdAt:desc'
  }, slug);
  const posts = postsResponse?.data || [] as Article[];
  const description = page?.SEO?.metaDescription || `Blog posts for ${store?.SEO?.metaTitle}`;

  return (
    <Container size="lg" py="xl">
      <Stack gap="xl">
        <div className="text-center">
          <Title order={1}>
            {page?.Title || `Blog`}
          </Title>
          <Text c="dimmed" size="lg">
            {description}
          </Text>
        </div>
        {posts.length > 0 ? (
          <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }}>
            {posts.map((post) => (
              <BlogPostCard key={(post as Article)?.id} post={post as Article} prefix={`./store/${slug}/blog`} />
            ))}
          </SimpleGrid>
        ) : (
          <Text ta="center" c="dimmed">
            No blog posts yet.
          </Text>
        )}
      </Stack>
      <PageContent params={{ page }} />
    </Container>
  );
};
