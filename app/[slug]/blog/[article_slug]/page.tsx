import { redirect } from 'next/navigation';

type StoreBlogItemAliasPageProps = {
  params: Promise<{ slug: string; article_slug: string }>;
};

export default async function StoreBlogItemAliasPage({ params }: StoreBlogItemAliasPageProps) {
  const { slug, article_slug } = await params;

  redirect(`/store/${encodeURIComponent(slug)}/blog/${encodeURIComponent(article_slug)}`);
}
