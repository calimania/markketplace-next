import {
  Accordion,
  Group,
  Text,
  Badge,
  ThemeIcon,
  Stack,
  Image,
  Paper,
  ActionIcon,
  Grid,
  Tooltip,
  Center,
} from '@mantine/core';
import { Album } from '@/markket/album';
import {
  IconAlbum,
  // IconMusic,
  IconExternalLink,
} from '@tabler/icons-react';
// import TracksView from './tracks.view';

interface AlbumsViewProps {
  albums: Album[];
  onView?: (album: Album) => void;
}

export default function AlbumsView({ albums, onView }: AlbumsViewProps) {
  if (!albums || albums.length === 0) return null;

  return (
    <Accordion
      variant="separated"
      radius="md"
      defaultValue={albums[0]?.id.toString()}
    >
      {albums.map((album) => (
        <Accordion.Item key={album.id} value={album.id.toString()}>
          <Center>
            <Accordion.Control
              icon={
                <ThemeIcon size="lg" variant="light" radius="xl" color="grape">
                  <IconAlbum size={18} />
                </ThemeIcon>
              }
            >
            <Group justify="space-between">
              <Group gap="sm">
                <Text fw={500}>{album.title}</Text>
                <Badge size="sm" variant="light" color="grape">
                  {album.tracks?.length || 0} tracks
                </Badge>
              </Group>
            </Group>
            </Accordion.Control>
              {onView && (
                <Tooltip label="View album details">
                  <ActionIcon
                    variant="light"
                    onClick={(e) => {
                      e.stopPropagation();
                      onView(album);
                    }}
                  >
                    <IconExternalLink size={16} />
                  </ActionIcon>
                </Tooltip>
            )}
          </Center>
          <Accordion.Panel>
            <Stack gap="md">
              <Grid>
                {album.cover && (
                  <Grid.Col span={{ base: 12, sm: 4 }}>
                    <Paper withBorder p="xs" radius="md">
                      <Image
                        src={album.cover.formats?.thumbnail?.url || album.cover.url}
                        alt={album.title}
                        radius="md"
                        height={200}
                        fit="cover"
                      />
                    </Paper>
                  </Grid.Col>
                )}
                <Grid.Col span={{ base: 12, sm: album.cover ? 8 : 12 }}>
                  <Stack gap="xs">
                    {album.description && (
                      <Text size="sm" c="dimmed">
                        {album.description}
                      </Text>
                    )}
                    {album.publishedAt && (
                      <Text size="sm">
                        Released: {new Date(album.publishedAt).toLocaleDateString()}
                      </Text>
                    )}
                  </Stack>
                </Grid.Col>
              </Grid>
              {/* Album Tracks */}
              {/* {album.tracks && album.tracks.length > 0 && (
                <Paper withBorder p="md" radius="md">
                  <Group mb="md">
                    <ThemeIcon size="md" variant="light" color="grape">
                      <IconMusic size={16} />
                    </ThemeIcon>
                    <Text fw={500}>Tracks</Text>
                  </Group>
                  <TracksView tracks={album.tracks} />
                </Paper>
              )} */}
            </Stack>
          </Accordion.Panel>
        </Accordion.Item>
      ))}
    </Accordion>
  );
}
