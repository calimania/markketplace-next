import { useState } from 'react';
import {
  Accordion,
  Group,
  Text,
  Badge,
  ThemeIcon,
  Stack,
  Image,
  AspectRatio,
  Paper,
} from '@mantine/core';
import { AlbumTrack } from '@/markket/album';
import {
  IconMusic,
  IconLink,
  IconPhoto,
} from '@tabler/icons-react';
import { Carousel as MantineCarousel } from '@mantine/carousel';

interface TracksViewProps {
  tracks: AlbumTrack[];
}

const TrackView = ({ track }: { track: AlbumTrack }) => {
  const [activeSlide, setActiveSlide] = useState(0);

  return (
    <Stack gap="sm">
      {track.description && (
        <Text size="sm" c="dimmed">
          {track.description}
        </Text>
      )}

      {track.media && track.media.length > 0 && (
        <Paper withBorder p="md" radius="md">
          <MantineCarousel
            withIndicators
            height={300}
            slideSize="100%"
            slideGap="md"
            loop
            align="start"
            slidesToScroll={1}
            onSlideChange={setActiveSlide}
          >
            {track.media.map((media, index) => (
              <MantineCarousel.Slide key={media.id}>
                <AspectRatio ratio={16 / 9}>
                  <Image
                    src={media.url}
                    alt={media.alternativeText || `Slide ${index + 1}`}
                    fit="cover"
                  />
                </AspectRatio>
              </MantineCarousel.Slide>
            ))}
          </MantineCarousel>
          <Text size="xs" ta="center" mt="xs" c="dimmed">
            {activeSlide + 1} of {track.media.length}
          </Text>
        </Paper>
      )}

      {track.urls && track.urls.length > 0 && (
        <Stack gap="sm">
          <Text size="sm" fw={500}>
            Related Links:
          </Text>
          {track.urls.map((url) => (
            <Group key={url.id} gap="sm">
              <ThemeIcon size="sm" variant="light">
                <IconLink size={14} />
              </ThemeIcon>
              <Text
                component="a"
                href={url.URL}
                target="_blank"
                size="sm"
                c="blue"
              >
                {url.Label || url.URL}
              </Text>
            </Group>
          ))}
        </Stack>
      )}
    </Stack>
  );
};

export default function TracksView({ tracks }: TracksViewProps) {
  if (!tracks || tracks.length === 0) return null;

  return (
    <Accordion
      variant="separated"
      radius="md"
      defaultValue={tracks[0]?.id.toString()}
    >
      {tracks.map((track) => (
        <Accordion.Item key={track.id} value={track.id.toString()}>
          <Accordion.Control
            icon={
              <ThemeIcon size="lg" variant="light" radius="xl">
                <IconMusic size={18} />
              </ThemeIcon>
            }
          >
            <Group gap="sm">
              <Text fw={500}>{track.title}</Text>
              <Group gap="sm">
                {track.media && (
                  <Badge
                    size="sm"
                    variant="dot"
                    leftSection={<IconPhoto size={12} />}
                  >
                    {track.media.length}
                  </Badge>
                )}
                {track.urls && (
                  <Badge
                    size="sm"
                    variant="dot"
                    color="blue"
                    leftSection={<IconLink size={12} />}
                  >
                    {track.urls.length}
                  </Badge>
                )}
              </Group>
            </Group>
          </Accordion.Control>
          <Accordion.Panel>
            <TrackView track={track} />
          </Accordion.Panel>
        </Accordion.Item>
      ))}
    </Accordion>
  );
};
