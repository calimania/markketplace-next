import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import qs from 'qs';
import { markketClient, strapiClient } from '@/markket/api';
import { markketConfig } from '@/markket/config';

const STRAPI_URL = process.env.NEXT_PUBLIC_MARKKET_API || 'https://api.markket.place/';
const ADMIN_TOKEN = process.env.MARKKET_API_KEY;

interface CreateStorePayload {
  store: {
    id?: number | string;
    title: string;
    Description: string;
    slug: string;
    SEO?: {
      metaTitle?: string;
      metaDescription?: string;
      excludeFromSearch?: boolean;
    }
  }
};

async function verifyToken(token: string) {
  const _url = new URL('api/users/me', STRAPI_URL);

  try {
    const response = await fetch(_url.toString(), {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('Token verification response:', {
      status: response.status,
      statusText: response.statusText
    });

    if (!response.ok) {
      return null;
    }

    return response.json();
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

export async function validateUserAndToken() {
  if (!STRAPI_URL || !ADMIN_TOKEN) {
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
};

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
    });

    if (!response.ok) {
      throw new Error('Failed to fetch stores');
    }

    return response.json();
  } catch (error) {
    console.error('Failed to fetch stores:', error);
    throw error;
  }
}

export async function GET() {
  if (!STRAPI_URL || !ADMIN_TOKEN) {
    return NextResponse.json(
      {
        error: 'Bad request', details:
          { STRAPI_URL, ADMIN_TOKEN: (ADMIN_TOKEN as string).length }
      },
      { status: 400 },
    );
  };

  try {
    const headersList = await headers();
    const token = headersList.get('authorization')?.split('Bearer ')[1];

    if (!token) {
      return NextResponse.json(
        { error: 'No token provided' },
        { status: 401 }
      );
    }

    const userData = await verifyToken(token);

    if (!userData) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    const stores = await fetchUserStores(userData.id);

    return NextResponse.json(stores);
  } catch (error) {
    console.error('Route error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
};


export async function POST(request: Request) {
  if (!STRAPI_URL || !ADMIN_TOKEN) {
    return NextResponse.json(
      { error: 'API configuration missing' },
      { status: 400 }
    );
  }

  try {
    const userData = await validateUserAndToken();

    if (!userData) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    const stores = await fetchUserStores(userData.id);

    if (stores?.data?.length >= markketConfig.max_stores_per_user) {
      return NextResponse.json(
        { error: 'Maximum store limit reached', _stores: stores?.data?.length },
        { status: 400 }
      );
    }

    const payload: CreateStorePayload = await request.json();

    if (!payload?.store?.title || !payload?.store?.Description || !payload?.store?.slug) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (payload?.store?.slug?.length < 5) {
      return NextResponse.json(
        { error: 'Slug must be at least 5 characters' },
        { status: 400 }
      );
    }

    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(payload?.store?.slug)) {
      return NextResponse.json(
        { error: 'Invalid slug format' },
        { status: 400 }
      );
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

    console.log({ response })

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
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
};

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {

  const { id } = await params;

  try {
    const userData = await validateUserAndToken();
    const stores = await fetchUserStores(userData.id);

    const storeExists = stores.data.some((store: any) => store.id.toString() === id);

    if (!storeExists) {
      return NextResponse.json(
        { error: 'Store not found or unauthorized' },
        { status: 403 }
      );
    }

    const payload: CreateStorePayload = await request.json();

    if (payload?.store?.slug && payload.store.slug.length < 5) {
      return NextResponse.json(
        { error: 'Slug must be at least 5 characters' },
        { status: 400 }
      );
    }

    if (payload.store.slug && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(payload?.store?.slug)) {
      return NextResponse.json(
        { error: 'Invalid slug format' },
        { status: 400 }
      );
    }

    const url = new URL(`api/stores/${id}`, STRAPI_URL);
    const client = new markketClient();
    const response = await client.fetch(url.toString(), {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${ADMIN_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data: {
          ...payload.store,
          // Maintain user association
          // @TODO: Review
          // @TODO: abstract validators to use everywhere
          // users: [userData.id],
        }
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update store');
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Store update error:', error);
    if (error instanceof Error) {
      if (error.message === 'No token provided' || error.message === 'Invalid token') {
        return NextResponse.json({ error: error.message }, { status: 401 });
      }
      if (error.message === 'API configuration missing') {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
};
