import { strapiClient } from '@/markket/api.strapi';
import { generateSEOMetadata } from '@/markket/metadata';
import { Metadata } from 'next';
import { Container, Stack, Title, Text, Paper, Box } from '@mantine/core';
import { IconArticle } from '@tabler/icons-react';
import { markketColors } from '@/markket/colors.config';
import EventsFeed from './feed';
import { Event } from '@/markket';

export async function generateMetadata(): Promise<Metadata> {
  return generateSEOMetadata({
    slug: 'events',
    entity: { url: '/events' },
    defaultTitle: 'Events',
    defaultDescription: 'Upcoming events from the community',
    keywords: ['events', 'stories', 'community', 'creators'],
    type: 'website',
  });
}

const PAGE_SIZE = 6;

export default async function EventDiscoveryPage() {
  const response = await strapiClient.getCommunityEvents(
    { page: 1, pageSize: PAGE_SIZE },
    { sort: 'startDate:asc' },
  );

  const events = response?.data || [];
  const total = response?.meta?.pagination?.total ?? 0;
  const hasMore = events.length < total;

  return (
    <Container size="lg" py={{ base: 'xl', md: 60 }}>
      <Stack gap="xl">
        <Paper
          radius="lg"
          p={{ base: 'lg', md: 48 }}
          style={{
            background: markketColors.gradients.hero,
            border: 'none',
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          <Box
            style={{
              position: 'absolute',
              top: -50,
              right: -50,
              width: 200,
              height: 200,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.07)',
              pointerEvents: 'none',
            }}
          />
          <Stack align="center" gap="md" style={{ position: 'relative', zIndex: 1 }}>
            <Box
              style={{
                width: 64,
                height: 64,
                borderRadius: 16,
                background: 'rgba(255,255,255,0.2)',
                backdropFilter: 'blur(8px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <IconArticle size={30} color="white" stroke={1.5} />
            </Box>
            <Title
              ta="center"
              c="white"
              style={{ fontSize: 'clamp(1.6rem, 5vw, 2.8rem)', fontWeight: 800, lineHeight: 1.2 }}
            >
              Events
            </Title>
            <Text size="md" ta="center" c="rgba(255,255,255,0.85)" maw={480}>
              Some upcoming events across the community
            </Text>
          </Stack>
        </Paper>
        <EventsFeed initialEvents={events as Event[]} initialHasMore={hasMore} pageSize={PAGE_SIZE} />
      </Stack>
    </Container>
  );
}
