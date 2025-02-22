import { Product } from '@/markket/product.d';
import { strapiClient } from '@/markket/api';
import { notFound } from 'next/navigation';

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const storeResponse = await strapiClient.getStore(slug);
  const store = storeResponse?.data?.[0];

  if (!store) {
    notFound();
  }

  const productsResponse = await strapiClient.getProducts({page: 1, pageSize: 50 }, { sort: 'createdAt:desc', filter: ''}, slug);
  const products = productsResponse?.data || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
          Our Products
        </h1>
        <p className="mt-4 text-xl text-gray-500">
          Discover our unique collection
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {products.map((product) => (
          <ProductCard key={(product as Product).id} product={product as Product} />
        ))}
      </div>
    </div>
  );
};

function ProductCard({ product }: { product: Product }) {
  const imageUrl = product.Slides?.[0]?.formats?.medium?.url;
  const description = product.SEO?.metaDescription || product.Description?.split('\n')[0];

  return (
    <div className="group relative bg-white rounded-2xl shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      <div className="aspect-[4/3] overflow-hidden rounded-t-2xl bg-gray-100">
        {imageUrl ? (
          <div className="relative h-full w-full">
            <img
              src={imageUrl}
              alt={product.Name}
              className="object-cover transform transition-transform group-hover:scale-105"
            />
            {product.active === false && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <span className="px-4 py-2 bg-gray-900/80 text-white text-sm font-medium rounded-full">
                  Coming Soon
                </span>
              </div>
            )}
          </div>
        ) : (
          <div className="h-full w-full flex items-center justify-center">
            <span className="text-gray-400">No image available</span>
          </div>
        )}
      </div>

      <div className="p-6">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
            {product.Name}
          </h3>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-50 text-blue-700">
            ${product.usd_price || 'Contact'}
          </span>
        </div>

        {description && (
          <p className="mt-2 text-gray-500 text-sm line-clamp-2">
            {description}
          </p>
        )}

        {product.quantity !== null && (
          <div className="mt-4 flex items-center text-sm text-gray-500">
            <div className={`w-2 h-2 rounded-full mr-2 ${
              product.quantity > 0 ? 'bg-green-500' : 'bg-red-500'
            }`} />
            {product.quantity > 0 ? (
              <span>{product.quantity} in stock</span>
            ) : (
              <span>Out of stock</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
