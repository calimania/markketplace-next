import { notFound } from 'next/navigation';
import { Button, Text } from '@mantine/core';
import { strapiClient } from '@/markket/api.strapi';
import type { Event } from '@/markket/event';
import SmartBackButton from '@/app/components/ui/smart.back.button';
import TiendaDetailShell from '@/app/components/ui/tienda.detail.shell';

type TiendaEventItemPageProps = {
  params: Promise<{ storeSlug: string; itemId: string }>;
};

async function findEvent(itemId: string, storeSlug: string) {
  const byDocumentId = await strapiClient.fetch<Event>({
    contentType: 'events',
    filters: {
      documentId: itemId,
      stores: {
        slug: {
          $eq: storeSlug,
        },
      },
    },
    populate: 'SEO,SEO.socialImage,Tag,Thumbnail,Slides,stores',
    paginate: { page: 1, pageSize: 1 },
  });

  if (byDocumentId?.data?.[0]) return byDocumentId.data[0] as Event;

  const bySlug = await strapiClient.getEventBySlug(itemId, storeSlug);
  return bySlug?.data?.[0] as Event | undefined;
}

export default async function TiendaEventItemPage({ params }: TiendaEventItemPageProps) {
  const { storeSlug, itemId } = await params;
  const event = await findEvent(itemId, storeSlug);

  if (!event) notFound();

  const editorId = event.documentId || event.slug;

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
          <Button component="a" href={`/tienda/${storeSlug}/events/edit/${editorId}`}>
            Edit
          </Button>
        </>
      }
    >
      <Text>{event.Description || event.SEO?.metaDescription || 'No details yet.'}</Text>
    </TiendaDetailShell>
  );
}
