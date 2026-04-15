import TiendaDetailShell from '@/app/components/ui/tienda.detail.shell';
import BlogEditorForm from '../blog.editor.form';

type TiendaBlogNewPageProps = {
  params: Promise<{ storeSlug: string }>;
};

export default async function TiendaBlogNewPage({ params }: TiendaBlogNewPageProps) {
  const { storeSlug } = await params;

  return (
    <TiendaDetailShell
      breadcrumbs={[
        { label: 'Tienda', href: '/tienda' },
        { label: storeSlug, href: `/tienda/${storeSlug}` },
        { label: 'Blog', href: `/tienda/${storeSlug}/blog` },
        { label: 'New Article' },
      ]}
      title="New Article"
      routePath={`/tienda/${storeSlug}/blog/new`}
    >
      <BlogEditorForm
        storeSlug={storeSlug}
        mode="new"
      />
    </TiendaDetailShell>
  );
}
