import { strapiClient } from "@/markket/api.strapi";
import { Product } from "@/markket/product";
import ProductDisplay from '@/app/components/ui/product.display';
import { Page } from "@/markket/page";
import { Metadata } from "next";
import { generateSEOMetadata } from "@/markket/metadata";

interface ProductSlugPageProps {
  params: Promise<{ slug: string; product_slug: string }>;
}

export async function generateMetadata({ params }: ProductSlugPageProps): Promise<Metadata> {
  const { slug, product_slug } = await params;
  const { data } = await strapiClient.getProduct(product_slug, slug);
  const page = data?.[0] as Page;

  return generateSEOMetadata({
    slug: `store/${slug}/products/${product_slug}`,
    entity: {
      url: `store/${slug}/products/${product_slug}`,
      SEO: page?.SEO,
      id: page?.id?.toString(),
    },
    defaultTitle: `Products`,
  });
};

export default async function ProductSlugPage({ params }: ProductSlugPageProps) {
  const { slug, product_slug } = await params;

  const { data: [product] } = await strapiClient.getProduct(product_slug, slug);

  const { data: [mainPage] } = await strapiClient.getPage('product',);
  const { data: [page] } = await strapiClient.getPage('product', slug);

  if (!(product as Product)?.id) {
    return <div>Product not found</div>;
  }

  return <ProductDisplay product={product as Product} page={(page || mainPage) as Page} />;
};
