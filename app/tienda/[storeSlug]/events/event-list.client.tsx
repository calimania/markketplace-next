'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import NavTable from '@/app/components/ui/nav.table';
import type { Event } from '@/markket/event';
import { tiendaClient } from '@/markket/api.tienda';
import { TIENDA_CONTENT_LIST_QUERY } from '../content.list.queries';
import { isPublished } from '@/markket/helpers.publication';

type EventListClientProps = {
  storeSlug: string;
  initialEvents: Event[];
};

function readAuthToken() {
  if (typeof window === 'undefined') return '';

  try {
    const raw = localStorage.getItem('markket.auth');
    const parsed = raw ? JSON.parse(raw) : null;
    return parsed?.jwt || '';
  } catch {
    return '';
  }
}

function itemKey(event: Partial<Event>) {
  return String(event.documentId || event.id || event.slug || event.Name || Math.random());
}

function sortByDate(items: Event[]) {
  return [...items].sort((a, b) => {
    const aTime = new Date(a.startDate || 0).getTime();
    const bTime = new Date(b.startDate || 0).getTime();
    return aTime - bTime;
  });
}

export default function EventListClient({ storeSlug, initialEvents }: EventListClientProps) {
  const [events, setEvents] = useState<Event[]>(sortByDate(initialEvents || []));
  const fetchedStoreSlugRef = useRef<string | null>(null);

  useEffect(() => {
    const token = readAuthToken();
    if (!token) {
      console.log('[EventListClient] No token in localStorage');
      return;
    }

    if (fetchedStoreSlugRef.current === storeSlug) {
      return;
    }

    fetchedStoreSlugRef.current = storeSlug;

    const loadAllContent = async () => {
      try {
        console.log('[EventListClient] Fetching content for store:', storeSlug);
        const response = await tiendaClient.listContent(storeSlug, 'event', {
          token,
          query: TIENDA_CONTENT_LIST_QUERY.event,
        });

        console.log('[EventListClient] API response:', { response, hasData: !!response?.data });

        const merged = new Map<string, Event>();
        const allItems = Array.isArray(response?.data) ? (response.data as Event[]) : (Array.isArray(response) ? (response as Event[]) : []);

        console.log('[EventListClient] Parsed items:', { count: allItems.length, items: allItems.map(p => ({ id: p.documentId, title: p.Name, published: !!p.publishedAt })) });

        if (allItems.length > 0) {
          allItems.forEach((event) => {
            merged.set(itemKey(event), event);
          });
          setEvents(sortByDate(Array.from(merged.values())));
        }
      } catch (error) {
        fetchedStoreSlugRef.current = null;
        console.error('[EventListClient] Failed to load events:', error);
      }
    };

    loadAllContent();
  }, [storeSlug]);

  const formatDate = (value?: string) => (value ? new Date(value).toLocaleDateString() : 'No date');

  const items = useMemo(
    () =>
      events.map((event) => {
        const key = itemKey(event);
        const statusText = isPublished(event) ? 'Published' : 'Draft';

        return {
          key,
          title: event.Name || 'Untitled event',
          subtitle: `${statusText} · ${formatDate(event.startDate)} · ${event.slug}`,
          href: `/tienda/${storeSlug}/events/${event.documentId || event.slug}`,
          icon: 'event' as const,
        };
      }),
    [events, storeSlug],
  );

  return <NavTable emptyText="No events yet." items={items} />;
}
