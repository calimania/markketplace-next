'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { SegmentedControl, Stack } from '@mantine/core';
import NavTable from '@/app/components/ui/nav.table';
import type { Event } from '@/markket/event';
import { tiendaClient } from '@/markket/api.tienda';
import { TIENDA_CONTENT_LIST_QUERY } from '../content.list.queries';
import { isPublished } from '@/markket/helpers.publication';
import { readTiendaAuthToken, parseTiendaResponse, getTiendaItemKey } from '@/markket/helpers.tienda';

type EventListClientProps = {
  storeSlug: string;
  initialEvents: Event[];
};

function sortByDate(items: Event[]) {
  return [...items].sort((a, b) => {
    const aTime = new Date(a.startDate || 0).getTime();
    const bTime = new Date(b.startDate || 0).getTime();
    return aTime - bTime;
  });
}

export default function EventListClient({ storeSlug, initialEvents }: EventListClientProps) {
  const [events, setEvents] = useState<Event[]>(sortByDate(initialEvents || []));
  const [loading, setLoading] = useState(true);
  const [sortMode, setSortMode] = useState<'date' | 'recent' | 'alpha'>('date');

  useEffect(() => {
    let isMounted = true;

    const token = readTiendaAuthToken();
    if (!token) {
      setLoading(false);
      return;
    }

    const loadAllContent = async () => {
      try {
        const response = await tiendaClient.listContent(storeSlug, 'event', {
          token,
          query: TIENDA_CONTENT_LIST_QUERY.event,
        });

        if (!isMounted) return;

        const allItems = parseTiendaResponse<Event>(response);

        if (allItems && allItems.length > 0) {
          setEvents(sortByDate(allItems));
        } else {
          setEvents([]);
        }
      } catch (error) {
        console.error('[EventListClient] Failed to load events:', error);
        if (isMounted) setEvents([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadAllContent();

    return () => {
      isMounted = false;
    };
  }, [storeSlug]);

  const formatDate = (value?: string) => (value ? new Date(value).toLocaleDateString() : 'No date');

  const sortedEvents = useMemo(() => {
    if (sortMode === 'recent') {
      return [...events].sort((a, b) => {
        const aTime = new Date(a.updatedAt || a.createdAt || 0).getTime();
        const bTime = new Date(b.updatedAt || b.createdAt || 0).getTime();
        return bTime - aTime;
      });
    }

    if (sortMode === 'alpha') {
      return [...events].sort((a, b) => (a.Name || '').localeCompare(b.Name || ''));
    }

    return sortByDate(events);
  }, [events, sortMode]);

  const items = useMemo(
    () =>
      sortedEvents.map((event) => {
        const key = getTiendaItemKey(event);
        const statusText = isPublished(event) ? 'Published' : 'Draft';

        return {
          key,
          title: event.Name || 'Untitled event',
          subtitle: `${statusText} · ${formatDate(event.startDate)} · ${event.slug}`,
          href: `/tienda/${storeSlug}/events/${event.documentId || event.slug}`,
          icon: 'event' as const,
        };
      }),
    [sortedEvents, storeSlug],
  );

  return (
    <Stack gap="xs">
      <SegmentedControl
        size="xs"
        value={sortMode}
        onChange={(value) => setSortMode(value as 'date' | 'recent' | 'alpha')}
        data={[
          { label: 'Upcoming', value: 'date' },
          { label: 'Recent', value: 'recent' },
          { label: 'A-Z', value: 'alpha' },
        ]}
      />
      <NavTable emptyText="No events yet." items={items} loading={loading} />
    </Stack>
  );
}
