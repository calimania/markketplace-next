import { redirect } from 'next/navigation';

type TiendaContentNewPageProps = {
  params: Promise<{ storeSlug: string; contentType: string }>;
};

export default async function TiendaContentNewPage({ params }: TiendaContentNewPageProps) {
  const { storeSlug, contentType } = await params;

  redirect(`/dashboard/${encodeURIComponent(contentType)}/new?store=${encodeURIComponent(storeSlug)}`);
}
