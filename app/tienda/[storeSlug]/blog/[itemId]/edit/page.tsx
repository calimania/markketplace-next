import TiendaBlogEditPageClient from './page.client';

type TiendaBlogEditPageProps = {
  params: Promise<{ storeSlug: string; itemId: string }>;
};

export const fetchCache = 'force-no-store';
export const revalidate = 0;

export default async function TiendaBlogEditPage({ params }: TiendaBlogEditPageProps) {
  const { storeSlug, itemId } = await params;

  return <TiendaBlogEditPageClient storeSlug={storeSlug} itemId={itemId} />;
}
