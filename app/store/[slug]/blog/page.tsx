import { Container, Title, Text, Stack, SimpleGrid } from "@mantine/core";
import { strapiClient } from '@/markket/api';
import { BlogPostCard } from '@/app/components/docs/card';
import { notFound } from 'next/navigation';
import { Store } from "@/markket/store.d";
import { Article } from "@/markket/article";

interface BlogPageProps {
  params: Promise<{ slug: string }>;
}

export default async function StoreBlogPage({ params }: BlogPageProps) {
  // Get store and its blog posts
  const { slug } = await params;
  const storeResponse = await strapiClient.getStore(slug);
  const store = storeResponse?.data?.[0] as Store;

  if (!store) {
    notFound();
  }

  // Get blog posts for this store
  const postsResponse = await strapiClient.getPosts({ page: 1, pageSize: 30 }, { filter: '', sort: 'createdAt:desc' }, slug);

  const posts = postsResponse?.data || [] as Article[];

  return (
    <Container size="lg" py="xl">
      <Stack gap="xl">
        <div className="text-center">
          <Title order={1}>Blog</Title>
          <Text c="dimmed" size="lg">
            Latest updates from {store.SEO?.metaTitle || store.slug}
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
    </Container>
  );
};
