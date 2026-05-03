import TiendaPageEditPageClient from './page.client';

type TiendaPageEditPageProps = {
  params: { storeSlug: string; itemId: string };
};

export const fetchCache = 'force-no-store';
export const revalidate = 0;

export default function TiendaPageEditPage({ params }: TiendaPageEditPageProps) {
  const { storeSlug, itemId } = params;

  return <TiendaPageEditPageClient storeSlug={storeSlug} itemId={itemId} />;
}
