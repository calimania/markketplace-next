import { Album } from '@/markket/album';
import {
  SimpleGrid,
  Card,
  Image,
  Text,
  Badge,
  Title,
  Container,
  Overlay,
  AspectRatio,
} from '@mantine/core';
import Link from 'next/link';
import { IconUsers } from '@tabler/icons-react';

interface AlbumCardProps {
  album: Album;
  store_slug: string;
}

interface AlbumsProps {
  albums: Album[];
  store_slug: string;
}

function AlbumCard({ album, store_slug }: AlbumCardProps) {

  return (
    <Link href={`/store/${store_slug}/${album.slug}`} style={{ textDecoration: 'none' }}>
      <Card
        shadow="sm"
        padding="lg"
        radius="md"
        withBorder
        className="transform transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
      >
        <>
          <AspectRatio ratio={16 / 9} pos="relative">
            <Image
              src={album.cover?.url || album.SEO?.socialImage?.url}
              alt={album.title}
              height={200}
            />
            <Overlay
              gradient="linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, .85) 90%)"
              opacity={0.5}
            />
          </AspectRatio>
        </>
          <Title order={3} lineClamp={2}>
            {album.title}
          </Title>
          <Badge
            leftSection={<IconUsers size={14} />}
            variant="light"
            mt="sm"
          >
            {album.tracks.length} tracks
          </Badge>
          {album?.SEO?.metaDescription && (
            <Text size="sm" c="dimmed" mt="sm">
              {album.SEO.metaDescription}
            </Text>
          )}
      </Card>
    </Link>
  );
}

export default function Albums({ albums, store_slug }: AlbumsProps) {
  if (!albums?.length) {
    return (
      <></>
    );
  }

  return (
    <Container size="xl" py="xl">
      <SimpleGrid
        cols={{ base: 1, sm: 2, md: 3 }}
        spacing="xl"
        verticalSpacing="xl"
      >
        {albums.map((album) => (
          <AlbumCard
            key={album.documentId}
            store_slug={store_slug}
            album={album}
          />
        ))}
      </SimpleGrid>
    </Container>
  );
};
