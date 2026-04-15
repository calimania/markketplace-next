import TiendaDetailShell from '@/app/components/ui/tienda.detail.shell';
import PageEditorForm from '../pages.editor.form';

type TiendaPageNewProps = {
  params: Promise<{ storeSlug: string }>;
};

export default async function TiendaPageNewPage({ params }: TiendaPageNewProps) {
  const { storeSlug } = await params;

  return (
    <TiendaDetailShell
      breadcrumbs={[
        { label: 'Tienda', href: '/tienda' },
        { label: storeSlug, href: `/tienda/${storeSlug}` },
        { label: 'Pages', href: `/tienda/${storeSlug}/pages` },
        { label: 'New Page' },
      ]}
      title="New Page"
      routePath={`/tienda/${storeSlug}/pages/new`}
    >
      <PageEditorForm storeSlug={storeSlug} mode="new" />
    </TiendaDetailShell>
  );
}
