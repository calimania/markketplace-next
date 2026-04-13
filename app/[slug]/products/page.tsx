import { redirect } from 'next/navigation';

type StoreProductsAliasPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function StoreProductsAliasPage({ params }: StoreProductsAliasPageProps) {
  const { slug } = await params;

  redirect(`/store/${encodeURIComponent(slug)}/products`);
}
