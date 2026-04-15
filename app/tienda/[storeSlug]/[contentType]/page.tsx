import { redirect } from 'next/navigation';

type TiendaContentIndexPageProps = {
  params: Promise<{ storeSlug: string; contentType: string }>;
};

export default async function TiendaContentIndexPage({ params }: TiendaContentIndexPageProps) {
  const { storeSlug, contentType } = await params;

  if (contentType === 'article' || contentType === 'articles') {
    redirect(`/tienda/${encodeURIComponent(storeSlug)}/blog`);
  }

  if (contentType === 'page' || contentType === 'pages') {
    redirect(`/tienda/${encodeURIComponent(storeSlug)}/pages`);
  }

  if (contentType === 'product' || contentType === 'products') {
    redirect(`/tienda/${encodeURIComponent(storeSlug)}/products`);
  }

  if (contentType === 'event' || contentType === 'events') {
    redirect(`/tienda/${encodeURIComponent(storeSlug)}/events`);
  }

  redirect(`/dashboard/${encodeURIComponent(contentType)}?store=${encodeURIComponent(storeSlug)}`);
}
