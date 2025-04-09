import { NextResponse, NextRequest } from 'next/server';
import { strapiClient } from '@/markket/api';
import { markketConfig } from '@/markket/config';
import { fetchUserStores, errorResponses, validators, countContentTypeItems } from '@/markket/helpers.api';
import { headers } from 'next/headers';
import { actionsMap } from '@/app/components/dashboard/actions/actions.config';

const contentTypeConfig = {
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
      SEO: data.SEO ? {
        metaTitle: data.SEO?.metaTitle,
        metaDescription: data.SEO?.metaDescription,
        metaKeywords: data.SEO?.metaKeywords,
        socialImage: data.SEO?.socialImage?.id,
      } : undefined,
      stores: [storeId],
    }),
    linkToStore: true,
    propLimit: null,
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
    propLimit: null,
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
    propLimit: 20, // Limit number of products per store
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
    propLimit: null,
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
    propLimit: null,
  },
  event: {
    validate: (data: any) => {
      if (!data?.Name || !data?.slug || !data?.startDate) {
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
      location: data.location,
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
    propLimit: null,
  },
};

// Get content types from URL and validate against config
const getContentType = (request: NextRequest) => {
  const contentType = request.nextUrl?.searchParams.get('contentType');

  if (!contentType || !contentTypeConfig[contentType as keyof typeof contentTypeConfig]) {
    return { valid: false, error: 'Invalid or missing content type' };
  }

  return { valid: true, contentType };
};

// Check if user has permission to modify content in this store
async function validateStoreAccess(storeId: string) {
  if (!storeId) return false;

  try {
    const stores = await fetchUserStores();
    return stores.data.some((store: any) => store.documentId === storeId || store.id === storeId);
  } catch (error) {
    console.error('Error validating store access:', error);
    return false;
  }
}


export async function POST(request: NextRequest) {
  if (!validators.config()) {
    return errorResponses.missingConfig();
  }

  try {
    const { valid, contentType, error } = getContentType(request);

    if (!valid) {
      return NextResponse.json({ error }, { status: 400 });
    }

    const headersList = await headers();
    const userId = headersList.get('markket-user-id') || '';

    if (!userId) {
      return errorResponses.noToken();
    }

    const payload = await request.json();
    const config = contentTypeConfig[contentType as keyof typeof contentTypeConfig];
    const storeId = request.nextUrl?.searchParams.get('storeId');

    if (config.linkToStore) {
      if (!storeId) {
        return NextResponse.json({ error: 'Store ID is required' }, { status: 400 });
      }

      if (!(await validateStoreAccess(storeId))) {
        return errorResponses.unauthorized();
      }

      // Apply content limits or charges
      const limit = await countContentTypeItems(
        contentType as string,
        config.propLimit as number,
        storeId,
        markketConfig.markket_api_key,
      );

      console.log({ limit, config });
    }

    const validation = config.validate(payload[contentType as string]);

    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const transformedData = config.transform(
      payload[contentType as string],
      userId,
      storeId as string,
    );

    const contentTypePlural = actionsMap[`${contentType}s`]?.plural || `${contentType}s`;

    const response = await strapiClient.create(contentTypePlural, {
      headers: {
        'Authorization': `Bearer ${markketConfig.markket_api_key}`,
      },
      data: transformedData
    });

    if (!response?.data?.id) {
      return NextResponse.json({
        error: `Failed to create ${contentType}`,
        details: {
          ...(response?.error?.details || {}),
          message: response?.error?.message || 'Unknown error',
        },
      }, { status: response?.status || 500 });
    }

    // Apply afterSave, more explicit behavior than middleware
    // afterSave performs notifications, webhooks, automations & bots

    return NextResponse.json({
      data: response?.data || {},
    }, { status: response.status || 201 });

  } catch (error) {
    console.error(`POST:`, error);
    return errorResponses.internalError();
  }
}

// PUT handler - Update existing content
export async function PUT(request: NextRequest) {
  if (!validators.config()) {
    return errorResponses.missingConfig();
  }

  try {
    const { valid, contentType, error } = getContentType(request);

    if (!valid) {
      return NextResponse.json({ error }, { status: 400 });
    }

    const headersList = await headers();
    const userId = headersList.get('markket-user-id') || '';
    const id = request.nextUrl?.searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Content ID is required' }, { status: 400 });
    }

    if (!userId) {
      return errorResponses.noToken();
    }

    const payload = await request.json();
    const config = contentTypeConfig[contentType as keyof typeof contentTypeConfig];
    const storeId = request.nextUrl?.searchParams.get('storeId');
    const albumId = request.nextUrl?.searchParams.get('albumId');

    // For content types other than store, validate store access
    if (config.linkToStore && contentType !== 'store') {
      if (!storeId) {
        return NextResponse.json({ error: 'Store ID is required' }, { status: 400 });
      }

      if (!(await validateStoreAccess(storeId))) {
        return errorResponses.unauthorized();
      }
    } else if (contentType === 'store') {
      // If updating store, verify ownership
      const stores = await fetchUserStores();
      const store = stores.data.find((s: any) => s.documentId === id);

      if (!store?.id) {
        return errorResponses.unauthorized();
      }
    }

    // Validate the content based on its type
    const validation = config.validate(payload[contentType]);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    // Transform the data based on content type
    const transformedData = config.transform(
      payload[contentType],
      userId,
      storeId as string,
      albumId as string
    );

    // Don't modify user associations on update for stores
    if (contentType === 'store') {
      delete transformedData.users;
    }

    // Send to Strapi
    const contentTypePlural = actionsMap[`${contentType}s`]?.plural || `${contentType}s`;
    const response = await strapiClient.update(contentTypePlural, id, {
      headers: {
        'Authorization': `Bearer ${markketConfig.markket_api_key}`,
      },
      data: transformedData
    });

    return NextResponse.json(response, { status: response?.error?.status || 200 });

  } catch (error) {
    console.error('Content update error:', error);

    if (error instanceof Error) {
      if (error.message === 'No token provided' || error.message === 'Invalid token') {
        return errorResponses.invalidToken();
      }
      if (error.message === 'API configuration missing') {
        return errorResponses.missingConfig();
      }
    }

    return errorResponses.internalError();
  }
}

