import { notFound, redirect } from 'next/navigation';

type TiendaContentModePageProps = {
  params: Promise<{ storeSlug: string; contentType: string; mode: string; itemId: string }>;
};

const allowedModes = new Set(['view', 'edit']);

export default async function TiendaContentModePage({ params }: TiendaContentModePageProps) {
  const { storeSlug, contentType, mode, itemId } = await params;

  if (!allowedModes.has(mode)) {
    notFound();
  }

  if ((contentType === 'article' || contentType === 'articles') && mode === 'view') {
    redirect(`/tienda/${encodeURIComponent(storeSlug)}/blog/${encodeURIComponent(itemId)}`);
  }

  if ((contentType === 'article' || contentType === 'articles') && mode === 'edit') {
    redirect(`/tienda/${encodeURIComponent(storeSlug)}/blog/${encodeURIComponent(itemId)}/edit`);
  }

  if ((contentType === 'page' || contentType === 'pages') && mode === 'view') {
    redirect(`/tienda/${encodeURIComponent(storeSlug)}/pages/${encodeURIComponent(itemId)}`);
  }

  if ((contentType === 'page' || contentType === 'pages') && mode === 'edit') {
    redirect(`/tienda/${encodeURIComponent(storeSlug)}/pages/${encodeURIComponent(itemId)}/edit`);
  }

  redirect(
    `/dashboard/${encodeURIComponent(contentType)}/${encodeURIComponent(mode)}/${encodeURIComponent(itemId)}?store=${encodeURIComponent(storeSlug)}`
  );
}
