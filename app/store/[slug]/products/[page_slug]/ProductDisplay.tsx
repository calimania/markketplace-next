"use client";

import { useState } from "react";
import { Product, Slide } from "@/markket/product";

export default function ProductDisplay({ product }: { product: Product }) {
  const [selectedImage, setSelectedImage] = useState<Slide>(product.Slides[0]);

  return (
    <div className="max-w-7xl mx-auto mb-10 lg:grid lg:grid-cols-2 lg:items-start lg:gap-x-8">
      <div className="flex flex-col">
        <div className="aspect-w-3 aspect-h-4 overflow-hidden rounded-l pr-3">
          <MainImage title={product.Name} image={selectedImage} />
        </div>
        <div className="mt-10 flex w-full flex-col justify-end">
          <div className="grid grid-cols-6 gap-2">
            {product.Slides.map((slide) => (
              <SlideImage
                key={slide.id}
                slide={slide}
                onClick={() => setSelectedImage(slide)}
                isSelected={selectedImage.id === slide.id}
              />
            ))}
          </div>
        </div>
      </div>
      <div className="mt-10 px-4 sm:mt-16 sm:px-0 lg:mt-0">
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 ">
          {product.Name}
        </h1>

        {/* Product description */}
        <div className="mt-6">
          <div className="space-y-6 text-base text-gray-700 dark:prose-invert">
            {product.Description}
          </div>
        </div>
      </div>
    </div>
  );
}

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
    <div
      className={`aspect-w-3 aspect-h-4 overflow-hidden rounded-lg border-2 ${
        isSelected ? "border-blue-500" : "border-transparent"
      }`}
      onClick={onClick}
    >
      <img
        src={slide.formats?.thumbnail?.url || ""}
        alt={slide.alternativeText || ""}
        className="h-full w-full cursor-pointer object-cover object-center transition-opacity hover:opacity-75"
      />
    </div>
  );
}

function MainImage({ image, title }: { image: Slide; title: string }) {
  return (
    <div className="relative overflow-hidden rounded-xl">
      <img
        src={image.formats?.thumbnail?.url || ""}
        alt={image.alternativeText || title}
        className="object-cover transform transition-transform h-full w-full"
        loading="eager"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
    </div>
  );
}
