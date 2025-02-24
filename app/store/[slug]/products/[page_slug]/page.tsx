import { strapiClient } from "@/markket/api";
import { Product } from "@/markket/product";
import ProductDisplay from "./ProductDisplay";

interface ProductSlugPageProps {
  params: Promise<{ slug: string; page_slug: string }>;
}

export default async function ProductSlugPage({ params }: ProductSlugPageProps) {
  const { slug, page_slug } = await params;

  const { data: [product] } = await strapiClient.getProduct(page_slug, slug);

  if (!(product as Product)?.id) {
    return <div>Product not found</div>;
  }

  return <ProductDisplay product={product as Product} />;
}
