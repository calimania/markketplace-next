import { Product } from "@/markket/product";
import Link from "next/link";
import { Badge } from '@mantine/core';
import { markketColors } from '@/markket/colors.config';

export default function ProductCard({ product, slug }: { product: Product; slug: string }) {
  const imageUrl = product.Slides?.[0]?.formats?.medium?.url ||
    product?.SEO?.socialImage?.url;

  const description =
    product.SEO?.metaDescription || product.Description?.split("\n")[0];

  const price = product.usd_price || product.PRICES?.[0]?.Price || 'X';

  return (
    <Link href={`/store/${slug}/products/${product.slug}`}>
      <div className="group relative bg-white rounded-lg shadow-sm transition-all duration-200 hover:shadow-md cursor-pointer overflow-hidden" style={{ borderWidth: '1px', borderColor: markketColors.neutral.gray }}>
        <div className="aspect-[16/9] overflow-hidden bg-gray-50">
          {imageUrl ? (
            <div className="relative h-full w-full">
              <img
                src={imageUrl}
                alt={product.Name}
                className="h-full w-full object-cover transform transition-transform duration-500 group-hover:scale-110"
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
              <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
              <span className="text-gray-400 text-sm">No image available</span>
            </div>
          )}
        </div>

        <div className="p-5">
          <div className="flex items-start gap-2 mb-3">
            <h3 className="flex-1 text-lg font-semibold line-clamp-2 transition-colors" style={{ color: markketColors.neutral.charcoal }}>
              {product.Name}
            </h3>
            <Badge
              variant="light"
              className="whitespace-nowrap"
              style={{
                fontSize: '0.9rem',
                padding: '6px 12px',
                background: markketColors.sections.shop.light,
                color: markketColors.sections.shop.main,
              }}
            >
              ${price}
            </Badge>
          </div>

          {description && (
            <p className="text-sm line-clamp-2 min-h-[2.5rem] mb-3" style={{ color: markketColors.neutral.mediumGray }}>
              {description}
            </p>
          )}

          {product.quantity !== null && (
            <div className="mt-3 flex items-center text-xs rounded-lg px-3 py-2" style={{ color: markketColors.neutral.mediumGray, background: markketColors.neutral.lightGray }}>
              <span
                className={`inline-block w-2 h-2 rounded-full mr-2 ${product.quantity > 0 ? "animate-pulse" : ""}`}
                style={{ background: product.quantity > 0 ? markketColors.status.success : markketColors.status.error }}
              />
              {product.quantity > 0 ? (
                <span className="font-medium">{product.quantity} in stock</span>
              ) : (
                  <span className="font-medium">Out of stock</span>
              )}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};
