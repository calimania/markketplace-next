import { Metadata } from 'next';
import { strapiClient } from '@/markket/api';

const BASE_URL = process.env.NEXT_PUBLIC_MARKKETPLACE_URL || 'https://de.markket.place';

interface SEOProps {
  url?: string;
  SEO?: {
    metaTitle?: string;
    metaDescription?: string;
    metaKeywords?: string;
    excludeFromSearch?: boolean;
    socialImage?: {
      url: string;
      width?: number;
      height?: number;
    };
  };
  title? : string;
  Title?: string;
  Logo?: {
    url: string;
  };
  Name?: string;
  Description?: string;
  id?: string;
};

export async function generateSEOMetadata({
  slug,
  entity,
  type = 'website',
  defaultTitle,
}: {
  slug: string;
  entity?: SEOProps;
  type?: 'website' | 'article';
  defaultTitle?: string;
  }): Promise<Metadata> {

  const storeResponse = await strapiClient.getStore(slug);
  const store = storeResponse?.data?.[0];

  const title = entity?.SEO?.metaTitle ||
    entity?.title ||
    defaultTitle ||
    store?.SEO?.metaTitle ||
    store?.title ||
    'markkëtplace';

  console.log({ title, entity })

  const description = entity?.SEO?.metaDescription ||
    store?.SEO?.metaDescription ||
    'Open ecommerce ecosystem';

  const image_url = entity?.SEO?.socialImage?.url ||
    store?.SEO?.socialImage?.url;


  const keywords = entity?.SEO?.metaKeywords ||
    store?.SEO?.metaKeywords;

  const canonical = entity?.url || `/store/${slug}`;

  return {
    title,
    description,
    keywords,
    metadataBase: new URL(BASE_URL),
    alternates: {
      canonical: canonical,
    },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: store?.title || 'markkëtplace',
      images: image_url ? [
        {
          url: image_url,
          width: entity?.SEO?.socialImage?.width || 1200,
          height: entity?.SEO?.socialImage?.height || 630,
          alt: description,
        }
      ] : undefined,
      type,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: image_url ? [image_url] : undefined,
    },
    robots: {
      index: !entity?.SEO?.excludeFromSearch,
      follow: !entity?.SEO?.excludeFromSearch,
    }
  };
};
