'use client';

import { Container, Title, Text, Stack, Paper, Image } from "@mantine/core";
import { strapiClient } from '@/markket/api';
import { useRouter } from 'next/navigation';
import {
  BlocksRenderer,
  type BlocksContent,
} from "@strapi/blocks-react-renderer";
import { Article } from "@/markket/article.d";
import { useEffect, useState } from 'react';
import { LoadingOverlay } from '@mantine/core';


interface BlogPostDetailsProps {
  params: {
    id: string;
    slug: string;
  };
}

/**
 * Uses id and slug to fetch a blog post from Strapi
 *
 * @param param0
 * @returns
 */
export default function BlogPostPage({
  params: { id, slug }
}: BlogPostDetailsProps) {
  const [post, setPost] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await strapiClient.getPost(id.split('-')[0], slug);
        const post = response?.data?.[0];

        if (!post) {
          router.push('/404');
          return;
        }

        setPost(post as Article);
      } catch (error) {
        console.error('Failed to fetch post:', error);
        router.push('/404');
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id, slug, router]);

  if (loading) {
    return <LoadingOverlay visible />;
  }

  if (!post) {
    return null;
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
