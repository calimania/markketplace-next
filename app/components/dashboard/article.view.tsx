import { Container, Paper, Stack, Title, Text, Group, Badge, ActionIcon, Tooltip, Divider } from '@mantine/core';
import { Article } from '@/markket';
import { IconCalendar, IconClock, IconLink } from '@tabler/icons-react';
import { format } from 'date-fns';
import {ContentBlock} from './content.blocks.view';

const ViewArticle = ({ article }: { article: Article }) => {
  console.log('Article:', article);
  return (
    <Container size="md" py="xl">
      <Paper shadow="sm" p="xl" radius="md" withBorder>
        <Stack>
          {/* Article Header */}
          <Stack gap="xs">
            <Title order={1}>
              {article.Title}
            </Title>

            <Group gap="md">
              <Group gap="xs">
                <IconCalendar size={16} />
                <Text size="sm" c="dimmed">
                  Published {article?.publishedAt && format(new Date(article.publishedAt), 'MMM d, yyyy')}
                </Text>
              </Group>
              <Group gap="xs">
                <IconClock size={16} />
                <Text size="sm" c="dimmed">
                  Updated {article?.updatedAt && format(new Date(article.updatedAt), 'MMM d, yyyy')}
                </Text>
              </Group>
            </Group>

            {article.Tags && (
              <Group gap="xs" mt="xs">
                {article.Tags.map(tag => (
                  <Badge key={tag.id} variant="light">
                    {tag.Label}
                  </Badge>
                ))}
              </Group>
            )}
          </Stack>

          <Paper
            withBorder
            p="xl"
            radius="md"
            mt="xl"
            className="prose max-w-none"
          >
            <strong>Content</strong>
            <Divider my="md" />
            {article.Content?.map((block, index) => (
              <ContentBlock key={index} block={block} />
            ))}
          </Paper>

          {/* Article Footer */}
          <Group justify="space-between" mt="xl">
            <Text size="sm" c="dimmed">
              Article ID: {article.documentId}
            </Text>
            <Tooltip label="Copy link">
              <ActionIcon
                variant="light"
                onClick={() => {
                  navigator.clipboard.writeText(
                    `${window.location.origin}/articles/${article.slug}`
                  );
                }}
              >
                <IconLink size={16} />
              </ActionIcon>
            </Tooltip>
          </Group>
        </Stack>
      </Paper>
    </Container>
  );
};

export default ViewArticle;
