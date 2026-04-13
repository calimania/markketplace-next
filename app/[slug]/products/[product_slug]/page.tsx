import { redirect } from 'next/navigation';

type StoreProductItemAliasPageProps = {
  params: Promise<{ slug: string; product_slug: string }>;
};

export default async function StoreProductItemAliasPage({ params }: StoreProductItemAliasPageProps) {
  const { slug, product_slug } = await params;

  redirect(`/store/${encodeURIComponent(slug)}/products/${encodeURIComponent(product_slug)}`);
}
