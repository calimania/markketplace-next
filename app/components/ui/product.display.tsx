"use client";

import { useState } from "react";
import { Price, Product, Slide } from "@/markket/product";
import { Store } from "@/markket";
import CheckoutModal from "../../store/[slug]/checkout/CheckoutModal";
import Markdown from '@/app/components/ui/page.markdown';
import { motion } from 'framer-motion';
import { Page } from "@/markket/page";
import PageContent from '@/app/components/ui/page.content';
import { Box, Modal, Title, UnstyledButton } from "@mantine/core";

type GalleryImage = {
  id: string | number;
  url: string;
  alternativeText?: string | null;
  formats?: Slide['formats'];
};

function buildProductGallery(product: Product): GalleryImage[] {
  const gallery: GalleryImage[] = [];
  const seen = new Set<string>();

  const push = (candidate?: Partial<GalleryImage> | null, fallbackId?: string) => {
    const url = candidate?.url;
    if (!url || seen.has(url)) return;
    seen.add(url);
    gallery.push({
      id: candidate?.id || fallbackId || url,
      url,
      alternativeText: candidate?.alternativeText,
      formats: candidate?.formats,
    });
  };

  push(product?.Thumbnail ? {
    id: 'thumbnail',
    url: product.Thumbnail.url,
    alternativeText: product.Thumbnail.alternativeText,
    formats: undefined,
  } : null, 'thumbnail');

  push(product?.SEO?.socialImage ? {
    id: 'social',
    url: product.SEO.socialImage.url,
    alternativeText: product.SEO.socialImage.alternativeText,
    formats: product.SEO.socialImage.formats as Slide['formats'],
  } : null, 'social');

  (product?.Slides || []).forEach((slide, index) => {
    push(slide, `slide-${index}`);
  });

  return gallery;
}

/**
 * ProductDisplay Component
 * Displays a product with image gallery, description, and checkout options
 * Features:
 * - Image gallery with thumbnails
 * - Responsive layout
 * - Animated transitions
 * - Markdown support for descriptions
 */
export default function ProductDisplay({ product, page, store }: { product: Product, page?: Page, store?: Store }) {
  const gallery = buildProductGallery(product);
  const [selectedImage, setSelectedImage] = useState<GalleryImage | undefined>(gallery[0]);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const prices: Price[] = product.PRICES?.map((price) => ({
    ...price,
    currency: price.Currency || "USD",
  })) || [];
  const hasExternalPurchaseUrl = Boolean(product?.SEO?.metaUrl);
  const hasCheckoutOptions = prices.some((price) => !price.hidden && Boolean(price.STRIPE_ID));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
    >
      <motion.div
        className="block lg:hidden mb-6"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {product.Name}
        </h1>
      </motion.div>

      <div className="lg:grid lg:grid-cols-2 lg:gap-x-8 lg:items-start">
        <div className="flex flex-col">
          <motion.div
            layoutId="main-image"
            className="aspect-w-4 aspect-h-3 sm:aspect-w-3 sm:aspect-h-2 rounded-lg overflow-hidden bg-gray-100"
          >
            <UnstyledButton
              component="button"
              onClick={() => setLightboxOpen(true)}
              aria-label="Open product image"
              style={{ display: 'block', width: '100%', height: '100%', cursor: 'zoom-in' }}
            >
              <MainImage title={product.Name} image={selectedImage} />
            </UnstyledButton>
          </motion.div>

          {gallery.length > 1 && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mt-4 grid grid-cols-6 gap-2"
            >
              {gallery.map((slide) => (
                <SlideImage
                  key={slide.id}
                  slide={slide}
                  onClick={() => setSelectedImage(slide)}
                  isSelected={selectedImage?.id === slide.id}
                />
              ))}
            </motion.div>
          )}
        </div>

        <div className="mt-8 lg:mt-0 lg:ml-8">
          <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="lg:col-start-2 lg:pl-8"
          >
            <div className="hidden lg:block mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {product.Name}
              </h1>
            </div>

            <div className="mt-6 prose prose-sm max-w-none">
              <ProductPrice prices={prices} />
              <Title order={2} size="h3" mb={40}>
                Product Description
              </Title>
              <Markdown content={product?.Description as string} />
            </div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mt-8"
            >
              <div className="space-y-3">
                {hasExternalPurchaseUrl && (
                  <a
                    href={product.SEO?.metaUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex w-full items-center justify-center rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-900 transition hover:border-gray-300 hover:bg-gray-50"
                  >
                    Buy from external site
                  </a>
                )}

                {hasCheckoutOptions && (
                  <CheckoutModal prices={prices} product={product} store={store} />
                )}

                {!hasExternalPurchaseUrl && !hasCheckoutOptions && (
                  <p className="rounded-xl border border-dashed border-gray-300 bg-gray-50 px-4 py-3 text-sm text-gray-600">
                    Purchase options are not available yet for this product.
                  </p>
                )}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {page && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-16 bg-white rounded-2xl shadow-sm border border-gray-100"
        >
          <div className="p-6">
            <PageContent params={{ page }} />
          </div>
        </motion.div>
      )}

      <Modal
        opened={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        centered
        size="90vw"
        title={selectedImage?.alternativeText || product.Name}
        styles={{
          content: { background: '#05080f' },
          header: { background: '#05080f' },
          title: { color: '#ffffff' },
          close: { color: '#ffffff' },
        }}
      >
        <Box
          style={{
            width: '100%',
            height: 'min(80vh, 860px)',
            backgroundImage: `url(${selectedImage?.formats?.large?.url || selectedImage?.url || ''})`,
            backgroundPosition: 'center',
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat',
            borderRadius: 12,
            backgroundColor: '#0b1220',
          }}
        />
      </Modal>
    </motion.div>
  );
};

function ProductPrice({ prices }: { prices: Price[] }) {
  if (!prices.length) return null;

  return (
    <div className="flex items-center gap-2">
      <span className="text-2xl font-bold text-blue-600">
        ${prices[0].Price}
      </span>
      {prices.length > 1 && (
        <span className="text-sm text-gray-500">
          +{prices.length - 1} more options
        </span>
      )}
    </div>
  );
};

function SlideImage({ slide, onClick, isSelected }: {
  slide: GalleryImage;
  onClick: () => void;
  isSelected: boolean;
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`
        relative aspect-w-1 aspect-h-1 rounded-md overflow-hidden
        ${isSelected ? 'ring-2 ring-blue-500' : 'ring-1 ring-gray-200'}
        transition duration-200 ease-in-out
      `}
    >
      <img
        src={slide?.formats?.thumbnail?.url || slide?.url}
        alt={slide?.alternativeText || ""}
        className="object-cover w-full h-full"
      />
    </motion.button>
  );
}

export const MainImage = ({ image, title }: { image?: GalleryImage; title: string }) => {
  return (
    <div className="relative h-full">
      {image?.url ? (
        <img
          src={image?.formats?.large?.url || image?.url}
          alt={image?.alternativeText || title}
          className="w-full h-full object-contain"
          loading="eager"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gray-100">
          <span className="text-gray-400">No image available</span>
        </div>
      )}
    </div>
  );
};
