import { Card, Image, Text, Badge, Group } from '@mantine/core';
import { IconCalendar, IconTag } from '@tabler/icons-react';
import { Article } from '@/markket/article';

export interface BlogPostCardProps {
  post: Article;
}

function createSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
};

export function BlogPostCard({ post }: BlogPostCardProps) {
  const slug = `${post.id}-${createSlug(post.Title)}`;

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      {post?.cover?.data?.attributes?.url && (
        <Card.Section>
          <Image
            src={post.cover.data.attributes.url}
            height={200}
            alt={post?.Title}
          />
        </Card.Section>
      )}

      <Group justify="space-between" mt="md" mb="xs">
        <Text fw={500} size="lg" lineClamp={2}>
          <a href={`/docs/${slug}`}>{post.Title}</a>
        </Text>
        <Group gap="xs">
          <IconCalendar size={14} />
          <Text size="sm" c="dimmed">
            {new Date(post.publishedAt).toLocaleDateString()}
          </Text>
        </Group>
      </Group>

      <Text size="sm" c="dimmed" mb="md" lineClamp={3}>
        {post?.SEO?.metaDescription}
      </Text>

      <Group gap="xs">
        {post.Tags?.map((tag, index) => (
          <Badge key={index} variant="light">
            <IconTag size={14} className="mr-1" />
            {tag.Label}
          </Badge>
        ))}
      </Group>
    </Card>
  );
};
