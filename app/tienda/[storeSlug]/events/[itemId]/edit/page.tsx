import TiendaEventEditPageClient from './page.client';

type TiendaEventEditPageProps = {
  params: { storeSlug: string; itemId: string };
};

export const fetchCache = 'force-no-store';
export const revalidate = 0;

export default function TiendaEventEditPage({ params }: TiendaEventEditPageProps) {
  const { storeSlug, itemId } = params;

  return <TiendaEventEditPageClient storeSlug={storeSlug} itemId={itemId} />;
}
