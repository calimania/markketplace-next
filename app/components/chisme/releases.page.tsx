'use client';

import {
  Container,
  Title,
  Paper,
  Text,
  Group,
  Badge,
  Stack,
  Button,
  Card,
  SimpleGrid,
  Box,
  Skeleton,
  Center,
} from '@mantine/core';
import { IconCalendarEvent, IconCompass, IconBuildingStore, IconNews, IconBrandGoogle, IconBrandVlc } from '@tabler/icons-react';
import { formatReleaseDate, Release } from '@/app/utils/cision';
import { Store, Page } from '@/markket';
import { useEffect, useState } from 'react';

import PageContent from '@/app/components/ui/page.content';
import classes from './chisme.module.css';


type ReleasesPageProps = {
  news: Release[];
  store?: Store;
  page?: Page;
}

export default function ReleasesPage({ news: _news, store, page }: ReleasesPageProps) {
  const [news, setNews] = useState(_news || []);
  const [loading, setLoading] = useState(true);

  const getData = async () => {
    const response = await fetch(`/api/chisme`, {});
    const json = await response.json();
    setNews(json?.data || []);
    setLoading(false);
  }

  useEffect(() => {
    getData();
  }, []);


  return (
    <Container size="lg" py="xl">
      <Paper
        radius="md"
        withBorder
        p="xl"
        mb="xl"
        style={{
          backgroundImage: 'linear-gradient(to right, #f0f2f5, #e6e9f0)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <Box
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: '150px',
            height: '150px',
            opacity: 0.1,
            transform: 'translate(30%, -30%)'
          }}
        >
          <IconNews size={150} stroke={1.5} />
        </Box>
        <Stack py="lg">
          <Group>
            <Title order={1}>{page?.Title || 'Latest News Releases'}</Title>
            {store && (
              <Badge
                size="lg"
                color="blue"
                variant="outline"
                leftSection={<IconBuildingStore size={14} />}
              >
                {store.title}
              </Badge>
            )}
          </Group>
        </Stack>
      </Paper>
      {page?.Content?.length && (
        <Paper withBorder radius="md" p="lg" mb="xl">
          <Box mb="md">
            <PageContent params={{ page }} />
          </Box>
        </Paper>
      )}

      {loading && (
        <>
          <Skeleton height={50} circle mb="xl" />
          <Skeleton height={32} radius="xs" />
          <Skeleton height={32} mt={6} radius="xs" />
          <Skeleton height={32} mt={6} width="70%" radius="xs" />
        </>
      )}

      {!loading && (news?.length ? (
        <SimpleGrid
          cols={1}
        >
          {news.map((release, index) => (
            <Card
              key={release.release_id || index}
              withBorder
              radius="md"
              p="md"
              className={classes.releaseCard}
            >
              <div id={`#${release.release_id}`}>
                <Group>
                  {!!release.multimedia && (
                    <div style={{ overflow: 'hidden', whiteSpace: 'nowrap', width: '100%' }}>
                      {release.multimedia.map((m, i) => (
                        <img
                          src={m.thumbnailurl}
                          alt={m.caption}
                          key={i}
                          style={{
                            display: 'inline-block',
                            width: '100px',
                            height: '100px',
                            objectFit: 'cover',
                            marginRight: '8px',
                            borderRadius: '8px',
                          }}
                        />
                      ))}
                    </div>
                  )}
                  <Group>
                    <Text fw={700} size="lg">
                      {release.title}
                    </Text>
                  </Group>
                  <Badge
                    color={release.status === 'published' ? 'green' : 'blue'}
                    variant="light"
                  >
                    {release.status}
                  </Badge>
                </Group>
              </div>
              <div>
                <Group >
                  <Group>
                    <IconCalendarEvent size={16} stroke={1.5} />
                    <Text size="sm" color="dimmed">
                      {formatReleaseDate(release.date)}
                    </Text>
                  </Group>

                  {release.company && release.company.length > 0 && (
                    <Group >
                      {release.company.map((company, i) => (
                        <Badge key={i} size="sm" variant="outline">
                          {company}
                        </Badge>
                      ))}
                    </Group>
                  )}
                </Group>
              </div>
              <Group mt="md">
                <Button
                  component="a"
                  href={`/chisme/${release.release_id}`}
                  target={release.release_id}
                  rel="noopener noreferrer"
                  variant="light"
                  radius="md"
                  size="sm"
                  leftSection={<IconBrandVlc size={18} />}
                >
                  View
                </Button>
                <Button
                  component="a"
                  href={`https://google.com/search?q="${encodeURIComponent(release.title)}" ${release?.company?.[0]}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="light"
                  radius="md"
                  size="sm"
                  leftSection={<IconBrandGoogle size={18} />}
                >
                  Read more
                </Button>
              </Group>
            </Card>
          ))}
        </SimpleGrid>
      ) : (
        <Center py="xl">
          <Stack align="center" >
            <IconNews size={48} stroke={1.5} opacity={0.5} />
            <Text size="xl" color="dimmed">
              No news releases available at this time.
            </Text>
          </Stack>
        </Center>
      ))}

      {store && (
        <Paper withBorder p="md" radius="md" mt="xl">
          <Group >
            <Group>
              <IconBuildingStore size={20} />
              <Text fw={500}>{store.title}</Text>
            </Group>
            {store.Description && (
              <Text size="sm" color="dimmed" style={{ maxWidth: '70%' }}>
                {typeof store.Description === 'string' && store.Description.length > 100
                  ? `${store.Description.substring(0, 100)}...`
                  : store.Description}
              </Text>
            )}
          </Group>
        </Paper>
      )}

      <Paper withBorder p="md" radius="md" mt="xl">
        <Group >
          <Group>
            <IconCompass size={20} />
            <Text fw={500} c="cyan"><a href="https://www.prnewswire.com/" target='_blank'>PR News Wire</a></Text>
          </Group>
        </Group>
      </Paper>
    </Container>
  );
};
