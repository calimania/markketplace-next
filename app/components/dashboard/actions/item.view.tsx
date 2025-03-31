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
  IconSailboat,
} from '@tabler/icons-react';
import { format } from 'date-fns';
import { ContentBlock } from '../content.blocks.view';
import SEOPreview from '../seo.preview';
import { ContentItem } from '@/app/hooks/common';
import { Remarkable } from 'remarkable';
import ImagesView from '../item.images';

const ViewItem = ({ item, store, singular, previewUrl }: { item: ContentItem, store: Store, singular: string, previewUrl?: string }) => {
  const md = new Remarkable();

  return (
    <Container size="md" py="xl" >
      {item?.SEO && (
        <SEOPreview
           SEO={item?.SEO}
          previewUrl={previewUrl || `/store/${store.slug}/blog/${item.slug}`} />
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
                <ThemeIcon size="md" variant="light" color="pink">
                  <IconBubbleTea size={16} />
                </ThemeIcon>
                <Text size="sm">
                  {singular}
                </Text>
              </Group>
            </Group>
            {item.slug && (<Group gap="xs">
              <ThemeIcon size="md" variant="light" color="magenta">
                <IconSailboat size={16} />
              </ThemeIcon>
              <Text size="sm">
                {item.slug}
              </Text>
            </Group>)}

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

          {(item.Description || item.Content) && (
            <Paper
              withBorder
              p="xl"
              radius="md"
              mt="xl"
              className="prose dark:prose-dark max-w-full"
              style={{
                backgroundColor: 'var(--mantine-color-gray-0)',
              }}
            >
              {item.Description && (
                <div
                  className="  content-wrapper content-as-markdown"
                  dangerouslySetInnerHTML={{
                    __html: md.render(item.Description),
                  }} />
              )}
              {item.Content && (
                <div className="content-wrapper content-as-block">
                  {item?.Content?.map((block: ContentBlock, index: number) => (
                    <ContentBlock key={index} block={block} />
                  ))}
                </div>
              )}
            </Paper>
          )}
          {['Cover', 'Logo', 'Favicon', 'Slides', 'socialImage', 'thumbnail', 'image', 'images', 'photo', 'photos', 'picture', 'pictures'].map((name) => (
            <ImagesView
              key={name}
              item={item as ContentItem & Record<string, any>}
              name={name as any}
              multiple={item[name] && Array.isArray(item[name])}
            />
          ))}
        </Stack>
      </Paper>
    </Container>
  );
};

export default ViewItem;
