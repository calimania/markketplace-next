"use client";

import { useState } from "react";
import { EventMainImage } from "./event.main.image";
import { Event } from "@/markket/event";

interface EventImageGalleryProps {
  event: Event;
}

type GalleryImage = {
  id: string | number;
  url: string;
  alternativeText?: string | null;
  caption?: string | null;
  formats?: {
    thumbnail?: { url: string };
    small?: { url: string };
    medium?: { url: string };
    large?: { url: string };
  };
};

function buildGallery(event: Event): GalleryImage[] {
  const images: GalleryImage[] = [];
  const seen = new Set<string>();

  const push = (candidate?: Partial<GalleryImage> | null, fallbackId?: string) => {
    const url = candidate?.url;
    if (!url || seen.has(url)) return;
    seen.add(url);
    images.push({
      id: candidate?.id || fallbackId || url,
      url,
      alternativeText: candidate?.alternativeText || '',
      caption: candidate?.caption || '',
      formats: candidate?.formats,
    });
  };

  push(event?.Thumbnail ? {
    id: 'thumbnail',
    url: event.Thumbnail.url,
    alternativeText: event.Thumbnail.alternativeText,
    formats: event.Thumbnail.formats,
  } : null, 'thumbnail');

  push(event?.SEO?.socialImage ? {
    id: 'social',
    url: event.SEO.socialImage.url,
    alternativeText: event.SEO.socialImage.alternativeText,
    caption: event.SEO.socialImage.caption,
    formats: event.SEO.socialImage.formats,
  } : null, 'social');

  (event?.Slides || []).forEach((slide, index) => {
    push(slide, `slide-${index}`);
  });

  return images;
}

export function EventImageGallery({ event }: EventImageGalleryProps) {
  const gallery = buildGallery(event);
  const [selectedImage, setSelectedImage] = useState<GalleryImage | undefined>(gallery[0]);

  return (
    <div className="flex flex-col">
      <div className="aspect-w-3 aspect-h-4 w-full overflow-hidden rounded-l">
        {selectedImage && (
          <EventMainImage title={event.Name} image={selectedImage} />
        )}
      </div>
      <div className="flex flex-col">
        {gallery.length > 1 && (
          <div className="mt-8">
            <div className="grid grid-cols-6 gap-2">
              {gallery.map((slide) => (
                <div
                  key={slide.id}
                  className="product-slide aspect-w-3 aspect-h-4 overflow-hidden rounded-lg"
                  onClick={() => setSelectedImage(slide)}
                >
                  <img
                    src={slide.formats?.thumbnail?.url || slide.formats?.small?.url || slide.url}
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
