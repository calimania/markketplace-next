import { NextRequest } from 'next/server';
import { fetchUserStores,  validators,  } from '@/markket/helpers.api';

export const contentTypeConfig = {
  article: {
    validate: (data: any) => {
      if (!data?.Title || !data?.Content || !data?.slug) {
        return { valid: false, error: 'Missing required fields for article' };
      }

      if (!validators.slug(data?.slug)) {
        return { valid: false, error: 'Invalid slug format' };
      }
      return { valid: true };
    },
    transform: (data: any, userId: string | number, storeId: string | number) => ({
      Title: data.Title,
      Content: data.Content,
      slug: data.slug,
      Tags: data.Tags,
      SEO: data.SEO ? {
        metaTitle: data.SEO?.metaTitle,
        metaDescription: data.SEO?.metaDescription,
        metaKeywords: data.SEO?.metaKeywords,
        socialImage: data.SEO?.socialImage?.id,
      } : undefined,
      store: [storeId],
    }),
    linkToStore: true,
    propLimit: 50,
  },
  page: {
    validate: (data: any) => {
      if (!data?.Title || !data?.Content || !data?.slug) {
        return { valid: false, error: 'Missing required fields for page' };
      }

      if (!validators.short_slug(data?.slug)) {
        return { valid: false, error: 'Invalid slug format' };
      }

      return { valid: true };
    },
    transform: (data: any, userId: string | number, storeId: string | number) => ({
      Title: data.Title,
      Content: data.Content,
      slug: data.slug,
      SEO: data.SEO ? {
        metaTitle: data.SEO?.metaTitle,
        metaDescription: data.SEO?.metaDescription,
        metaKeywords: data.SEO?.metaKeywords,
        socialImage: data.SEO?.socialImage?.id,
      } : undefined,
      store: [storeId],
    }),
    linkToStore: true,
    propLimit: 50,
  },
  product: {
    validate: (data: any) => {
      if (!data?.Name || !data?.Description || !data?.slug) {
        return { valid: false, error: 'Missing required fields for product' };
      }

      if (!validators.slug(data?.slug)) {
        return { valid: false, error: 'Invalid slug format' };
      }

      return { valid: true };
    },
    transform: (data: any, userId: string | number, storeId: string | number) => ({
      Name: data.Name,
      Description: data.Description,
      slug: data.slug,
      SKU: data.SKU,
      PRICES: data.PRICES,
      SEO: data.SEO ? {
        metaTitle: data.SEO?.metaTitle,
        metaDescription: data.SEO?.metaDescription,
        metaKeywords: data.SEO?.metaKeywords,
        socialImage: data.SEO?.socialImage?.id,
      } : undefined,
      stores: [storeId],
    }),
    linkToStore: true,
    propLimit: 24,
  },
  track: {
    validate: (data: any) => {
      if (!data?.title || !data?.slug) {
        return { valid: false, error: 'Missing required fields for track' };
      }

      if (!validators.slug(data?.slug)) {
        return { valid: false, error: 'Invalid slug format' };
      }

      return { valid: true };
    },
    transform: (data: any, userId: string | number, storeId: string | number) => ({
      title: data.title,
      description: data.description,
      content: data.content,
      slug: data.slug,
      urls: data.urls?.map(({ URL, Label }: { URL: string, Label: string }) => ({ URL, Label })),
      SEO: data.SEO ? {
        metaTitle: data.SEO?.metaTitle,
        metaDescription: data.SEO?.metaDescription,
        metaKeywords: data.SEO?.metaKeywords,
        socialImage: data.SEO?.socialImage?.id,
      } : undefined,
      store: storeId,
    }),
    linkToStore: true,
    propLimit: 100,
  },
  album: {
    validate: (data: any) => {
      if (!data?.title || !data?.slug) {
        return { valid: false, error: 'Missing required fields for album' };
      }

      if (!validators.slug(data?.slug)) {
        return { valid: false, error: 'Invalid slug format' };
      }

      return { valid: true };
    },
    transform: (data: any, userId: string | number, storeId: string | number) => ({
      title: data.title,
      description: data.description,
      content: data.content,
      slug: data.slug,
      displayType: data.displayType || 'grid',
      SEO: data.SEO ? {
        metaTitle: data.SEO?.metaTitle,
        metaDescription: data.SEO?.metaDescription,
        metaKeywords: data.SEO?.metaKeywords,
        socialImage: data.SEO?.socialImage?.id,
      } : undefined,
      store: storeId,
    }),
    linkToStore: true,
    propLimit: 50,
  },
  event: {
    validate: (data: any) => {
      if (!data?.Name || !data?.slug) {
        return { valid: false, error: 'Missing required fields for event' };
      }

      if (!validators.slug(data?.slug)) {
        return { valid: false, error: 'Invalid slug format' };
      }

      return { valid: true };
    },
    transform: (data: any, userId: string | number, storeId: string | number) => ({
      Name: data.Name,
      Description: data.Description,
      slug: data.slug,
      startDate: data.startDate,
      endDate: data.endDate,
      // location: data.location,
      creator: [userId],
      PRICES: data.PRICES?.map(p => ({
        Currency: p.Currency,
        Description: p.Description,
        Name: p.Name,
        Price: p.Price,
        STRIPE_ID: p.STRIPE_ID,
      })),
      SEO: data.SEO ? {
        metaTitle: data.SEO?.metaTitle,
        metaDescription: data.SEO?.metaDescription,
        metaKeywords: data.SEO?.metaKeywords,
        socialImage: data.SEO?.socialImage?.id,
      } : undefined,
      stores: [storeId],
    }),
    linkToStore: true,
    propLimit: 50,
  },
};

// Get content types from URL and validate against config
export const getContentType = (request: NextRequest) => {
  const contentType = request.nextUrl?.searchParams.get('contentType');

  if (!contentType || !contentTypeConfig[contentType as keyof typeof contentTypeConfig]) {
    return { valid: false, error: 'Invalid or missing content type' };
  }

  return { valid: true, contentType };
};

// Check if user has permission to modify content in this store
export async function validateStoreAccess(storeId: string) {
  if (!storeId) return false;

  try {
    const stores = await fetchUserStores();
    return stores.data.some((store: any) => store.documentId === storeId || store.id === storeId);
  } catch (error) {
    console.error('Error validating store access:', error);
    return false;
  }
}
