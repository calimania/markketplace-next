import TiendaPageEditPageClient from './page.client';

type TiendaPageEditPageProps = {
  params: Promise<{ storeSlug: string; itemId: string }>;
};

export const fetchCache = 'force-no-store';
export const revalidate = 0;

export default async function TiendaPageEditPage({ params }: TiendaPageEditPageProps) {
  const { storeSlug, itemId } = await params;

  return <TiendaPageEditPageClient storeSlug={storeSlug} itemId={itemId} />;
}
