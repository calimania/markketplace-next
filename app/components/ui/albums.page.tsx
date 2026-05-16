'use client';

import { Album, AlbumTrack, } from '@/markket/album';
import { Store } from "@/markket/store.d";
import {
  Title,
  Text,
  Container,
  Group,
  SimpleGrid,
  Paper,
  Card,
  Badge,
  Stack,
  Box,
  Image,
  AspectRatio,
  Overlay,
} from "@mantine/core";
import { markketColors } from '@/markket/colors.config';
import PageContent from "@/app/components/ui/page.content";
import AlbumNav from '@/app/components/ui/album.nav';

import { motion } from 'framer-motion';
import Link from 'next/link';
import './albums.page.css';

// @ts-expect-error Card is a special polymorphic component
const MotionCard = motion(Card);

type AlbumPageProps = {
  store: Store;
  album: Album;
};

const AlbumPage = ({ store, album }: AlbumPageProps) => {

  return (
    <Box>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <Box pos="relative" h={{ base: 240, sm: 300 }} mb="xl" style={{ borderRadius: '18px', overflow: 'hidden' }}>
          <Image
            src={album.cover?.url || album.SEO?.socialImage?.url}
            alt={album.title}
            fallbackSrc="https://placehold.co/1200x450?text=Album"
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
            gradient="linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.65) 100%)"
            opacity={1}
            zIndex={1}
          />
          <Container size="lg" style={{ height: '100%', position: 'relative', zIndex: 2 }}>
            <Group justify="space-between" align="flex-end" h="100%" pb="lg">
              <Stack gap="sm">
                <Badge
                  size="md"
                  radius="lg"
                  style={{
                    background: markketColors.sections.blog.light,
                    color: markketColors.sections.blog.main,
                    border: `1px solid ${markketColors.sections.blog.main}44`,
                  }}
                >
                  {album.tracks?.length} Track{album.tracks?.length !== 1 ? 's' : ''}
                </Badge>
                <Title c="white" style={{ lineHeight: 1.1 }}>{album.title}</Title>
              </Stack>
              {store && (
                <Group gap="xs">
                  {(store.Favicon?.url || store.Logo?.url) && (
                    <Image
                      src={store.Favicon?.url || store.Logo?.url}
                      width={28}
                      height={28}
                      radius="sm"
                      alt={store.title}
                    />
                  )}
                  <Text c="white" fw={500} size="sm">
                    {store.title}
                  </Text>
                </Group>
              )}
            </Group>
          </Container>
        </Box>

        <Container size="lg">
          {album.description && (
            <Text size="md" mt="lg" mb="md" lh={1.7} c={markketColors.neutral.mediumGray}>
              {album.description}
            </Text>
          )}
          {album.content && (
            <Paper withBorder p="lg" radius="lg" mb="lg" style={{ borderColor: markketColors.neutral.lightGray }}>
              <PageContent params={{ album }} />
            </Paper>
          )}

          <Stack gap="lg" mt="xl">
            <Group justify="flex-start" gap="xs">
              <Badge size="sm" radius="md" style={{ background: markketColors.neutral.lightGray, color: markketColors.neutral.darkGray }}>
                Playlist
              </Badge>
            </Group>

            <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg">
              {album.tracks?.map((track: AlbumTrack, idx: number) => (
                <Card
                  key={track.id}
                  withBorder
                  radius="lg"
                  padding="md"
                  className="album-track-card"
                  style={{
                    border: `1px solid ${markketColors.neutral.lightGray}`,
                    background: '#fff',
                    transition: 'all 0.25s ease',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <AspectRatio ratio={16 / 9} className="album-track-img-wrap" style={{ marginBottom: 0 }}>
                    <Box
                      style={{
                        position: 'absolute',
                        inset: 0,
                        borderRadius: '12px',
                        overflow: 'hidden',
                      }}
                    >
                      <Image
                        src={track.media?.[0]?.url || track.SEO?.socialImage?.url}
                        alt={track.title}
                        fallbackSrc="https://placehold.co/600x400?text=Track"
                        className="album-track-img"
                        style={{
                          objectFit: 'cover',
                          objectPosition: 'center',
                          width: '100%',
                          height: '100%',
                          display: 'block',
                          transition: 'transform 0.3s ease',
                        }}
                      />
                      <Overlay
                        gradient="linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, .3) 100%)"
                        opacity={1}
                      />
                      <Box
                        style={{
                          position: 'absolute',
                          bottom: 8,
                          right: 8,
                          zIndex: 2,
                          background: 'rgba(0, 0, 0, 0.5)',
                          color: 'white',
                          borderRadius: '6px',
                          padding: '4px 8px',
                          fontSize: '12px',
                          fontWeight: 600,
                        }}
                      >
                        {idx + 1}
                      </Box>
                    </Box>
                  </AspectRatio>
                  <Stack gap="xs" mt="md" style={{ flex: 1 }}>
                    <Link href={`/store/${store.slug}/${album.slug}/${track.slug}`} style={{ textDecoration: 'none' }}>
                      <Text fw={600} size="md" lineClamp={2} className="album-track-title" c={markketColors.neutral.charcoal}>
                        {track.title}
                      </Text>
                    </Link>
                    {track.description && (
                      <Text size="sm" c={markketColors.neutral.mediumGray} lineClamp={2} className="album-track-desc">
                        {track.description}
                      </Text>
                    )}
                  </Stack>
                </Card>
              ))}
            </SimpleGrid>
          </Stack>
        </Container>
        <AlbumNav store={store} />
      </motion.div>
    </Box>
  );
};

export default AlbumPage;
