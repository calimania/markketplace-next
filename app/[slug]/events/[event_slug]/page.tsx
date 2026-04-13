import { redirect } from 'next/navigation';

type StoreEventItemAliasPageProps = {
  params: Promise<{ slug: string; event_slug: string }>;
};

export default async function StoreEventItemAliasPage({ params }: StoreEventItemAliasPageProps) {
  const { slug, event_slug } = await params;

  redirect(`/store/${encodeURIComponent(slug)}/events/${encodeURIComponent(event_slug)}`);
}
