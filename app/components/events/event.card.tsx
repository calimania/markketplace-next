import { Card as MantineCard, Text, Badge, Group, Title } from '@mantine/core';
import { IconCalendar, IconClock } from '@tabler/icons-react';

export interface Props {
  href?: string;
  author?: string;
  tags?: string[];
  frontmatter: {
    title: string;
    pubDatetime: Date;
    modDatetime: Date;
    description: string;
    author?: string;
  };
  image?: {
    url?: string;
    alternativeText?: string | null;
    width?: number;
    height?: number;
  };
}

export default function Card({ href, frontmatter, tags, image }: Props) {
  const { title, pubDatetime, description } = frontmatter;

  return (
    <MantineCard
      component="a"
      href={href}
      padding="lg"
      radius="md"
      withBorder
      className="transition-all hover:shadow-lg hover:-translate-y-1 duration-300"
    >
      {image?.url && (
        <div style={{ position: 'relative', height: 220 }}>
          <img
            src={image.url}
            alt={image.alternativeText || title}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        </div>
      )}

      <div>
        <Title order={3} lineClamp={2} mb="sm">
          {title}
        </Title>

        <Text size="sm" c="dimmed" lineClamp={3} mb="md">
          {description}
        </Text>

        <Group gap="xs" mb="md">
          <IconCalendar size="1rem" />
          <Text size="sm">
            {pubDatetime.toLocaleDateString()}
          </Text>
          <IconClock size="1rem" />
          <Text size="sm">
            {pubDatetime.toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </Text>
        </Group>

        {tags && tags.length > 0 && (
          <Group gap="xs" mt="auto">
            {tags.map((tag, index) => (
              <Badge
                key={index}
                variant="light"
                size="sm"
              >
                {tag}
              </Badge>
            ))}
          </Group>
        )}
      </div>
    </MantineCard>
  );
}
