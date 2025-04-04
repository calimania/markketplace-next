import { NextResponse, NextRequest } from 'next/server';
import { headers } from 'next/headers';
import qs from 'qs';
import { strapiClient } from '@/markket/api';
import { markketConfig } from '@/markket/config';

const STRAPI_URL = markketConfig.api;
const ADMIN_TOKEN = markketConfig.markket_api_key;

interface CreateStorePayload {
  store: {
    id?: number | string;
    title: string;
    Description: string;
    slug: string;
    URLS: any[];
    addresses: [];
    documentId?: string;
    SEO?: {
      id?: string;
      metaTitle?: string;
      metaDescription?: string;
      excludeFromSearch?: boolean;
      metaKeywords?: string;
      socialImage?: any;
    }
  }
}

// Centralized error responses
const errorResponses = {
  missingConfig: () => NextResponse.json({ error: 'API configuration missing' }, { status: 400 }),
  noToken: () => NextResponse.json({ error: 'No token provided' }, { status: 401 }),
  invalidToken: () => NextResponse.json({ error: 'Invalid token' }, { status: 401 }),
  storeLimit: (count: number) => NextResponse.json({ error: 'Maximum store limit reached', stores: count }, { status: 400 }),
  missingFields: () => NextResponse.json({ error: 'Missing required fields' }, { status: 400 }),
  invalidSlug: () => NextResponse.json({ error: 'Invalid slug format' }, { status: 400 }),
  slugTooShort: () => NextResponse.json({ error: 'Slug must be at least 5 characters' }, { status: 400 }),
  unauthorized: () => NextResponse.json({ error: 'Store not found or unauthorized' }, { status: 403 }),
  internalError: () => NextResponse.json({ error: 'Internal server error' }, { status: 500 }),
}

// Validators
const validators = {
  config: () => !!STRAPI_URL && !!ADMIN_TOKEN,
  slug: (slug: string) => slug.length >= 5 && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug),
  storePayload: (payload: CreateStorePayload) =>
    !!payload?.store?.title &&
    !!payload?.store?.Description &&
    !!payload?.store?.slug &&
    validators.slug(payload.store.slug)
}


async function verifyToken(token: string) {
  if (!validators.config()) return null;

  const _url = new URL('api/users/me', STRAPI_URL);

  try {
    const response = await fetch(_url.toString(), {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      next: { revalidate: 0 }
    });

    if (!response.ok) return null;

    return await response.json();
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

export async function validateUserAndToken() {
  if (!validators.config()) {
    throw new Error('API configuration missing');
  }

  const headersList = await headers();
  const token = headersList.get('authorization')?.split('Bearer ')[1];

  if (!token) {
    throw new Error('No token provided');
  }

  const userData = await verifyToken(token);
  if (!userData) {
    throw new Error('Invalid token');
  }

  return userData;
}

export async function fetchUserStores(userId: number) {
  const query = qs.stringify({
    filters: {
      users: {
        id: {
          $eq: userId
        }
      }
    },
    sort: 'updatedAt:desc',
    populate: ['Logo', 'SEO.socialImage', 'Favicon', 'URLS', 'Cover', 'Slides', 'users'],
  }, {
    encodeValuesOnly: true
  });

  const _url = new URL(`api/stores?${query}`, STRAPI_URL);

  try {
    const response = await fetch(_url.toString(), {
      headers: {
        'Authorization': `Bearer ${ADMIN_TOKEN}`,
      },
      next: { revalidate: 30 }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch stores');
    }

    return await response.json();
  } catch (error) {
    console.error('Failed to fetch stores:', error);
    throw error;
  }
}

export async function GET() {
  if (!validators.config()) {
    return errorResponses.missingConfig();
  }

  try {
    const headersList = await headers();
    const token = headersList.get('authorization')?.split('Bearer ')[1];

    if (!token) {
      return errorResponses.noToken();
    }

    const userData = await verifyToken(token);
    if (!userData) {
      return errorResponses.invalidToken();
    }

    const stores = await fetchUserStores(userData.id);
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

  try {
    const userData = await validateUserAndToken();
    const stores = await fetchUserStores(userData.id);

    if (stores?.data?.length >= markketConfig.max_stores_per_user) {
      return errorResponses.storeLimit(stores?.data?.length);
    }

    const payload: CreateStorePayload = await request.json();

    if (!validators.storePayload(payload)) {
      if (!payload?.store?.title || !payload?.store?.Description || !payload?.store?.slug) {
        return errorResponses.missingFields();
      }

      if (payload?.store?.slug?.length < 5) {
        return errorResponses.slugTooShort();
      }

      return errorResponses.invalidSlug();
    }

    const response = await strapiClient.create('stores', {
      headers: {
        'Authorization': `Bearer ${ADMIN_TOKEN}`,
      },
      data: {
        ...payload.store,
        users: [userData.id],
        active: false,
      }
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
    const userData = await validateUserAndToken();
    const stores = await fetchUserStores(userData.id);
    const payload: CreateStorePayload = await request.json();

    const store = stores.data.find((store: any) => store.documentId === id);

    if (!store?.id) {
      return errorResponses.unauthorized();
    }

    if (payload?.store?.slug) {
      if (payload.store.slug.length < 5) {
        return errorResponses.slugTooShort();
      }

      if (!validators.slug(payload.store.slug)) {
        return errorResponses.invalidSlug();
      }
    }

    const data = {
      title: payload.store.title,
      Description: payload.store.Description,
      slug: payload.store.slug,
      SEO: {
        metaTitle: payload.store.SEO?.metaTitle,
        metaDescription: payload.store.SEO?.metaDescription,
        metaKeywords: payload.store.SEO?.metaKeywords,
        socialImage: payload.store.SEO?.socialImage?.id,
      }
    }
    console.log({ data })

    const response = await strapiClient.update('stores', store.documentId, {
      headers: {
        'Authorization': `Bearer ${ADMIN_TOKEN}`,
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


