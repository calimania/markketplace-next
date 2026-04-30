import { notFound } from 'next/navigation';
import TiendaDetailShell from '@/app/components/ui/tienda.detail.shell';
import BlogEditorForm from '../../blog.editor.form';
import { findBlogArticle } from '../../blog.find';

type TiendaBlogEditPageProps = {
  params: Promise<{ storeSlug: string; itemId: string }>;
};

export const fetchCache = 'force-no-store';
export const revalidate = 0;

export default async function TiendaBlogEditPage({ params }: TiendaBlogEditPageProps) {
  const { storeSlug, itemId } = await params;
  const post = await findBlogArticle(itemId, storeSlug);

  if (!post) notFound();

  return (
    <TiendaDetailShell
      breadcrumbs={[
        { label: 'Tienda', href: '/tienda' },
        { label: storeSlug, href: `/tienda/${storeSlug}` },
        { label: 'Blog', href: `/tienda/${storeSlug}/blog` },
        { label: post.documentId || post.slug || itemId, href: `/tienda/${storeSlug}/blog/${post.documentId || post.slug || itemId}` },
        { label: 'Edit' },
      ]}
      title={`Edit: ${post.Title || 'Article'}`}
      routePath={`/tienda/${storeSlug}/blog/${post.documentId || post.slug || itemId}/edit`}
    >
      <BlogEditorForm
        storeSlug={storeSlug}
        mode="edit"
        itemDocumentId={post.documentId || itemId}
        initial={{
          title: post.Title,
          slug: post.slug,
          content: post.Content,
          seoTitle: post.SEO?.metaTitle,
          seoDescription: post.SEO?.metaDescription,
        }}
      />
    </TiendaDetailShell>
  );
}
