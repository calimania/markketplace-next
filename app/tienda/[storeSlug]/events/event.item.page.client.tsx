'use client';

import { useEffect, useState } from 'react';
import { Badge, Button, Divider, Paper, Stack, Text } from '@mantine/core';
import TiendaItemSkeleton from '@/app/components/ui/tienda.item.skeleton';
import { IconExternalLink, IconEdit } from '@tabler/icons-react';
import SmartBackButton from '@/app/components/ui/smart.back.button';
import TiendaDetailShell from '@/app/components/ui/tienda.detail.shell';
import EventItemActions from './event.item.actions';
import EventDetailTabs from './event.detail.tabs';
import { findEvent } from './events.find';
import ContentMediaPreview from '@/app/components/ui/content.media.preview';
import PublicLinkActions from '@/app/components/ui/public.link.actions';
import { getPublishLabel, isPublished } from '@/markket/helpers.publication';
import { readTiendaAuthToken } from '../content.find';
import type { Event } from '@/markket/event';

type TiendaEventItemPageClientProps = {
  storeSlug: string;
  itemId: string;
};

function formatDateTime(value?: string) {
  if (!value) return 'Not set';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleString();
}

export default function TiendaEventItemPageClient({ storeSlug, itemId }: TiendaEventItemPageClientProps) {
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const token = readTiendaAuthToken();

    if (!token) {
      setError('Authentication required to view this event.');
      setLoading(false);
      return;
    }

    const loadEvent = async () => {
      try {
        const data = await findEvent(itemId, storeSlug, token);
        if (!active) return;

        if (!data) {
          setError('This event could not be found.');
          return;
        }

        setEvent(data);
      } catch (err) {
        console.error('Tienda event item load error', err);
        if (!active) return;
        setError('Unable to load the event. Please refresh.');
      } finally {
        if (active) setLoading(false);
      }
    };

    loadEvent();

    return () => {
      active = false;
    };
  }, [itemId, storeSlug]);

  if (loading) return <TiendaItemSkeleton />;

  if (error || !event) {
    return (
      <TiendaDetailShell
        breadcrumbs={[
          { label: 'Tienda', href: '/tienda' },
          { label: storeSlug, href: `/tienda/${storeSlug}` },
          { label: 'Events', href: `/tienda/${storeSlug}/events` },
          { label: itemId },
        ]}
        title="Event not found"
        routePath={`/tienda/${storeSlug}/events/${itemId}`}
      >
        <Stack gap="md">
          <Text c="dimmed">{error || 'This event does not exist.'}</Text>
          <Button component="a" href={`/tienda/${storeSlug}/events`} variant="outline">
            Back to events
          </Button>
        </Stack>
      </TiendaDetailShell>
    );
  }

  const editorId = event.documentId || event.slug || itemId;
  const itemDocumentId = event.documentId || itemId;
  const storeRef = storeSlug;
  const startsAt = formatDateTime(event.startDate);
  const endsAt = formatDateTime(event.endDate);
  const slideSlots = (event.Slides || []).map((slide, index) => ({
    label: `Slide ${index + 1}`,
    field: 'Slides',
    src: slide?.formats?.small?.url || slide?.url,
    alt: slide?.alternativeText || `${event.Name || 'Event'} slide ${index + 1}`,
  }));

  return (
    <TiendaDetailShell
      breadcrumbs={[
        { label: 'Tienda', href: '/tienda' },
        { label: storeSlug, href: `/tienda/${storeSlug}` },
        { label: 'Events', href: `/tienda/${storeSlug}/events` },
        { label: event.slug || itemId },
      ]}
      title={event.Name || 'Untitled event'}
      routePath={`/tienda/${storeSlug}/events/${event.slug || itemId}`}
      actions={
        <>
          <SmartBackButton fallbackHref={`/tienda/${storeSlug}/events`} />
          <EventItemActions
            storeSlug={storeSlug}
            itemDocumentId={itemDocumentId}
            editorId={editorId}
            isPublished={isPublished(event)}
            publishLabel={getPublishLabel(event)}
          />
        </>
      }
    >
      <EventDetailTabs storeRef={storeRef} eventDocumentId={itemDocumentId} eventNumericId={event.id}>
        <Stack gap="md">
          <Text c="dimmed">{event.SEO?.metaDescription || 'No summary yet.'}</Text>

          <Paper withBorder p="lg" radius="md" bg="var(--mantine-color-gray-0)">
            <Stack gap={4}>
              <Text fw={600}>Schedule</Text>
              <Text size="sm">Starts: {startsAt}</Text>
              <Text size="sm">Ends: {endsAt}</Text>
            </Stack>
          </Paper>

          <ContentMediaPreview
            storeRef={storeRef}
            contentType="event"
            itemDocumentId={itemDocumentId}
            slots={[
              {
                label: 'Thumbnail',
                field: 'Thumbnail',
                src: event.Thumbnail?.url,
                alt: event.Thumbnail?.alternativeText || event.Name,
              },
              {
                label: 'Cover / Social',
                field: 'SEO.socialImage',
                src: event.SEO?.socialImage?.url,
                alt: event.SEO?.socialImage?.alternativeText || event.Name,
              },
              ...slideSlots,
              {
                label: 'Add Slide',
                field: 'Slides',
                alt: `${event.Name || 'Event'} slide`,
              },
            ]}
          />

          <Divider label={<Badge variant="dot" color="gray" size="sm">Description</Badge>} labelPosition="left" />

          {event.Description && (
            <Paper withBorder p="lg" radius="md" className="prose dark:prose-dark max-w-none">
              <Text>{event.Description}</Text>
            </Paper>
          )}
          {!event.Description && event.SEO?.metaDescription && (
            <Paper withBorder p="lg" radius="md">
              {event.SEO.metaDescription}
            </Paper>
          )}
          {!event.Description && !event.SEO?.metaDescription && (
            <Paper withBorder p="lg" radius="md" bg="var(--mantine-color-gray-0)">
              <Text c="dimmed" ta="center" size="sm">No details yet.</Text>
            </Paper>
          )}

          <PublicLinkActions
            path={`/${storeSlug}/events/${event.slug || event.documentId || itemId}`}
            openLabel="Open public event"
          />

          {event.SEO?.metaUrl && (
            <>
              <Divider />
              <Button
                component="a"
                href={event.SEO.metaUrl}
                target="_blank"
                rel="noopener noreferrer"
                size="lg"
                fullWidth
                rightSection={<IconExternalLink size={16} />}
              >
                RSVP at {new URL(event.SEO.metaUrl).hostname}
              </Button>
            </>
          )}

          {event.usd_price != null && event.usd_price > 0 && !event.SEO?.metaUrl && (
            <>
              <Divider />
              <Paper withBorder p="lg" radius="md" bg="var(--mantine-color-blue-0)">
                <Stack gap="sm">
                  <Text fw={600}>Event Details</Text>
                  <Text>Price: ${(event.usd_price / 100).toFixed(2)}</Text>
                  {event.maxCapacity && (
                    <Text size="sm" c="dimmed">
                      Capacity: {event.maxCapacity} people
                    </Text>
                  )}
                </Stack>
              </Paper>
            </>
          )}
        </Stack>
      </EventDetailTabs>
    </TiendaDetailShell>
  );
}
