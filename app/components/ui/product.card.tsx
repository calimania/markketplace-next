import { Product } from "@/markket/product";
import Link from "next/link";
import { Badge } from '@mantine/core';

export default function ProductCard({ product, slug }: { product: Product; slug: string }) {
  const imageUrl = product.Slides?.[0]?.formats?.medium?.url ||
    product?.SEO?.socialImage?.url;

  const description =
    product.SEO?.metaDescription || product.Description?.split("\n")[0];

  const price = product.usd_price || product.PRICES?.[0]?.Price || 'X';

  return (
    <Link href={`/store/${slug}/products/${product.slug}`}>
      <div className="group relative bg-white rounded-lg shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer">
        {/* Adjusted aspect ratio to 16/9 for better presentation */}
        <div className="aspect-[16/9] overflow-hidden rounded-t-lg bg-gray-50">
          {imageUrl ? (
            <div className="relative h-full w-full">
              <img
                src={imageUrl}
                alt={product.Name}
                className="h-full w-full object-cover transform transition-transform duration-300 group-hover:scale-105"
              />
              {product.active === false && (
                <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center">
                  <Badge
                    size="lg"
                    className="bg-white/10 text-white border-none"
                  >
                    Coming Soon
                  </Badge>
                </div>
              )}
            </div>
          ) : (
            <div className="h-full w-full flex items-center justify-center bg-gray-100">
              <span className="text-gray-400 text-sm">No image available</span>
            </div>
          )}
        </div>

        <div className="p-4">
          <div className="flex items-start gap-2 mb-2">
            <h3 className="flex-1 text-base font-medium text-gray-900 line-clamp-2">
              {product.Name}
            </h3>
            <Badge
              variant="light"
              color="blue"
              className="whitespace-nowrap"
            >
              ${price}
            </Badge>
          </div>

          {description && (
            <p className="text-gray-600 text-sm line-clamp-2 min-h-[2.5rem]">
              {description}
            </p>
          )}

          {product.quantity !== null && (
            <div className="mt-3 flex items-center text-xs text-gray-500">
              <span
                className={`inline-block w-1.5 h-1.5 rounded-full mr-2 ${
                  product.quantity > 0 ? "bg-green-500" : "bg-red-500"
                }`}
              />
              {product.quantity > 0 ? (
                <span>{product.quantity} in stock</span>
              ) : (
                <span>Out of stock</span>
              )}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}