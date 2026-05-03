import TiendaEventEditPageClient from './page.client';

type TiendaEventEditPageProps = {
  params: Promise<{ storeSlug: string; itemId: string }>;
};

export const fetchCache = 'force-no-store';
export const revalidate = 0;

export default async function TiendaEventEditPage({ params }: TiendaEventEditPageProps) {
  const { storeSlug, itemId } = await params;

  return <TiendaEventEditPageClient storeSlug={storeSlug} itemId={itemId} />;
}
