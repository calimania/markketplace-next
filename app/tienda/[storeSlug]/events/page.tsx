import { Button } from '@mantine/core';
import { IconListSearch, IconPlus } from '@tabler/icons-react';
import { strapiClient } from '@/markket/api.strapi';
import type { Event } from '@/markket/event';
import EventsTabs from './events.tabs';
import TiendaListShell from '@/app/components/ui/tienda.list.shell';

type TiendaEventsPageProps = {
  params: Promise<{ storeSlug: string }>;
};

export default async function TiendaEventsPage({ params }: TiendaEventsPageProps) {
  const { storeSlug } = await params;

  const eventsResponse = await strapiClient.getEvents(storeSlug);

  const upcomingThreshold = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const allEvents = ((eventsResponse?.data || []) as Event[])
    .filter((event) => {
      if (!event.startDate) return false;
      const parsed = new Date(event.startDate);
      return !Number.isNaN(parsed.getTime());
    });

  const upcomingEvents = allEvents
    .filter((event) => new Date(event.startDate) >= upcomingThreshold)
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

  const pastEvents = allEvents
    .filter((event) => new Date(event.startDate) < upcomingThreshold)
    .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());

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
      actions={
        <>
          <Button
            component="a"
            href={`/dashboard/events?store=${encodeURIComponent(storeSlug)}`}
            variant="default"
            leftSection={<IconListSearch size={16} />}
          >
            Open Editor
          </Button>
          <Button component="a" href={`/tienda/${storeSlug}/events/new`} leftSection={<IconPlus size={16} />}>
            New Event
          </Button>
        </>
      }
    >
      <EventsTabs storeSlug={storeSlug} upcomingEvents={upcomingEvents} pastEvents={pastEvents} />
    </TiendaListShell>
  );
}
