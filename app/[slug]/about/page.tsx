import { redirect } from 'next/navigation';

type StoreAboutAliasPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function StoreAboutAliasPage({ params }: StoreAboutAliasPageProps) {
  const { slug } = await params;

  redirect(`/store/${encodeURIComponent(slug)}/about`);
}
