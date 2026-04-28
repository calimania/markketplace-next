import { redirect } from 'next/navigation';

type TiendaAboutItemPageProps = {
  params: Promise<{ storeSlug: string; itemId: string }>;
};

export default async function TiendaAboutItemPage({ params }: TiendaAboutItemPageProps) {
  const { storeSlug, itemId } = await params;
  redirect(`/tienda/${encodeURIComponent(storeSlug)}/pages/${encodeURIComponent(itemId)}`);
}