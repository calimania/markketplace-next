import TiendaProductItemPageClient from '../product.item.page.client';

type TiendaProductItemPageProps = {
  params: { storeSlug: string; itemId: string };
};

export const fetchCache = 'force-no-store';
export const revalidate = 0;

export default function TiendaProductItemPage({ params }: TiendaProductItemPageProps) {
  const { storeSlug, itemId } = params;

  return <TiendaProductItemPageClient storeSlug={storeSlug} itemId={itemId} />;
}
