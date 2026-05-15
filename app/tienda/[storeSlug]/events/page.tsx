import type { Metadata } from 'next';
import { Button } from '@mantine/core';
import { IconPlus, IconListSearch } from '@tabler/icons-react';
import type { Event } from '@/markket/event';
import TiendaListShell from '@/app/components/ui/tienda.list.shell';
import EventListClient from './event-list.client';

type TiendaEventsPageProps = {
  params: Promise<{ storeSlug: string }>;
};

export async function generateMetadata({ params }: TiendaEventsPageProps): Promise<Metadata> {
  const { storeSlug } = await params;
  return { title: `Events · ${storeSlug}` };
}

export default async function TiendaEventsPage({ params }: TiendaEventsPageProps) {
  const { storeSlug } = await params;

  const allEvents: Event[] = [];

  return (
    <TiendaListShell
      breadcrumbs={[
        { label: 'Tienda', href: '/tienda' },
        { label: storeSlug, href: `/tienda/${storeSlug}` },
        { label: 'Events' },
      ]}
      title="Events"
      subtitle={`Upcoming and past events for ${storeSlug}`}
      routePath={`/tienda/${storeSlug}/events`}
      sectionTitle="Events"
      tone="events"
      actions={
        <>
          <Button
            component="a"
            href={`/${storeSlug}/events`}
            variant="default"
            leftSection={<IconListSearch size={16} />}
            target="_blank"
          >
            Open in Markket
          </Button>
          <Button component="a" href={`/tienda/${storeSlug}/events/new`} leftSection={<IconPlus size={16} />}>
            New Event
          </Button>
        </>
      }
    >
      <EventListClient storeSlug={storeSlug} initialEvents={allEvents} />
    </TiendaListShell>
  );
}
