import { redirect } from 'next/navigation';

type TiendaEventNewPageProps = {
  params: Promise<{ storeSlug: string }>;
};

export default async function TiendaEventNewPage({ params }: TiendaEventNewPageProps) {
  const { storeSlug } = await params;
  redirect(`/dashboard/events/new?store=${encodeURIComponent(storeSlug)}`);
}
