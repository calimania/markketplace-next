import TiendaEventItemPageClient from '../event.item.page.client';

type TiendaEventItemPageProps = {
  params: { storeSlug: string; itemId: string };
};

export const fetchCache = 'force-no-store';
export const revalidate = 0;

export default function TiendaEventItemPage({ params }: TiendaEventItemPageProps) {
  const { storeSlug, itemId } = params;

  return <TiendaEventItemPageClient storeSlug={storeSlug} itemId={itemId} />;
}
