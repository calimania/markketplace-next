'use client';

import {  AlbumTrack, } from '@/markket/album';
import { Store } from "@/markket/store.d";
import {
  Title,
  Text,
  Container,
  Group,
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
// import AlbumNav from './album.nav';
import Link from 'next/link';

// @ts-expect-error Card is a special polymorphic component
const MotionCard = motion(Card);

type TrackPageProps = {
  store: Store;
  track: AlbumTrack;
};

const TrackPage = ({ store, track }: TrackPageProps) => {

  return (
    <Box>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <Box pos="relative" h={300} mb="xl">
          <Image
            src={track.media?.[0]?.url || track.SEO?.socialImage?.url}
            alt={track.title}
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
                <Title c="white">{track.title}</Title>
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


        <Container>
          <PageContent params={{track: track }} />
        </Container>
        {/* <AlbumNav store={store} album={album} /> */}
      </motion.div>
    </Box>
  );
};

export default TrackPage;
