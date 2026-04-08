import { redirect } from 'next/navigation';

type TiendaContentIndexPageProps = {
  params: Promise<{ storeSlug: string; contentType: string }>;
};

export default async function TiendaContentIndexPage({ params }: TiendaContentIndexPageProps) {
  const { storeSlug, contentType } = await params;

  redirect(`/dashboard/${encodeURIComponent(contentType)}?store=${encodeURIComponent(storeSlug)}`);
}
