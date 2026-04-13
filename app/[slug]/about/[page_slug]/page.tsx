import { redirect } from 'next/navigation';

type StoreAboutItemAliasPageProps = {
  params: Promise<{ slug: string; page_slug: string }>;
};

export default async function StoreAboutItemAliasPage({ params }: StoreAboutItemAliasPageProps) {
  const { slug, page_slug } = await params;

  redirect(`/store/${encodeURIComponent(slug)}/about/${encodeURIComponent(page_slug)}`);
}
