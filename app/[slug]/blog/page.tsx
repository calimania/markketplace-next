import { redirect } from 'next/navigation';

type StoreBlogAliasPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function StoreBlogAliasPage({ params }: StoreBlogAliasPageProps) {
  const { slug } = await params;

  redirect(`/store/${encodeURIComponent(slug)}/blog`);
}
