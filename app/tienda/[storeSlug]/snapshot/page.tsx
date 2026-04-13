import StoreSnapshotMediaClientPage from './snapshot.media.page.client';

type TiendaStoreSnapshotPageProps = {
  params: Promise<{ storeSlug: string }>;
};

export default async function TiendaStoreSnapshotPage({ params }: TiendaStoreSnapshotPageProps) {
  const { storeSlug } = await params;

  return <StoreSnapshotMediaClientPage storeSlug={storeSlug} />;
}
