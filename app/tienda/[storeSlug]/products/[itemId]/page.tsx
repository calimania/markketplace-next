import TiendaProductItemPageClient from '../product.item.page.client';

type TiendaProductItemPageProps = {
  params: Promise<{ storeSlug: string; itemId: string }>;
};

export const fetchCache = 'force-no-store';
export const revalidate = 0;

export default async function TiendaProductItemPage({ params }: TiendaProductItemPageProps) {
  const { storeSlug, itemId } = await params;

  return <TiendaProductItemPageClient storeSlug={storeSlug} itemId={itemId} />;
}
