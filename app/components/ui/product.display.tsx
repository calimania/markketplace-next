"use client";

import { useState } from "react";
import { Price, Product, Slide } from "@/markket/product";
import CheckoutModal from "../../store/[slug]/checkout/CheckoutModal";
import Markdown from '@/app/components/ui/page.markdown';
import { motion } from 'framer-motion';
import { Page } from "@/markket/page";
import PageContent from '@/app/components/ui/page.content';
import { Title } from "@mantine/core";

/**
 * ProductDisplay Component
 * Displays a product with image gallery, description, and checkout options
 * Features:
 * - Image gallery with thumbnails
 * - Responsive layout
 * - Animated transitions
 * - Markdown support for descriptions
 */
export default function ProductDisplay({ product, page }: { product: Product, page?: Page }) {
  const [selectedImage, setSelectedImage] = useState<Slide>(product.Slides?.[0]);
  const prices: Price[] = product.PRICES?.map((price) => ({
    ...price,
    currency: price.Currency || "USD",
  })) || [];

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
            <MainImage title={product.Name} image={selectedImage} />
          </motion.div>

          {product.Slides && product.Slides.length > 1 && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mt-4 grid grid-cols-6 gap-2"
            >
              {product.Slides.map((slide) => (
                <SlideImage
                  key={slide.id}
                  slide={slide}
                  onClick={() => setSelectedImage(slide)}
                  isSelected={selectedImage.id === slide.id}
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
              <CheckoutModal prices={prices} product={product} />
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
  slide: Slide;
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

export const MainImage = ({ image, title }: { image: Slide; title: string }) => {
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
