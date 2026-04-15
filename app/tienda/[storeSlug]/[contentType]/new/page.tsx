import { redirect } from 'next/navigation';

type TiendaContentNewPageProps = {
  params: Promise<{ storeSlug: string; contentType: string }>;
};

export default async function TiendaContentNewPage({ params }: TiendaContentNewPageProps) {
  const { storeSlug, contentType } = await params;

  if (contentType === 'article' || contentType === 'articles') {
    redirect(`/tienda/${encodeURIComponent(storeSlug)}/blog/new`);
  }

  if (contentType === 'page' || contentType === 'pages') {
    redirect(`/tienda/${encodeURIComponent(storeSlug)}/pages/new`);
  }

  if (contentType === 'product' || contentType === 'products') {
    redirect(`/tienda/${encodeURIComponent(storeSlug)}/products/new`);
  }

  if (contentType === 'event' || contentType === 'events') {
    redirect(`/tienda/${encodeURIComponent(storeSlug)}/events/new`);
  }

  redirect(`/dashboard/${encodeURIComponent(contentType)}/new?store=${encodeURIComponent(storeSlug)}`);
}
