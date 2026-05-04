import TiendaProductEditPageClient from './page.client';

type TiendaProductEditPageProps = {
  params: Promise<{ storeSlug: string; itemId: string }>;
};

export const fetchCache = 'force-no-store';
export const revalidate = 0;

export default async function TiendaProductEditPage({ params }: TiendaProductEditPageProps) {
  const { storeSlug, itemId } = await params;

  return <TiendaProductEditPageClient storeSlug={storeSlug} itemId={itemId} />;
}
