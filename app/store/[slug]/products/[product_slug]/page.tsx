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
  const product = data?.[0] as Product;
  const productName = product?.Name || 'Product';
  const price = product?.usd_price ? `$${product.usd_price}` : '';
  const description = product?.Description
    ? product.Description.substring(0, 150).replace(/<[^>]*>/g, '')
    : `${productName}${price ? ' - ' + price : ''}. Available now.`;

  return generateSEOMetadata({
    slug,
    entity: {
      url: `/${slug}/products/${product_slug}`,
      SEO: product?.SEO,
      id: product?.id?.toString(),
      Name: product?.Name,  // Pass real value, not fallback
      Description: description,
    },
    type: 'article',
    defaultTitle: 'Product',
    keywords: [
      'product',
      'buy',
      'shop',
      productName,
      ...(product?.Tag?.map(t => t.Label) || []),
    ],
  });
};

export default async function ProductSlugPage({ params }: ProductSlugPageProps) {
  const { slug, product_slug } = await params;

  const { data: [product] } = await strapiClient.getProduct(product_slug, slug);

  const { data: [mainPage] } = await strapiClient.getPage('product',);
  const { data: [page] } = await strapiClient.getPage('product', slug);

  const { data: [store] } = await strapiClient.getStore(slug);

  if (!(product as Product)?.id) {
    return <div>Product not found</div>;
  }

  return <ProductDisplay product={product as Product} page={(page || mainPage) as Page} store={store} />;
};
