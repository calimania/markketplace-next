import type { Metadata } from 'next';
import PayoutsClient from './payouts.client';

type TiendaPayoutsPageProps = {
  params: Promise<{ storeSlug: string }>;
};

export async function generateMetadata({ params }: TiendaPayoutsPageProps): Promise<Metadata> {
  const { storeSlug } = await params;
  return { title: `Payouts · ${storeSlug}` };
}

export default async function TiendaPayoutsPage({ params }: TiendaPayoutsPageProps) {
  const { storeSlug } = await params;
  return <PayoutsClient storeSlug={storeSlug} />;
}
