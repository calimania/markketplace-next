import TiendaBlogItemPageClient from '../blog.item.page.client';

type TiendaBlogItemPageProps = {
  params: Promise<{ storeSlug: string; itemId: string }>;
};

export const fetchCache = 'force-no-store';
export const revalidate = 0;

export default async function TiendaBlogItemPage({ params }: TiendaBlogItemPageProps) {
  const { storeSlug, itemId } = await params;

  return <TiendaBlogItemPageClient storeSlug={storeSlug} itemId={itemId} />;
}
