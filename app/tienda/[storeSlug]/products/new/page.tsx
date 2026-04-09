import { redirect } from 'next/navigation';

type TiendaProductNewPageProps = {
  params: Promise<{ storeSlug: string }>;
};

export default async function TiendaProductNewPage({ params }: TiendaProductNewPageProps) {
  const { storeSlug } = await params;
  redirect(`/dashboard/products/new?store=${encodeURIComponent(storeSlug)}`);
}
