import TiendaProductEditPageClient from './page.client';

type TiendaProductEditPageProps = {
  params: { storeSlug: string; itemId: string };
};

export const fetchCache = 'force-no-store';
export const revalidate = 0;

export default function TiendaProductEditPage({ params }: TiendaProductEditPageProps) {
  const { storeSlug, itemId } = params;

  return <TiendaProductEditPageClient storeSlug={storeSlug} itemId={itemId} />;
}
