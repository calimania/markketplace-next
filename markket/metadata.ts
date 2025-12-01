import { Metadata } from 'next';
import { strapiClient } from '@/markket/api.strapi';

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
  defaultDescription,
  keywords: additionalKeywords,
}: {
  slug: string;
  entity?: SEOProps;
  type?: 'website' | 'article';
  defaultTitle?: string;
    defaultDescription?: string;
    keywords?: string[];
  }): Promise<Metadata> {

  const storeResponse = await strapiClient.getStore(slug);
  const store = storeResponse?.data?.[0];

  const storeName = store?.title || store?.SEO?.metaTitle || 'Store';

  // Build descriptive title with context - filter out empty strings
  const baseTitle = (entity?.SEO?.metaTitle && entity.SEO.metaTitle.trim()) ||
    (entity?.title && entity.title.trim()) ||
    (entity?.Title && entity.Title.trim()) ||
    (entity?.Name && entity.Name.trim()) ||
    (defaultTitle && defaultTitle.trim());

  // Always show "Title | Store" format, unless baseTitle is empty/missing or same as store
  const title = baseTitle && baseTitle !== storeName
    ? `${baseTitle} | ${storeName}`
    : storeName;

  // Build rich description - filter out empty strings
  const baseDescription = (entity?.SEO?.metaDescription && entity.SEO.metaDescription.trim()) ||
    (entity?.Description && entity.Description.trim()) ||
    defaultDescription ||
    (store?.SEO?.metaDescription && store.SEO.metaDescription.trim()) ||
    (store?.Description && store.Description.trim());

  const description = baseDescription || `Discover ${storeName} - Open ecommerce ecosystem`;

  const image_url = entity?.SEO?.socialImage?.url ||
    entity?.Logo?.url ||
    store?.SEO?.socialImage?.url ||
    store?.Logo?.url;

  // Smart keywords generation - filter out empty strings
  const baseKeywords = (entity?.SEO?.metaKeywords && entity.SEO.metaKeywords.trim()) ||
    (store?.SEO?.metaKeywords && store.SEO.metaKeywords.trim()) ||
    '';

  const keywordsList = [
    ...baseKeywords.split(',').map(k => k.trim()).filter(Boolean),
    ...(additionalKeywords || []),
    storeName,
    'shop',
    'ecommerce',
  ].filter((v, i, a) => a.indexOf(v) === i); // unique

  const keywords = keywordsList.join(', ');

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
      siteName: storeName,
      images: image_url ? [
        {
          url: image_url,
          width: entity?.SEO?.socialImage?.width || 1200,
          height: entity?.SEO?.socialImage?.height || 630,
          alt: `${title} - ${description}`,
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
