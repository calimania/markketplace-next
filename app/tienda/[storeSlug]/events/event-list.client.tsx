'use client';

import { useEffect, useMemo, useState, useCallback } from 'react';
import { SegmentedControl, Stack } from '@mantine/core';
import { notifications } from '@mantine/notifications';
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

function getEventLocationLabel(event: Event) {
  const first = Array.isArray(event.locations) && event.locations.length > 0 ? event.locations[0] : null;
  if (!first) return '';
  return (first.city || first.name || '').trim();
}

export default function EventListClient({ storeSlug, initialEvents }: EventListClientProps) {
  const [events, setEvents] = useState<Event[]>(sortByDate(initialEvents || []));
  const [loading, setLoading] = useState((initialEvents || []).length === 0);
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

  const handlePublishToggle = useCallback(async (navItem: { key: string }) => {
    const token = readTiendaAuthToken();
    if (!token) return;
    const event = events.find(e => getTiendaItemKey(e) === navItem.key);
    if (!event) return;
    const eventId = event.documentId || event.slug;
    if (!eventId) {
      notifications.show({
        title: 'Could not save',
        message: 'This event is still syncing. Please try again in a moment.',
        color: 'red',
      });
      return;
    }
    const published = isPublished(event);
    const data = published ? { unpublishNow: true, saveAsDraft: true } : { publishNow: true };
    try {
      await tiendaClient.updateContent(storeSlug, 'event', eventId, data, { token });
      setEvents(prev => prev.map(e =>
        getTiendaItemKey(e) === navItem.key
          ? { ...e, publishedAt: published ? null : new Date().toISOString() }
          : e
      ));
      notifications.show({
        title: published ? 'Now in draft' : 'Now live',
        message: published ? 'Your event is hidden from the public site.' : 'Your event is now visible on your live site.',
        color: published ? 'yellow' : 'green',
      });
    } catch {
      notifications.show({ title: 'Could not save', message: 'Please try publishing again.', color: 'red' });
    }
  }, [events, storeSlug]);

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
        const locationLabel = getEventLocationLabel(event);
        const subtitleBase = `${statusText} · ${formatDate(event.startDate)} · ${event.slug}`;

        return {
          key,
          title: event.Name || 'Untitled event',
          subtitle: locationLabel ? `${subtitleBase} · ${locationLabel}` : subtitleBase,
          href: `/tienda/${storeSlug}/events/${event.documentId || event.slug}`,
          previewHref: isPublished(event) && event.slug ? `/${storeSlug}/events/${event.slug}` : undefined,
          icon: 'event' as const,
          status: isPublished(event) ? 'published' as const : 'draft' as const,
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
          { label: 'By date', value: 'date' },
          { label: 'Recent', value: 'recent' },
          { label: 'A-Z', value: 'alpha' },
        ]}
      />
      <NavTable
        emptyText="No events yet. Add your first event to go live."
        items={items}
        loading={loading}
        onPublishToggle={handlePublishToggle}
        searchPlaceholder="Search events by name"
      />
    </Stack>
  );
}
