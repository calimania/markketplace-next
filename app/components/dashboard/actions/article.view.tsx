import {
  Container,
  Paper,
  Stack,
  Title,
  Text,
  Group,
  Badge,
  Divider,
  ThemeIcon,
  Button,
} from '@mantine/core';
import { Article } from '@/markket';
import {
  IconCalendar,
  IconClock,
  IconLink,
  IconEdit,
} from '@tabler/icons-react';
import { format } from 'date-fns';
import { ContentBlock } from '../content.blocks.view';
import SEOPreview from '../seo.preview';
import Link from 'next/link';

const ViewArticle = ({ item }: { item: Article }) => {
  return (
    <Container size="md" py="xl">
      <SEOPreview SEO={item?.SEO} />

      <Paper withBorder radius="md" p="md" mb="xl">
        <Group justify="space-between">
          <Group>
            <Button
              component={Link}
              href={`/dashboard/articles/edit/${item.documentId}`}
              variant="light"
              leftSection={<IconEdit size={16} />}
            >
              Edit Article
            </Button>
          </Group>
        </Group>
      </Paper>
      <Paper shadow="sm" p="xl" radius="md" withBorder>
        <Stack>
          <Stack gap="lg">
            <Title
              order={1}
              style={{
                fontSize: '2.5rem',
                lineHeight: 1.2,
                fontWeight: 800,
              }}
            >
              {item.Title}
            </Title>
            <Group gap="lg">
              <Group gap="xs">
                <ThemeIcon size="md" variant="light" color="blue">
                  <IconCalendar size={16} />
                </ThemeIcon>
                <Text size="sm">
                  Published{' '}
                  <Text span fw={500}>
                    {item?.publishedAt &&
                      format(new Date(item.publishedAt), 'MMMM d, yyyy')}
                  </Text>
                </Text>
              </Group>
              <Group gap="xs">
                <ThemeIcon size="md" variant="light" color="grape">
                  <IconClock size={16} />
                </ThemeIcon>
                <Text size="sm">
                  Updated{' '}
                  <Text span fw={500}>
                    {item?.updatedAt &&
                      format(new Date(item.updatedAt), 'MMMM d, yyyy')}
                  </Text>
                </Text>
              </Group>
            </Group>
            {item.Tags && item.Tags.length > 0 && (
              <>
                <Divider />
                <Group gap="xs">
                  {item.Tags.map(tag => (
                    <Badge
                      key={tag.id}
                      variant="dot"
                      size="lg"
                      radius="sm"
                    >
                      {tag.Label}
                    </Badge>
                  ))}
                </Group>
              </>
            )}
          </Stack>
          <Paper
            withBorder
            p="xl"
            radius="md"
            mt="xl"
            className="prose max-w-none"
            style={{
              backgroundColor: 'var(--mantine-color-gray-0)',
            }}
          >
            <div className="content-wrapper">
              {item.Content?.map((block, index) => (
                <ContentBlock key={index} block={block} />
              ))}
            </div>
          </Paper>
          <Paper withBorder p="md" radius="md" mt="xl">
            <Group justify="space-between">
              <Group gap="xs">
                <ThemeIcon size="md" variant="light">
                  <IconLink size={16} />
                </ThemeIcon>
                <Text size="sm" fw={500}>
                  Article ID: {item.documentId}
                </Text>
              </Group>
            </Group>
          </Paper>
        </Stack>
      </Paper>
    </Container>
  );
};

export default ViewArticle;
