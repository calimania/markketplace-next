import type { Metadata } from 'next';
import { Button } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import type { Event } from '@/markket/event';
import TiendaListShell from '@/app/components/ui/tienda.list.shell';
import EventListClient from './event-list.client';

type TiendaEventsPageProps = {
  params: Promise<{ storeSlug: string }>;
};

export const metadata: Metadata = {
  title: 'Events',
};

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
