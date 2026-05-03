import TiendaAlbumItemPageClient from '../album.item.page.client';

type TiendaAlbumItemPageProps = {
  params: Promise<{ storeSlug: string; itemId: string }>;
};

export const fetchCache = 'force-no-store';
export const revalidate = 0;

export default async function TiendaAlbumItemPage({ params }: TiendaAlbumItemPageProps) {
  const { storeSlug, itemId } = await params;

  return <TiendaAlbumItemPageClient storeSlug={storeSlug} itemId={itemId} />;
}
