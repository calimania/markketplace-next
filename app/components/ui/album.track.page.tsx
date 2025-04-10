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
  Stack,
  Box,
  Image,
  AspectRatio,
  Overlay,
  Grid,
} from "@mantine/core";
import PageContent from "@/app/components/ui/page.content";
import { IconLink, } from '@tabler/icons-react';
import { motion } from 'framer-motion';
import AlbumNav from './album.nav';
import Link from 'next/link';

// @ts-expect-error Card is a special polymorphic component
const MotionCard = motion(Card);

type AlbumPageProps = {
  store: Store;
  album: Album;
  track: AlbumTrack;
};

const TrackPage = ({ store, album, track }: AlbumPageProps) => {

  return (
    <Box>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
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
          <Title order={2} mt="lg" mb="lg">
            {track.title}
          </Title>
          <PageContent params={{ track }} />
        </Container>
        {track.media?.length && <Container size="lg">
          <Paper withBorder p="lg" radius="md" mb="xl">
            <Grid>
              {track.media?.map((media) => {
                return (
                  <Grid.Col span={{ xs: 12, sm: 12, md: 6 }} key={media.id}>
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 3 }}>
                      <AspectRatio ratio={16 / 9} mb="lg">
                        <Image
                          src={media.url}
                          alt={media.alternativeText || media.alternativeText || track.title}
                        />
                      </AspectRatio>
                    </motion.div>
                  </Grid.Col>
                );
              })}
            </Grid>
          </Paper>
        </Container>}

        <Container size="lg">
          {track.urls && track.urls.length > 0 && (
            <Paper withBorder p="lg" radius="md" mb="xl">
              <Stack gap="md">
                <Title order={3}>Links</Title>
                {track.urls.map((url) => (
                  <Group key={url.id} gap="xs">
                    <IconLink size={16} />
                    <Text size="lg" fw={500}>
                      <Link href={url.URL} target="_blank">
                        {url.Label || url.URL}
                      </Link>
                    </Text>
                  </Group>
                ))}
              </Stack>
            </Paper>
          )}
        </Container>

        <AlbumNav store={store} album={album} />

        <Container size="lg" className="mt-18 mb-9">
          <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="lg">
            {album.tracks?.map((track: AlbumTrack) => (
              <MotionCard
                key={track.id}
                withBorder
                radius="md"
                padding="lg"
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 }
                }}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
              >
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
                    <Link href={`/store/${store.slug}/${album.slug}/${track.slug}`}>{track.title}</Link>
                  </Text>

                  <Text size="sm" c="dimmed" lineClamp={2}>
                    {track.description}
                  </Text>
                </Stack>
              </MotionCard>
            ))}
          </SimpleGrid>
        </Container>
      </motion.div>
    </Box>
  );
};

export default TrackPage;
