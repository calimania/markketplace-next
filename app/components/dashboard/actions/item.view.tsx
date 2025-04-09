'use client';

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
  Collapse,
  Button,
  Accordion,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { Article, Product, Album, Store, URL, Page, AlbumTrack } from '@/markket';
import {
  IconCalendar,
  IconClock,
  IconBubbleTea,
  IconSailboat,
  IconLinkPlus,
  IconCurrencyDollar,
  IconPigMoney,
  IconPhotoHexagon,
  IconAlbum,
} from '@tabler/icons-react';
import { format } from 'date-fns';
import { ContentBlock } from '../content.blocks.view';
import SEOPreview from '../seo.preview';
import { ContentItem } from '@/app/hooks/common';
import { Remarkable } from 'remarkable';
import ImagesView from '../item.images';
import AlbumTrackList from '../album.tracks.component';
import AlbumsView from '../album.page.component';
import { useRouter } from 'next/navigation';

const prefixMap: Record<string, string> = {
  article: 'blog',
  track: 'track',
  page: 'about',
  product: 'product',
  store: 'store',
}


const seoUrl = (preview_url: string | undefined, store: Store, item: ContentItem, prefix?: string) => {
  if (preview_url) return preview_url;

  if (prefix == 'store') return `/store/${item.slug}`;

  if (prefix == 'about' && item.slug == 'home') return `/store/${store.slug}`;

  if (prefix == 'about' && ['products', 'about', 'newsletter', 'blog'].includes(item.slug)) return `/store/${store?.slug}/${item.slug}`

  return `/store/${store?.slug}/${prefix}/${item.slug}`;
}

const ViewItem = ({ item, store, singular, previewUrl }: { item: ContentItem, store: Store, singular: string, previewUrl?: string }) => {
  const md = new Remarkable();
  const [showUrls, { toggle: toggleUrls }] = useDisclosure(false);
  const router = useRouter();

  const seo_url = seoUrl(previewUrl, store, item, prefixMap[singular]);

  const urls = (item as Store).URLS || (item as AlbumTrack)?.urls;

  return (
    <Container size="md" py="xl" >
      {item?.SEO && (
        <SEOPreview
           SEO={item?.SEO}
          previewUrl={seo_url} />
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

            {(item.Tags || item.Tag) && (
              <>
                <Divider />
                <Group gap="xs">
                  {((item as Article)?.Tags || (item as Product).Tag)?.map((tag) => (
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

            {(item as Album)?.description && (
              <>
                <Divider />
                <Text size="sm" c="dimmed">
                  {(item as Album).description}
                </Text>
              </>
            )}
          </Stack>

          {(item.Description || item.Content || item.content) && (
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
              {(item.Content || item.content) && (
                <div className="content-wrapper content-as-block">
                  {(item?.Content || item.content)?.map((block: ContentBlock, index: number) => (
                    <ContentBlock key={index} block={block} />
                  ))}
                </div>
              )}
            </Paper>
          )}

          {urls && (
            <Paper p="xl" radius="md" withBorder mt="xl">
              <Group justify="left" mb={5}>
                <IconLinkPlus size={16} />
                <Button onClick={() => toggleUrls()}> {showUrls ? 'Hide URLs' : 'Show URLs'} [{urls.length}]</Button>
              </Group>
              <Collapse in={showUrls}>
                {urls.map((url: URL, index: number) => {
                  return (
                    <Text key={index} mb="xs" mt="xl">
                      <a
                        href={url.URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline hover:text-blue-800"
                      >
                        {url.Label}
                      </a>
                    </Text>
                  );
                })}
              </Collapse>
            </Paper>
          )}

          {(item as Page)?.albums && (
            <Paper withBorder p="xl" radius="md" mt="xl">
              <Group mb="md">
                <ThemeIcon size="md" variant="light" color="grape">
                  <IconAlbum size={16} />
                </ThemeIcon>
                <Text fw={500}>Related Albums</Text>
              </Group>
              <AlbumsView
                albums={(item as Page).albums || []}
                onView={(album) => {
                  router.push(`/dashboard/albums/view/${album.documentId}?store=${store.documentId}`);
                }}
              />
            </Paper>
          )}

          {(item as Album)?.tracks && (
            <Paper p="xl" radius="md" withBorder mt="xl">
              <Group gap="xs" mb="lg">
                <IconPhotoHexagon size={16} color="blue" /> Tracks
              </Group>
              <AlbumTrackList tracks={(item as Album).tracks} />
            </Paper>
          )}

          {(item as Product)?.PRICES && (
            <Group gap="xs">
              <IconPigMoney size={16} color={item.SKU ? 'green' : 'red'} />Prices
            </Group>)}
          <Accordion defaultValue={['']} multiple mb="lg">
            {(item as Product)?.PRICES?.map((item, index) => (
              <Accordion.Item key={item.Name} value={index.toString()}>
                <Accordion.Control icon={<IconCurrencyDollar color={item.STRIPE_ID ? 'green' : 'red'} />}>
                  {item.Price} {item.Currency} - {item.Name}
                </Accordion.Control>
                <Accordion.Panel>
                  {item.Description}
                </Accordion.Panel>
              </Accordion.Item>
            ))}
          </Accordion>
          <div>
            <Group gap="xs" mb="lg">
              <IconPhotoHexagon size={16} color="magenta" /> Images
            </Group>
            {['Cover', 'Logo', 'media', 'Favicon', 'Slides', 'socialImage', 'Thumbnail', 'image', 'images', 'photo', 'photos', 'picture', 'pictures', 'SEO.socialImage'].map((name) => (
              <ImagesView
                key={name}
                item={item as ContentItem & Record<string, any>}
                name={name as any}
                multiple={item[name] && Array.isArray(item[name])}
              />
            ))}
          </div>
        </Stack>
      </Paper>
    </Container>
  );
};

export default ViewItem;
