import StoreEditorClientPage from './store.editor.page.client';

type TiendaStoreEditorPageProps = {
  params: Promise<{ storeSlug: string }>;
};

export default async function TiendaStoreEditorPage({ params }: TiendaStoreEditorPageProps) {
  const { storeSlug } = await params;

  return <StoreEditorClientPage storeSlug={storeSlug} />;
}
