"use client";

import { useState } from "react";
import { Price, Product, Slide } from "@/markket/product";
import CheckoutModal from "../../checkout/CheckoutModal";

export default function ProductDisplay({ product }: { product: Product }) {
  const [selectedImage, setSelectedImage] = useState<Slide>(
    product.Slides?.[0]
  );
  const prices: Price[] =
    product.PRICES?.map((price) => ({
      ...price,
      currency: price.Currency || "USD",
    })) || [];

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-10 lg:grid lg:grid-cols-2 lg:items-start lg:gap-x-8">
        <div className="flex flex-col">
          <div className="aspect-w-3 aspect-h-4 overflow-hidden rounded-l pr-3">
            <MainImage title={product.Name} image={selectedImage} />
          </div>
          <div className="mt-10 flex w-full flex-col justify-end">
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
      <div className="mt-6 flex justify-center">
        <CheckoutModal prices={prices} product={product} />
      </div>
      <div className="m-4">
        <ol className="mt-4 text-sm text-gray-500">
          <li className="mb-2">
            We use Stripe to collect payments, and send payouts to the artists
          </li>
          <li className="mb-2">
            Currently we do not support a shopping cart, you can get one or
            multiple units of the same
            <em>Price</em> per transaction
          </li>
          <li className="mb-2">
            We notify the artist after a succesful transaction and forward your
            shipping details and email to them
          </li>
          <li className="mb-2">
            The artists will reach out with tracking details, or follow up steps
            to complete the transaction
          </li>
        </ol>
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
        src={slide?.formats?.thumbnail?.url || ""}
        alt={slide?.alternativeText || ""}
        className="h-full w-full cursor-pointer object-cover object-center transition-opacity hover:opacity-75"
      />
    </div>
  );
}

export const MainImage = ({ image, title }: { image: Slide; title: string }) => {
  return (
    <div className="relative overflow-hidden rounded-xl">
      {image?.url && (
        <img
          src={image?.formats?.thumbnail?.url || ""}
          alt={image?.alternativeText || title}
          className="object-cover transform transition-transform h-full w-full"
          loading="eager"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
    </div>
  );
}
