'use client';

import { Tabs } from '@mantine/core';
import type { Event } from '@/markket/event';
import NavTable from '@/app/components/ui/nav.table';

type EventsTabsProps = {
  storeSlug: string;
  upcomingEvents: Event[];
  pastEvents: Event[];
};

export default function EventsTabs({ storeSlug, upcomingEvents, pastEvents }: EventsTabsProps) {
  const formatDate = (value?: string) => (value ? new Date(value).toLocaleDateString() : 'No date');

  return (
    <Tabs defaultValue="upcoming" keepMounted={false}>
      <Tabs.List>
        <Tabs.Tab value="upcoming">Upcoming ({upcomingEvents.length})</Tabs.Tab>
        <Tabs.Tab value="past">Past ({pastEvents.length})</Tabs.Tab>
      </Tabs.List>

      <Tabs.Panel value="upcoming" pt="sm">
        <NavTable
          emptyText="No upcoming events yet."
          items={upcomingEvents.map((event) => ({
            key: event.documentId || event.slug,
            title: event.Name || 'Untitled event',
            subtitle: `${formatDate(event.startDate)} · ${event.slug}`,
            href: `/tienda/${storeSlug}/events/${event.documentId || event.slug}`,
            icon: 'event' as const,
          }))}
        />
      </Tabs.Panel>

      <Tabs.Panel value="past" pt="sm">
        <NavTable
          emptyText="No past events yet."
          items={pastEvents.map((event) => ({
            key: event.documentId || event.slug,
            title: event.Name || 'Untitled event',
            subtitle: `${formatDate(event.startDate)} · ${event.slug}`,
            href: `/tienda/${storeSlug}/events/${event.documentId || event.slug}`,
            icon: 'event' as const,
          }))}
        />
      </Tabs.Panel>
    </Tabs>
  );
}
