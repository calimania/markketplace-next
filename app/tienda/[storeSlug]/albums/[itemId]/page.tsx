import TiendaAlbumItemPageClient from '../album.item.page.client';

type TiendaAlbumItemPageProps = {
  params: { storeSlug: string; itemId: string };
};

export const fetchCache = 'force-no-store';
export const revalidate = 0;

export default function TiendaAlbumItemPage({ params }: TiendaAlbumItemPageProps) {
  const { storeSlug, itemId } = params;

  return <TiendaAlbumItemPageClient storeSlug={storeSlug} itemId={itemId} />;
}
