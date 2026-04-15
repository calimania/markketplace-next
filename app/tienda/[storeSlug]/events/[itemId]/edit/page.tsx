import { notFound } from 'next/navigation';
import TiendaDetailShell from '@/app/components/ui/tienda.detail.shell';
import { strapiClient } from '@/markket/api.strapi';
import type { Event } from '@/markket/event';
import EventEditorForm from '../../event.editor.form';

type TiendaEventEditProps = {
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

export default async function TiendaEventEditPage({ params }: TiendaEventEditProps) {
  const { storeSlug, itemId } = await params;
  const event = await findEvent(itemId, storeSlug);

  if (!event) notFound();

  return (
    <TiendaDetailShell
      breadcrumbs={[
        { label: 'Tienda', href: '/tienda' },
        { label: storeSlug, href: `/tienda/${storeSlug}` },
        { label: 'Events', href: `/tienda/${storeSlug}/events` },
        { label: event.documentId || event.slug || itemId, href: `/tienda/${storeSlug}/events/${event.documentId || event.slug || itemId}` },
        { label: 'Edit' },
      ]}
      title={`Edit: ${event.Name || 'Event'}`}
      routePath={`/tienda/${storeSlug}/events/${event.documentId || event.slug || itemId}/edit`}
    >
      <EventEditorForm
        storeSlug={storeSlug}
        mode="edit"
        itemDocumentId={event.documentId || itemId}
        initial={{
          name: event.Name,
          slug: event.slug,
          description: event.Description || '',
          seoTitle: event.SEO?.metaTitle,
          seoDescription: event.SEO?.metaDescription,
          sourceUrl: event.SEO?.metaUrl,
          startDate: event.startDate,
          endDate: event.endDate,
          thumbnailUrl: event.Thumbnail?.url,
          socialImageUrl: event.SEO?.socialImage?.url,
          slides: event.Slides,
        }}
      />
    </TiendaDetailShell>
  );
}
