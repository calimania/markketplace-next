'use client';

import { useEffect, useState } from 'react';
import { Text } from '@mantine/core';
import TiendaItemSkeleton from '@/app/components/ui/tienda.item.skeleton';
import TiendaDetailShell from '@/app/components/ui/tienda.detail.shell';
import EventEditorForm from '../../event.editor.form';
import { findEvent } from '../../events.find';
import { readTiendaAuthToken } from '../../../content.find';
import type { Event } from '@/markket/event';

type TiendaEventEditPageClientProps = {
  storeSlug: string;
  itemId: string;
};

export default function TiendaEventEditPageClient({ storeSlug, itemId }: TiendaEventEditPageClientProps) {
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const token = readTiendaAuthToken();

    if (!token) {
      setError('Authentication required to edit this event.');
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
        console.error('Tienda event edit load error', err);
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

  if (loading) {
    return <TiendaItemSkeleton />;
  }

  if (error || !event) {
    return (
      <TiendaDetailShell
        breadcrumbs={[
          { label: 'Tienda', href: '/tienda' },
          { label: storeSlug, href: `/tienda/${storeSlug}` },
          { label: 'Events', href: `/tienda/${storeSlug}/events` },
          { label: itemId },
          { label: 'Edit' },
        ]}
        title="Event not found"
        routePath={`/tienda/${storeSlug}/events/${itemId}/edit`}
      >
        <Text c="dimmed">{error || 'This event does not exist.'}</Text>
      </TiendaDetailShell>
    );
  }

  return (
    <TiendaDetailShell
      breadcrumbs={[
        { label: 'Tienda', href: '/tienda' },
        { label: storeSlug, href: `/tienda/${storeSlug}` },
        { label: 'Events', href: `/tienda/${storeSlug}/events` },
        { label: event.slug || itemId, href: `/tienda/${storeSlug}/events/${event.slug || itemId}` },
        { label: 'Edit' },
      ]}
      title={`Edit: ${event.Name || 'Event'}`}
      routePath={`/tienda/${storeSlug}/events/${event.slug || itemId}/edit`}
    >
      <EventEditorForm
        storeSlug={storeSlug}
        mode="edit"
        itemDocumentId={event.documentId || itemId}
        initial={{
          name: event.Name,
          slug: event.slug,
          description: event.Description,
          seoTitle: event.SEO?.metaTitle,
          seoDescription: event.SEO?.metaDescription,
          seoSocialImageId: event.SEO?.socialImage?.id,
          seoSocialImageDocumentId: event.SEO?.socialImage?.documentId,
          startDate: event.startDate,
          endDate: event.endDate,
        }}
      />
    </TiendaDetailShell>
  );
}
