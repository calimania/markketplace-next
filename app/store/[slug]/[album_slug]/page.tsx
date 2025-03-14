import { strapiClient } from "@/markket/api.strapi";
import { Album } from "@/markket/album";
import {
  Title,
  Text,
  Container,
  Paper,
  Group,
  SimpleGrid,
  Card,
  Badge,
  Stack,
  Box,
  Image,
  AspectRatio,
  Overlay,
} from "@mantine/core";
import { IconLink } from "@tabler/icons-react";
import { notFound } from "next/navigation";
import PageContent from "@/app/components/ui/page.content";

import { generateSEOMetadata } from '@/markket/metadata';

export async function generateMetadata({ params }: any) {
  const { slug, album_slug } = await params;

  const response = await strapiClient.getAlbum(album_slug, slug);
  const collection = response?.data?.[0] as Album;

  return generateSEOMetadata({
    slug,
    entity: {
      url: `/store/${slug}/${album_slug}`,
      SEO: collection?.SEO,
    },
    type: 'article',
  });
};

type AlbumPageProps = {
  params: Promise<{
    slug: string;
    album_slug: string
  }>;
};

const AlbumPage = async ({params}: AlbumPageProps) => {
  const { slug, album_slug } = await params;

  const { data } = await strapiClient.getAlbum(album_slug, slug);
  const { data: [store] } = await strapiClient.getStore(slug);

  const album = data[0] as Album;

  if (!album || !store) {
    return notFound();
  }

  return (
    <Box>
      <Box pos="relative" h={300} mb="xl">
        <Image
          src={album.cover?.url || album.SEO?.socialImage?.url}
          alt={album.title}
          height={300}
          style={{
            position: 'absolute',
            width: '100%',
            overflow: 'hidden',
            objectFit: 'cover',
            maxHeight: 300,
          }}
        />
        <Overlay
          gradient="linear-gradient(180deg, rgba(42, 0, 243, 0.1) 0%, rgba(42, 0, 243, 0.9) 90%)"
          opacity={0.8}
          zIndex={1}
        />
        <Container size="lg" style={{ height: '100%', position: 'relative', zIndex: 2 }}>
          <Group justify="space-between" align="flex-end" h="100%" pb="lg">
            <div>
              <Badge size="lg" radius="sm" variant="filled" color="blue" mb="md">
                {album.tracks?.length} Tracks
              </Badge>
              <Title c="white">{album.title}</Title>
            </div>
            {store && (
              <Group gap="xs">
                <Image
                  src={store.Favicon?.url || store.Logo?.url}
                  width={24}
                  height={24}
                  radius="sm"
                  alt={store.title}
                />
                <Text c="white" fw={500}>
                  {store.title}
                </Text>
              </Group>
            )}
          </Group>
        </Container>
      </Box>

      <Container size="lg">
        <Text size="lg" mt="xs">
          {album.description}
        </Text>
        {album.content && (
          <Paper withBorder p="xl" radius="md" mb="xl">
            <PageContent params={{ album }} />
          </Paper>
        )}

        <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="lg">
          {album.tracks?.map((track) => (
            <Card key={track.id} withBorder radius="md" padding="lg">
              <div className="mb-md">
                <AspectRatio ratio={16 / 9}>
                  <Image
                    src={track.SEO?.socialImage?.url}
                    alt={track.title}
                    fallbackSrc="https://placehold.co/600x400?text=Track"
                  />
                </AspectRatio>
              </div>
              <Stack mt="md" gap="xs">
                <Text fw={500} size="lg" lineClamp={2}>
                  {track.title}
                </Text>

                <Text size="sm" c="dimmed" lineClamp={2}>
                  {track.description}
                </Text>

                {track.URLS && track.URLS.length > 0 && (
                  <Group gap="xs" mt="xs">
                    <IconLink size={16} />
                    <Text size="sm" c="dimmed">
                      {track.URLS.length} links
                    </Text>
                  </Group>
                )}
              </Stack>
            </Card>
          ))}
        </SimpleGrid>
      </Container>
    </Box>
  );
};

export default AlbumPage;
