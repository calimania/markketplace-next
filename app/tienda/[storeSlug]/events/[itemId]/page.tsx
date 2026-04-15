import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Badge, Button, Divider, Paper, Stack, Text } from '@mantine/core';
import { IconExternalLink, IconPhoto } from '@tabler/icons-react';
import SmartBackButton from '@/app/components/ui/smart.back.button';
import TiendaDetailShell from '@/app/components/ui/tienda.detail.shell';
import Markdown from '@/app/components/ui/page.markdown';
import ContentMediaPreview from '@/app/components/ui/content.media.preview';
import PublicLinkActions from '@/app/components/ui/public.link.actions';
import { findEvent } from '../events.find';
import { strapiClient } from '@/markket/api.strapi';
import type { Store } from '@/markket/store';

type TiendaEventItemPageProps = {
  params: Promise<{ storeSlug: string; itemId: string }>;
};

function formatDateTime(value?: string) {
  if (!value) return 'Not set';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleString();
}

export async function generateMetadata({ params }: TiendaEventItemPageProps): Promise<Metadata> {
  const { storeSlug, itemId } = await params;
  const event = await findEvent(itemId, storeSlug);

  return {
    title: event?.Name || 'Event Detail',
  };
}

export default async function TiendaEventItemPage({ params }: TiendaEventItemPageProps) {
  const { storeSlug, itemId } = await params;
  const [event, storeResponse] = await Promise.all([
    findEvent(itemId, storeSlug),
    strapiClient.getStore(storeSlug),
  ]);

  if (!event) notFound();

  const store = storeResponse?.data?.[0] as Store | undefined;
  const editorId = event.documentId || event.slug;
  const itemDocumentId = event.documentId || itemId;
  const storeRef = store?.documentId || store?.slug || storeSlug;
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
          {/* <Button
            component="a"
            href={`/tienda/${storeSlug}/snapshot`}
            variant="default"
            leftSection={<IconPhoto size={16} />}
          >
            Media Studio
          </Button> */}
          <Button component="a" href={`/tienda/${storeSlug}/events/${editorId}/edit`}>
            Edit
          </Button>
        </>
      }
    >
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
          studioHref={`/tienda/${storeSlug}/snapshot`}
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

        <Divider label={
          <Badge variant="dot" color="gray" size="sm">Description</Badge>
        } labelPosition="left" />

        {event.Description && (
          <Paper withBorder p="lg" radius="md" className="prose dark:prose-dark max-w-none">
            <Markdown content={event.Description} />
          </Paper>
        )}
        {!event.Description && event.SEO?.metaDescription && (
          <Paper withBorder p="lg" radius="md">
            {event.SEO.metaDescription}
          </Paper>
        )}
        {!event.Description && !event.SEO?.metaDescription && (
          <Paper withBorder p="lg" radius="md" bg="var(--mantine-color-gray-0)">
            No details yet.
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

        {event.usd_price && event.usd_price > 0 && !event.SEO?.metaUrl && (
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
    </TiendaDetailShell>
  );
}
