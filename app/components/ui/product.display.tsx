"use client";

import { useState } from "react";
import { Price, Product, Slide } from "@/markket/product";
import CheckoutModal from "../../store/[slug]/checkout/CheckoutModal";
import Markdown from '@/app/components/ui/page.markdown';
import { motion } from 'framer-motion'; // Add this import for animations
import { Page } from "@/markket/page";
import PageContent from "@/app/components/ui/page.content";
import { markketConfig } from "@/markket/config";

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
      className="max-w-7xl mx-auto"
    >
      <div className="mb-10 lg:grid lg:grid-cols-2 lg:items-start lg:gap-x-8">
        <div className="flex flex-col">
          <motion.div
            layoutId="main-image"
            className="aspect-w-3 aspect-h-4 overflow-hidden rounded-lg shadow-lg"
          >
            <MainImage title={product.Name} image={selectedImage} />
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-10 flex w-full flex-col justify-end"
          >
            <div className="grid grid-cols-6 gap-2">
              {product?.Slides?.map((slide) => (
                <SlideImage
                  key={slide.id}
                  slide={slide}
                  onClick={() => setSelectedImage(slide)}
                  isSelected={selectedImage.id === slide.id}
                />
              ))}
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-10 px-4 sm:mt-16 sm:px-0 lg:mt-0"
        >
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
            {product.Name}
          </h1>

          <div className="mt-6 prose prose-sm">
            <Markdown content={product?.Description as string} />
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mt-6 flex justify-center"
      >
        <CheckoutModal prices={prices} product={product} />
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="m-4 bg-gray-50 p-6 rounded-lg shadow-sm"
      >
        <h2 className="text-lg font-semibold">Details</h2>
        <div className="mt-4 prose prose-sm">
          <PageContent params={{ page }} />
        </div>
      </motion.div>
    </motion.div>
  );
};

function SlideImage({
  slide,
  onClick,
  isSelected,
}: {
  slide: Slide;
  onClick: () => void;
  isSelected: boolean;
}) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`aspect-w-3 aspect-h-4 overflow-hidden rounded-lg border-2 ${
        isSelected ? "border-blue-500" : "border-transparent"
        } transition-all duration-200 hover:shadow-lg`}
      onClick={onClick}
    >
      <img
        src={slide?.formats?.thumbnail?.url || ""}
        alt={slide?.alternativeText || ""}
        className="h-full w-full cursor-pointer object-cover object-center transition-all duration-200 hover:opacity-75"
      />
    </motion.div>
  );
};

export const MainImage = ({ image, title }: { image: Slide; title: string }) => {
  return (
    <motion.div
      className="relative overflow-hidden rounded-xl"
      layoutId="product-image"
    >
      {image?.url && (
        <img
          src={image?.formats?.medium?.url || image?.url || markketConfig?.blank_image_url}
          alt={image?.alternativeText || title}
          className="object-cover transform transition-all duration-300 hover:scale-105 h-full w-full"
          loading="eager"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
    </motion.div>
  );
}
