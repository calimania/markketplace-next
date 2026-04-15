'use client';

import { Card, CardSection, Text, Badge, Group, Anchor, Box, Stack } from '@mantine/core';
import { IconCalendar, IconArrowRight } from '@tabler/icons-react';
import { Article } from '@/markket/article';
import { markketColors } from '@/markket/colors.config';

export interface BlogPostCardProps {
  post: Article;
  prefix?: string;
  showStore?: boolean;
  imageLoading?: 'eager' | 'lazy';
};

export function BlogPostCard({ post, prefix, showStore, imageLoading = 'lazy' }: BlogPostCardProps) {
  const slug = post.slug;
  const linkHref = `/${prefix || 'docs'}/${slug}`;
  const coverUrl = post?.cover?.formats?.medium?.url || post?.cover?.formats?.small?.url || post?.cover?.url || post.SEO?.socialImage?.formats?.small?.url;
  const storeTitle = (post as Article & { store?: { title?: string } })?.store?.title;

  return (
    <Card
      shadow="none"
      padding={0}
      radius="xl"
      withBorder
      style={{
        borderColor: markketColors.neutral.gray,
        overflow: 'hidden',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease',
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLElement;
        el.style.transform = 'translateY(-3px)';
        el.style.boxShadow = `0 10px 28px ${markketColors.sections.blog.main}22`;
        el.style.borderColor = `${markketColors.sections.blog.main}50`;
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLElement;
        el.style.transform = '';
        el.style.boxShadow = '';
        el.style.borderColor = markketColors.neutral.gray;
      }}
    >
      <CardSection style={{ height: 180, overflow: 'hidden', flexShrink: 0 }}>
        {coverUrl ? (
          <img
            src={coverUrl}
            alt={post?.Title}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.3s ease' }}
            loading={imageLoading}
          />
        ) : (
            <Box
              style={{
                height: '100%',
                background: markketColors.sections.blog.light,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text size="sm" c="dimmed" fw={500}>No cover</Text>
            </Box>
        )}
      </CardSection>

      <Stack gap="xs" p="md" style={{ flex: 1 }}>
        <Group gap="xs">
          <Badge
            variant="light"
            radius="xl"
            size="xs"
            style={{ background: markketColors.sections.blog.light, color: markketColors.sections.blog.main }}
          >
            Blog
          </Badge>
          {showStore && storeTitle && (
            <Text size="xs" c="dimmed" lineClamp={1}>{storeTitle}</Text>
          )}
        </Group>

        <Anchor href={linkHref} underline="never" style={{ color: 'inherit' }}>
          <Text fw={700} size="sm" lineClamp={2} style={{ lineHeight: 1.4, color: markketColors.neutral.charcoal }}>
            {post.Title}
          </Text>
        </Anchor>

        {post?.SEO?.metaDescription && (
          <Text size="xs" c="dimmed" lineClamp={3} style={{ lineHeight: 1.6, flex: 1 }}>
            {post.SEO.metaDescription}
          </Text>
        )}

        <Group justify="space-between" align="center" mt="auto" pt="xs">
          <Group gap={4}>
            <IconCalendar size={12} color={markketColors.neutral.mediumGray} />
            <Text size="xs" c="dimmed">
              {new Date(post.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </Text>
          </Group>
          <Anchor
            href={linkHref}
            size="xs"
            fw={600}
            style={{ color: markketColors.sections.blog.main, display: 'flex', alignItems: 'center', gap: 2 }}
          >
            Read <IconArrowRight size={12} />
          </Anchor>
        </Group>
      </Stack>
    </Card>
  );
};
