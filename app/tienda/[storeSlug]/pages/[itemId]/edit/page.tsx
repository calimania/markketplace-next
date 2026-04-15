import { notFound } from 'next/navigation';
import TiendaDetailShell from '@/app/components/ui/tienda.detail.shell';
import PageEditorForm from '../../pages.editor.form';
import { findPage } from '../../pages.find';

type TiendaPageEditProps = {
  params: Promise<{ storeSlug: string; itemId: string }>;
};

export default async function TiendaPageEditPage({ params }: TiendaPageEditProps) {
  const { storeSlug, itemId } = await params;
  const page = await findPage(itemId, storeSlug);

  if (!page) notFound();

  return (
    <TiendaDetailShell
      breadcrumbs={[
        { label: 'Tienda', href: '/tienda' },
        { label: storeSlug, href: `/tienda/${storeSlug}` },
        { label: 'Pages', href: `/tienda/${storeSlug}/pages` },
        { label: page.documentId || page.slug || itemId, href: `/tienda/${storeSlug}/pages/${page.documentId || page.slug || itemId}` },
        { label: 'Edit' },
      ]}
      title={`Edit: ${page.Title || 'Page'}`}
      routePath={`/tienda/${storeSlug}/pages/${page.documentId || page.slug || itemId}/edit`}
      helperText="Editing page"
    >
      <PageEditorForm
        storeSlug={storeSlug}
        mode="edit"
        itemDocumentId={page.documentId || itemId}
        initial={{
          title: page.Title,
          slug: page.slug,
          content: page.Content as any,
          seoTitle: page.SEO?.metaTitle,
          seoDescription: page.SEO?.metaDescription,
          seoSocialImage: page.SEO?.socialImage as any,
        }}
      />
    </TiendaDetailShell>
  );
}
