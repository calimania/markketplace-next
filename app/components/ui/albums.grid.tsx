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
  Box,
} from '@mantine/core';
import Link from 'next/link';
import { IconMusic } from '@tabler/icons-react';
import { markketColors } from '@/markket/colors.config';
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
        radius="xl"
        withBorder
        className="album-card"
        style={{
          border: `1px solid ${markketColors.neutral.lightGray}`,
          background: '#fff',
          transition: 'all 0.25s ease',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <AspectRatio ratio={16 / 9} pos="relative" className="album-card-img-wrap" style={{ marginBottom: 0, borderRadius: '12px', overflow: 'hidden' }}>
          <Image
            src={album.cover?.url || album.SEO?.socialImage?.url}
            alt={album.title}
            fallbackSrc="https://placehold.co/800x450?text=Album"
            style={{ objectFit: 'cover', objectPosition: 'center', width: '100%', height: '100%', display: 'block', transition: 'transform 0.3s ease' }}
            className="album-card-img"
          />
          <Overlay
            gradient="linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, .45) 100%)"
            opacity={1}
          />
        </AspectRatio>
        <Box style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <Title order={3} lineClamp={2} className="album-card-title" mt="md" size="h5" fw={700}>
            {album.title}
          </Title>
          <Badge
            leftSection={<IconMusic size={12} />}
            size="sm"
            radius="md"
            variant="light"
            mt="sm"
            className="album-card-badge"
            style={{
              background: `${markketColors.sections.blog.main}20`,
              color: markketColors.sections.blog.main,
              border: `1px solid ${markketColors.sections.blog.main}44`,
            }}
          >
            {album.tracks.length} track{album.tracks.length !== 1 ? 's' : ''}
          </Badge>
          {description && (
            <Text size="sm" c={markketColors.neutral.mediumGray} mt="sm" className="album-card-desc" lineClamp={2} style={{ flex: 1 }}>
              {description}
            </Text>
          )}
        </Box>
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
