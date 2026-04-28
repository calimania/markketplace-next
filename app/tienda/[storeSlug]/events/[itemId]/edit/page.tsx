import { notFound } from 'next/navigation';
import TiendaDetailShell from '@/app/components/ui/tienda.detail.shell';
import EventEditorForm from '../../event.editor.form';
import { findEvent } from '../../events.find';

type TiendaEventEditProps = {
  params: Promise<{ storeSlug: string; itemId: string }>;
};

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
          timezone: event.timezone,
          thumbnailUrl: event.Thumbnail?.url,
          socialImageUrl: event.SEO?.socialImage?.url,
          slides: event.Slides,
        }}
      />
    </TiendaDetailShell>
  );
}
