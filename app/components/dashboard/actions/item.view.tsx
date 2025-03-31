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
} from '@mantine/core';
import {  Article, Product, Album, Store } from '@/markket';
import {
  IconCalendar,
  IconClock,
  IconBubbleTea,
} from '@tabler/icons-react';
import { format } from 'date-fns';
import { ContentBlock } from '../content.blocks.view';
import SEOPreview from '../seo.preview';
import { ContentItem } from '@/app/hooks/common';

const ViewItem = ({ item, store, singular  }: { item: ContentItem, store: Store, singular: string,  }) => {

  return (
    <Container size="md" py="xl" >
      {item?.SEO && (
        <SEOPreview
           SEO={item?.SEO}
           previewUrl={`/store/${store.slug}/blog/${item.slug}`} />
      )}
      <Paper shadow="sm" p="xl" radius="md" withBorder mt={'sm'}>
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
               {(item as Article).Title || (item as Album).title || (item as Product).Name}
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
              <Group gap="xs">
                <ThemeIcon size="md" variant="light" color="grape">
                  <IconBubbleTea size={16} />
                </ThemeIcon>
                <Text size="sm">
                  {singular}
                </Text>
              </Group>
            </Group>
            {item.Tags && (
              <>
                <Divider />
                <Group gap="xs">
                  {(item as Article)?.Tags?.map(tag => (
                    <Badge
                      key={tag.id}
                      variant="dot"
                      size="lg"
                      radius="sm"
                      color={tag.Color}
                    >
                      {tag.Label}
                    </Badge>
                  ))}
                </Group>
              </>
            )}
          </Stack>
          {item.Content && (
            <Paper
              withBorder
              p="xl"
              radius="md"
              mt="xl"
              className="prose max-w-none content-wrapper"
              style={{
                backgroundColor: 'var(--mantine-color-gray-0)',
              }}
            >
              {item?.Content?.map((block: ContentBlock, index: number) => (
                <ContentBlock key={index} block={block} />
              ))}
            </Paper>
          )}
        </Stack>
      </Paper>
    </Container>
  );
};

export default ViewItem;
