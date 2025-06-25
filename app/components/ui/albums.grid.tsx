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
import './albums.grid.css';

interface AlbumCardProps {
  album: Album;
  store_slug: string;
}

interface AlbumsProps {
  albums: Album[];
  store_slug: string;
}

function AlbumCard({ album, store_slug }: AlbumCardProps) {
  const description = album.description || album?.SEO?.metaDescription;

  return (
    <Link href={`/store/${store_slug}/${album.slug}`} style={{ textDecoration: 'none' }}>
      <Card
        shadow="sm"
        padding="lg"
        radius="md"
        withBorder
        className="album-card-neobrutal"
        style={{
          borderWidth: 3,
          borderColor: '#222',
          borderStyle: 'solid',
          boxShadow: '6px 6px 0 #222',
          background: '#fffbe6',
          transition: 'box-shadow 0.2s, border-color 0.2s, background 0.2s, transform 0.2s',
        }}
      >
        <AspectRatio ratio={16 / 9} pos="relative" className="album-card-img-wrap">
          <Image
            src={album.cover?.url || album.SEO?.socialImage?.url}
            alt={album.title}
            style={{ objectFit: 'cover', objectPosition: 'top', width: '100%', height: '100%', borderRadius: 0, display: 'block', transition: 'transform 0.3s cubic-bezier(.4,2,.6,1)' }}
            className="album-card-img"
          />
          <Overlay
            gradient="linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, .85) 90%)"
            opacity={0.5}
          />
        </AspectRatio>
        <Title order={3} lineClamp={2} className="album-card-title" mt="md">
          {album.title}
        </Title>
        <Badge
          leftSection={<IconUsers size={14} />}
          variant="light"
          mt="sm"
          className="album-card-badge"
        >
          {album.tracks.length} tracks
        </Badge>
        {description && (
          <Text size="sm" c="dimmed" mt="sm" className="album-card-desc">
            {description}
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
        cols={{ base: 1, md: 2 }}
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
