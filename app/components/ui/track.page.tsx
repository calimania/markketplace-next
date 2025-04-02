'use client';

import { AlbumTrack } from '@/markket/album';
import { Store } from "@/markket/store.d";
import {
  Title, Text, Container, Group, Paper, Stack, Box,
  Image, AspectRatio, Overlay, Grid, ThemeIcon, Badge,
} from "@mantine/core";
import {
  IconLink, IconPhoto, IconMusic, IconCalendar,
  IconBrandSpotify, IconBrandSoundcloud, IconBrandYoutube
} from '@tabler/icons-react';
import PageContent from '@/app/components/ui/page.content';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

const MotionPaper = motion(Paper as any);
const MotionContainer = motion(Container);

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

const getLinkIcon = (url: string) => {
  if (url.includes('spotify')) return IconBrandSpotify;
  if (url.includes('soundcloud')) return IconBrandSoundcloud;
  if (url.includes('youtube')) return IconBrandYoutube;
  return IconLink;
};

const TrackPage = ({ store, track }: { store: Store; track: AlbumTrack }) => {
  return (
    <AnimatePresence>
      <Box>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          {/* Hero Section */}
          <Box pos="relative" style={{ overflow: 'hidden' }}>
            <Box
              pos="absolute"
              top={0}
              left={0}
              right={0}
              h={400}
              style={{
                // backgroundImage: `url(${track.media?.[0]?.url || track.SEO?.socialImage?.url})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                filter: 'blur(10px)',
                transform: 'scale(1.1)',
              }}
            />
            <Overlay
              gradient="linear-gradient(180deg, rgba(233, 4, 148, 0.3) 0%, rgba(215, 0, 61, 0.9) 90%)"
              opacity={0.95}
              zIndex={1}
            />

            <Container size="lg" py={80} pos="relative" style={{ zIndex: 2 }}>
              <Grid align="center" gutter={40}>
                <Grid.Col span={{ base: 12, md: 4 }}>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <AspectRatio ratio={1} className="track-cover rounded-xl" bg={'white'} >
                      <Image
                        src={track.media?.[0]?.url || track.SEO?.socialImage?.url}
                        alt={track.title}
                        style={{
                          borderRadius: '12px',
                          boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
                        }}
                      />
                    </AspectRatio>
                  </motion.div>
                </Grid.Col>

                <Grid.Col span={{ base: 12, md: 8 }}>
                  <Stack justify="space-between" h="100%" gap="lg">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      <Group gap="xs" mb="md">
                        <ThemeIcon size="md" variant="light" radius="xl">
                          <IconMusic size={16} />
                        </ThemeIcon>
                        <Badge size="lg" variant="light">Track</Badge>
                        {track.publishedAt && (
                          <Group gap="xs">
                            <IconCalendar size={16} style={{ color: 'white' }} />
                            <Text size="sm" c="white">
                              {new Date(track.publishedAt).toLocaleDateString()}
                            </Text>
                          </Group>
                        )}
                      </Group>
                      <Title c="white" size="h1" mb="md">{track.title}</Title>
                      {track.description && (
                        <Text c="#FFF" size="lg" maw={600}>
                          {track.description}
                        </Text>
                      )}
                    </motion.div>

                    {store && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                      >
                        <Paper
                          p="md"
                          radius="md"
                          style={{
                            backgroundColor: 'rgba(255,255,255,0.1)',
                            backdropFilter: 'blur(10px)',
                          }}
                        >
                          <Link href={`/store/${store.slug}`} style={{ textDecoration: 'none' }}>
                            <Group gap="md">
                              <Image
                                src={store.Favicon?.url || store.Logo?.url}
                                width={40}
                                height={40}
                                radius="sm"
                                alt={store.title}
                              />
                              <div>
                                <Text size="xs" c="#DDD"><strong>Published by</strong></Text>
                                <Text c="white" fw={500} size="lg">
                                  {store.title}
                                </Text>
                              </div>
                            </Group>
                          </Link>
                        </Paper>
                      </motion.div>
                    )}
                  </Stack>
                </Grid.Col>
              </Grid>
            </Container>
          </Box>
          {/* Links Section */}
          {track.urls && track.urls.length > 0 && (
            <MotionContainer
              size="lg"
              variants={container}
              initial="hidden"
              animate="show"
            >
              <MotionPaper
                withBorder
                p="xl"
                radius="md"
                mb="xl"
                variants={item}
              >
                <Stack gap="lg">
                  <Title order={3}>Links</Title>
                  <Grid>
                    {track.urls.map((url) => {
                      const LinkIcon = getLinkIcon(url.URL);
                      return (
                        <Grid.Col key={url.id} span={{ base: 12, sm: 6, md: 4 }}>
                          <motion.div
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <Paper
                              component={Link}
                              href={url.URL}
                              target="_blank"
                              withBorder
                              p="md"
                              radius="md"
                            >
                              <Group>
                                <ThemeIcon
                                  size="xl"
                                  radius="md"
                                  variant="light"
                                  color={url.URL.includes('spotify') ? 'green' : 'blue'}
                                >
                                  <LinkIcon size={20} />
                                </ThemeIcon>
                                <Text size="lg" fw={500}>
                                  {url.Label || 'Listen Online'}
                                </Text>
                              </Group>
                            </Paper>
                          </motion.div>
                        </Grid.Col>
                      );
                    })}
                  </Grid>
                </Stack>
              </MotionPaper>
            </MotionContainer>
          )}

          {/* Media Gallery */}
          {track.media?.length > 0 && (
            <MotionContainer size="lg">
              <MotionPaper
                withBorder
                p="xl"
                radius="md"
                mb="xl"
                variants={item}
              >
                <Stack gap="lg">
                  <Group justify="space-between">
                    <Title order={3}>Gallery</Title>
                    <Badge
                      size="lg"
                      leftSection={<IconPhoto size={14} />}
                    >
                      {track.media.length} photos
                    </Badge>
                  </Group>
                  <Grid>
                    {track.media?.map((media, index) => (
                      <Grid.Col span={{ base: 12, sm: 6 }} key={media.id}>
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          whileHover={{ scale: 1.02 }}
                        >
                          <AspectRatio ratio={16 / 9}>
                            <Image
                              src={media.url}
                              alt={media.alternativeText || track.title}
                              radius="md"
                            />
                          </AspectRatio>
                        </motion.div>
                      </Grid.Col>
                    ))}
                  </Grid>
                </Stack>
              </MotionPaper>
            </MotionContainer>
          )}

          {/* Content Section */}
          <MotionContainer>
            <motion.div variants={item}>
              <PageContent params={{ track }} />
            </motion.div>
          </MotionContainer>
        </motion.div>
      </Box>
    </AnimatePresence>
  );
};

export default TrackPage;
