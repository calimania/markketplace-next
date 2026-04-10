import { strapiClient } from '@/markket/api.strapi';
import { generateSEOMetadata } from '@/markket/metadata';
import { Metadata } from 'next';
import { Container, Stack, Title, Text, Paper, Box, Badge, Group } from '@mantine/core';
import { IconArticle, IconSparkles } from '@tabler/icons-react';
import { markketColors } from '@/markket/colors.config';
import BlogFeed from './feed';
import type { Article } from '@/markket/article';

export async function generateMetadata(): Promise<Metadata> {
  return generateSEOMetadata({
    slug: 'blog',
    entity: { url: '/blog' },
    defaultTitle: 'Blog',
    defaultDescription: 'Stories, updates, and ideas from creators across the Markket community.',
    keywords: ['blog', 'articles', 'stories', 'community', 'creators'],
    type: 'website',
  });
}

const PAGE_SIZE = 12;

export default async function BlogDiscoveryPage() {
  const response = await strapiClient.getCommunityPosts(
    { page: 1, pageSize: PAGE_SIZE },
    { sort: 'publishedAt:desc' },
  );

  const posts = (response?.data || []) as Article[];
  const total = response?.meta?.pagination?.total ?? 0;
  const hasMore = posts.length < total;

  return (
    <Container size="lg" py={{ base: 'xl', md: 60 }}>
      <Stack gap="xl">
        {/* Hero */}
        <Paper
          radius="xl"
          p={{ base: 'lg', md: 48 }}
          style={{
            background: markketColors.gradients.hero,
            border: 'none',
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          <Box
            style={{
              position: 'absolute',
              top: -50,
              right: -50,
              width: 200,
              height: 200,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.07)',
              pointerEvents: 'none',
            }}
          />
          <Stack align="center" gap="md" style={{ position: 'relative', zIndex: 1 }}>
            <Box
              style={{
                width: 64,
                height: 64,
                borderRadius: 16,
                background: 'rgba(255,255,255,0.2)',
                backdropFilter: 'blur(8px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <IconArticle size={30} color="white" stroke={1.5} />
            </Box>
            <Title
              ta="center"
              c="white"
              style={{ fontSize: 'clamp(1.6rem, 5vw, 2.8rem)', fontWeight: 800, lineHeight: 1.2 }}
            >
              Community Stories
            </Title>
            <Text size="md" ta="center" c="rgba(255,255,255,0.85)" maw={480}>
              Fresh writing from creators, makers, and builders across the Markket community.
            </Text>
            <Group gap="xs">
              <Badge variant="light" radius="xl" style={{ background: 'rgba(255,255,255,0.2)', color: 'white' }}>
                <IconSparkles size={12} style={{ marginRight: 4 }} />
                {total} posts
              </Badge>
            </Group>
          </Stack>
        </Paper>

        {/* Infinite scroll feed */}
        <BlogFeed initialPosts={posts} initialHasMore={hasMore} />
      </Stack>
    </Container>
  );
}
