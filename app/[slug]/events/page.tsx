import { redirect } from 'next/navigation';

type StoreEventsAliasPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function StoreEventsAliasPage({ params }: StoreEventsAliasPageProps) {
  const { slug } = await params;

  redirect(`/store/${encodeURIComponent(slug)}/events`);
}
