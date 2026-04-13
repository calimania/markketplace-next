import { redirect } from 'next/navigation';

type StoreAboutNewsletterAliasPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function StoreAboutNewsletterAliasPage({ params }: StoreAboutNewsletterAliasPageProps) {
  const { slug } = await params;

  redirect(`/store/${encodeURIComponent(slug)}/about/newsletter`);
}
