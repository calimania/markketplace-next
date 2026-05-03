import TiendaBlogItemPageClient from '../blog.item.page.client';

type TiendaBlogItemPageProps = {
  params: { storeSlug: string; itemId: string };
};

export const fetchCache = 'force-no-store';
export const revalidate = 0;

export default function TiendaBlogItemPage({ params }: TiendaBlogItemPageProps) {
  const { storeSlug, itemId } = params;

  return <TiendaBlogItemPageClient storeSlug={storeSlug} itemId={itemId} />;
}
