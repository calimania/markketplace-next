import TiendaBlogEditPageClient from './page.client';

type TiendaBlogEditPageProps = {
  params: { storeSlug: string; itemId: string };
};

export const fetchCache = 'force-no-store';
export const revalidate = 0;

export default function TiendaBlogEditPage({ params }: TiendaBlogEditPageProps) {
  const { storeSlug, itemId } = params;

  return <TiendaBlogEditPageClient storeSlug={storeSlug} itemId={itemId} />;
}
