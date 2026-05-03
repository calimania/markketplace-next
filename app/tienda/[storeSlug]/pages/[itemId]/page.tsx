import TiendaPageItemPageClient from '../pages.item.page.client';

type TiendaPageItemPageProps = {
  params: { storeSlug: string; itemId: string };
};

export const fetchCache = 'force-no-store';
export const revalidate = 0;

export default function TiendaPageItemPage({ params }: TiendaPageItemPageProps) {
  const { storeSlug, itemId } = params;

  return <TiendaPageItemPageClient storeSlug={storeSlug} itemId={itemId} />;
}
