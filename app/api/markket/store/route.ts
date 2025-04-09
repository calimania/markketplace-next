import { NextResponse, NextRequest } from 'next/server';
import { strapiClient } from '@/markket/api';
import { markketConfig } from '@/markket/config';
import { fetchUserStores, errorResponses, validators } from '@/markket/helpers.api';
import { Store } from '@/markket';
import { headers } from 'next/headers';

export async function GET() {

  try {
    const stores = await fetchUserStores();
    return NextResponse.json(stores);
  } catch (error) {
    console.error('Route error:', error);
    return errorResponses.internalError();
  }
}

export async function POST(request: Request) {
  if (!validators.config()) {
    return errorResponses.missingConfig();
  }

  const headersList = await headers();
  const user_id: string | number = headersList.get('markket-user-id') || '';

  try {
    const stores = await fetchUserStores();

    if (stores?.data?.length >= markketConfig.max_stores_per_user) {
      return errorResponses.storeLimit(stores?.data?.length);
    }

    const payload: { store: Store } = await request.json();

    if (!validators.storeContent(payload?.store)) {
      return errorResponses.missingFields();
    }

    if (!validators.slug(payload?.store?.slug)) {
      return errorResponses.invalidSlug()
    }

    const { title, Description, slug, URLS, SEO } = payload.store;
    const data = {
      title,
      Description,
      slug,
      URLS: URLS?.map(({ URL, Label }) => ({ URL, Label })),
      SEO: {
        metaTitle: SEO?.metaTitle,
        metaDescription: SEO?.metaDescription,
        metaKeywords: SEO?.metaKeywords,
        socialImage: SEO?.socialImage?.id,
      },
      users: [user_id],
      active: false,
    };

    const response = await strapiClient.create('stores', {
      headers: {
        'Authorization': `Bearer ${markketConfig.markket_api_key}`,
      },
      data
    });

    if (!response?.data?.id) {
      return NextResponse.json({
        error: 'Failed to create store',
        details: {
          ...(response?.error?.details || {}),
          message: response?.error?.message || 'Unknown error',
        },
      }, { status: response?.status || 500 });
    }

    return NextResponse.json({
      data: response?.data || {},
    }, {
      status: response.status || 201
    });
  } catch (error) {
    console.error('Store creation error:', error);
    return errorResponses.internalError();
  }
}

export async function PUT(request: NextRequest) {
  if (!validators.config()) {
    return errorResponses.missingConfig();
  }

  try {
    const id = request.nextUrl?.searchParams.get('id')

    const stores = await fetchUserStores();

    const payload: { store: Store } = await request.json();

    const store = stores.data.find((store: any) => store.documentId === id);

    if (!store?.id) {
      return errorResponses.unauthorized();
    }

    if (!validators.storeContent(payload?.store)) {
      return errorResponses.missingFields();
    }

    if (!validators.slug(payload?.store?.slug)) {
      return errorResponses.invalidSlug()
    }

    const { title, Description, slug, URLS, SEO } = payload.store;
    const data = {
      title,
      Description,
      slug,
      URLS: URLS?.map(({ URL, Label }) => ({ URL, Label })),
      SEO: {
        metaTitle: SEO?.metaTitle,
        metaDescription: SEO?.metaDescription,
        metaKeywords: SEO?.metaKeywords,
        socialImage: SEO?.socialImage?.id,
      },
    };

    const response = await strapiClient.update('stores', store.documentId, {
      headers: {
        'Authorization': `Bearer ${markketConfig.markket_api_key}`,
      },
      data,
    });

    return NextResponse.json(response, { status: response?.error?.status || '200' });
  } catch (error) {
    console.error('Store update error:', error);

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
