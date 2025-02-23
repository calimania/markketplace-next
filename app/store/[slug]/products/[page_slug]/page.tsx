import { strapiClient } from "@/markket/api";
import { Product } from "@/markket/product";
import { notFound } from "next/navigation";
import ProductDisplay from "./ProductDisplay";

interface ProductPageProps {
  params: { slug: string; page_slug: string };
}

export default async function ProductSlugPage({ params }: ProductPageProps) {
  const { slug, page_slug } = await params;

  const storeResponse = await strapiClient.getStore(slug);
  const store = storeResponse?.data?.[0];

  if (!store) {
    notFound();
  }

  const productsResponse = await strapiClient.getProducts(
    { page: 1, pageSize: 50 },
    { sort: "createdAt:desc", filter: "" },
    slug
  );

  const products: Product[] = (productsResponse?.data as Product[]) || [];
  const product = products.find((product) => product.slug === page_slug);

  if (!product || !product.Slides || product.Slides.length === 0) {
    return <div>Product not found</div>;
  }

  return <ProductDisplay product={product} />; // ✅ Pass product to Client Component
}
