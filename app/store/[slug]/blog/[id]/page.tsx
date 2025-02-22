import { Container, Title, Text, Stack, Paper, Image } from "@mantine/core";
import { strapiClient } from '@/markket/api';
import { notFound } from 'next/navigation';
import {
  BlocksRenderer,
  type BlocksContent,
} from "@strapi/blocks-react-renderer";
import { Article } from "@/markket/article.d";

interface BlogPostPageProps {
  params: Promise<{
    id: string;
    slug: string;
  }>;
}

export default async function DocsPage({ params }: BlogPostPageProps) {
  const { id, slug } = await params;
  const response = await strapiClient.getPost((id as string ).split('-')[0], slug);
  const post = response?.data?.[0] as Article

  if (!post) {
    notFound();
  }

  return (
    <Container size="md" py="xl">
      <Stack gap="xl">
        {post.cover && (
          <Image
            src={post.cover.url}
            alt={post.Title}
            radius="md"
            className="w-full"
          />
        )}

        <div>
          <Title order={1}>{post.Title}</Title>
          {post.Tags && (
            <div className="flex gap-2 mt-2">
              {post.Tags.map((tag) => (
                <Text
                  key={tag.id}
                  size="sm"
                  c={tag.Color?.toLowerCase() || 'blue'}
                >
                  #{tag.Label}
                </Text>
              ))}
            </div>
          )}
        </div>

        <Paper p="md" withBorder>
          <BlocksRenderer content={post.Content as BlocksContent} />
        </Paper>
      </Stack>
    </Container>
  );
};
