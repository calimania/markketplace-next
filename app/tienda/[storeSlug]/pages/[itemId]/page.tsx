import TiendaPageItemPageClient from '../pages.item.page.client';

type TiendaPageItemPageProps = {
  params: Promise<{ storeSlug: string; itemId: string }>;
};

export const fetchCache = 'force-no-store';
export const revalidate = 0;

export default async function TiendaPageItemPage({ params }: TiendaPageItemPageProps) {
  const { storeSlug, itemId } = await params;

  return <TiendaPageItemPageClient storeSlug={storeSlug} itemId={itemId} />;
}
