import { strapiClient } from "@/markket/api";
import { Product } from "@/markket/product";
import ProductDisplay from '@/app/components/ui/product.display';
import { Page } from "@/markket/page";


interface ProductSlugPageProps {
  params: Promise<{ slug: string; product_slug: string }>;
}

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
