import { Card, CardSection, Image, Text, Badge, Group, Button, rem } from '@mantine/core';
import { IconCalendar, IconTag, IconLink } from '@tabler/icons-react';
import { Article } from '@/markket/article';
import "./card.css"

export interface BlogPostCardProps {
  post: Article;
  prefix?: string;
};

export function BlogPostCard({ post, prefix }: BlogPostCardProps) {
  const slug = post.slug;
  const imageHeight = 180;
  const linkHref = `/${prefix || 'docs'}/${slug}`;

  return (
    <Card
      className="blog-card"
      shadow="lg"
      padding="lg"
      radius="md"
      withBorder
      style={{
        borderWidth: 3,
        borderColor: '#222',
        borderStyle: 'solid',
        boxShadow: '6px 6px 0 #222',
        background: '#fffbe6',
        minHeight: 400,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        transition: 'box-shadow 0.2s, border-color 0.2s, transform 0.2s, background 0.2s',
      }}
    >
      <CardSection style={{ height: imageHeight, background: '#e0e0e0', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', borderBottom: '3px solid #222', padding: 0 }}>
        {post?.cover?.url ? (
          <Image
            src={post.cover.url}
            alt={post?.Title}
            style={{ objectFit: 'cover', objectPosition: 'top', width: '100%', height: '100%', borderRadius: 0, display: 'block', transition: 'transform 0.3s cubic-bezier(.4,2,.6,1)' }}
            radius={0}
            className="blog-card-img"
          />
        ) : (
          <Text c="dimmed" style={{ fontWeight: 700, fontSize: rem(18), letterSpacing: 1, width: '100%', height: '100%', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>No Image</Text>
        )}
      </CardSection>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <Group justify="space-between" mt="md" mb="xs">
          <Text fw={700} size="lg" lineClamp={2} className="blog-card-title" style={{ textTransform: 'uppercase', letterSpacing: 1, width: '100%' }}>
            <a href={linkHref} style={{ color: '#222', textDecoration: 'none', borderBottom: '2px solid #222', transition: 'border 0.2s, color 0.2s' }}>
              {post.Title}
            </a>
          </Text>
          <Group gap="xs">
            <IconCalendar size={16} stroke={2} />
            <Text size="sm" c="dimmed">
              {new Date(post.publishedAt).toLocaleDateString()}
            </Text>
          </Group>
        </Group>

        <Text size="sm" mb="md" lineClamp={3} style={{ fontWeight: 600, fontFamily: 'monospace', background: '#181818', color: '#fff', padding: '0.7em', borderRadius: 6, border: '2px dashed #222', letterSpacing: 0.2 }}>
          {post?.SEO?.metaDescription}
        </Text>

        <Group gap="xs" mt="auto" mb="md">
          {post.Tags?.map((tag, index) => (
            <Badge key={index} variant="outline" color="dark" size="sm" style={{ borderWidth: 2, borderColor: '#222', background: '#fff', color: '#222', fontWeight: 700, fontFamily: 'monospace', display: 'flex', alignItems: 'center', gap: 2 }}>
              <IconTag size={14} style={{ marginRight: 4 }} />
              {tag.Label}
            </Badge>
          ))}
        </Group>

        <Button
          component="a"
          href={linkHref}
          target="_self"
          variant="outline"
          radius="md"
          size="md"
          className="blog-card-learn"
          leftSection={<IconLink size={18} />}
          style={{
            fontWeight: 700,
            letterSpacing: 1,
            borderWidth: 2,
            borderColor: '#222',
            color: '#222',
            background: '#fff',
            marginTop: 'auto',
            transition: 'background 0.2s, color 0.2s, border-color 0.2s',
          }}
        >
          Learn more
        </Button>
      </div>
    </Card>
  );
};
