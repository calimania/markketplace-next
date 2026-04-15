import { strapiClient } from "@/markket/api.strapi";
import { Product } from "@/markket/product";
import ProductDisplay from '@/app/components/ui/product.display';
import { Page } from "@/markket/page";
import { Metadata } from "next";
import { generateSEOMetadata } from "@/markket/metadata";
import { notFound } from "next/navigation";
import StoreCrosslinks from '@/app/components/ui/store.crosslinks';

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

  const [{ data: [product] }, { data: [mainPage] }, { data: [page] }, { data: [store] }, productsResponse] = await Promise.all([
    strapiClient.getProduct(product_slug, slug),
    strapiClient.getPage('product'),
    strapiClient.getPage('product', slug),
    strapiClient.getStore(slug),
    strapiClient.getProducts({ page: 1, pageSize: 5 }, { filter: '', sort: 'updatedAt:desc' }, slug),
  ]);

  if (!(product as Product)?.id) {
    return notFound();
  }

  const relatedProducts = ((productsResponse?.data || []) as Product[])
    .filter((item) => item.slug !== product_slug)
    .slice(0, 4)
    .map((item) => ({
      href: `/${slug}/products/${item.slug}`,
      label: item.Name || item.slug,
    }));

  return (
    <>
      <ProductDisplay product={product as Product} page={(page || mainPage) as Page} store={store} />
      <div className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
        <StoreCrosslinks
          slug={slug}
          store={store}
          currentSection="products"
          items={relatedProducts}
        />
      </div>
    </>
  );
};
