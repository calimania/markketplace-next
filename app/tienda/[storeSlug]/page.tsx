import { redirect } from 'next/navigation';

type TiendaStorePageProps = {
  params: Promise<{ storeSlug: string }>;
};

export default async function TiendaStorePage({ params }: TiendaStorePageProps) {
  const { storeSlug } = await params;

  redirect(`/dashboard/store?store=${encodeURIComponent(storeSlug)}`);
}
