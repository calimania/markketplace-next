import TiendaDetailShell from '@/app/components/ui/tienda.detail.shell';
import EventEditorForm from '../event.editor.form';

type TiendaEventNewProps = {
  params: Promise<{ storeSlug: string }>;
};

export default async function TiendaEventNewPage({ params }: TiendaEventNewProps) {
  const { storeSlug } = await params;

  return (
    <TiendaDetailShell
      breadcrumbs={[
        { label: 'Tienda', href: '/tienda' },
        { label: storeSlug, href: `/tienda/${storeSlug}` },
        { label: 'Events', href: `/tienda/${storeSlug}/events` },
        { label: 'New Event' },
      ]}
      title="New Event"
      routePath={`/tienda/${storeSlug}/events/new`}
    >
      <EventEditorForm storeSlug={storeSlug} mode="new" />
    </TiendaDetailShell>
  );
}
