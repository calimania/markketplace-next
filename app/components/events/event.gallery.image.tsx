"use client";

import { useState } from "react";
import { EventMainImage } from "./event.main.image";
import { Event } from "@/markket/event";

interface EventImageGalleryProps {
  event: Event;
}

export function EventImageGallery({ event }: EventImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(event.SEO?.socialImage);

  return (
    <div className="flex flex-col">
      <div className="aspect-w-3 aspect-h-4 w-full overflow-hidden rounded-l">
        {selectedImage && (
          <EventMainImage title={event.Name} image={selectedImage} />
        )}
      </div>
      <div className="flex flex-col">
        {event.Slides?.length > 0 && (
          <div className="mt-8">
            <div className="grid grid-cols-6 gap-2">
              {event.Slides.map((slide) => (
                <div
                  key={slide.id}
                  className="product-slide aspect-w-3 aspect-h-4 overflow-hidden rounded-lg"
                  onClick={() => setSelectedImage(slide)}
                >
                  <img
                    src={slide.formats?.thumbnail?.url}
                    alt={slide.alternativeText || ""}
                    className="h-full w-full cursor-pointer object-cover object-center transition-opacity hover:opacity-75"
                    aria-label={slide.caption || ""}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