// DELETE handler
export async function DELETE(request: NextRequest) {
  if (!validators.config()) {
    return errorResponses.missingConfig();
  }

  try {
    const { valid, contentType, error } = getContentType(request);

    if (!valid) {
      return NextResponse.json({ error }, { status: 400 });
    }

    const id = request.nextUrl?.searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Content ID is required' }, { status: 400 });
    }

    // For stores, verify ownership
    if (contentType === 'store') {
      const stores = await fetchUserStores();
      const store = stores.data.find((s: any) => s.documentId === id);

      if (!store?.id) {
        return errorResponses.unauthorized();
      }
    } else {
      // For other content types, verify store access
      const storeId = request.nextUrl?.searchParams.get('storeId');

      if (!storeId) {
        return NextResponse.json({ error: 'Store ID is required' }, { status: 400 });
      }

      if (!(await validateStoreAccess(storeId))) {
        return errorResponses.unauthorized();
      }

      // Verify content belongs to this store
      // This would require an additional API call to check ownership
      // Implement based on your needs
    }

    // Delete the content
    const contentTypePlural = actionsMap[`${contentType}s`]?.plural || `${contentType}s`;
    const response = await strapiClient.delete(contentTypePlural, id, {
      headers: {
        'Authorization': `Bearer ${markketConfig.markket_api_key}`,
      }
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Content deletion error:', error);

    if (error instanceof Error) {
      if (error.message === 'No token provided' || error.message === 'Invalid token') {
        return errorResponses.invalidToken();
      }
      if (error.message === 'API configuration missing') {
        return errorResponses.missingConfig();
      }
    }

    return errorResponses.internalError();
  }
}