import { markketConfig } from "./config";
import {headers } from 'next/headers';
import qs from 'qs';
import { Store } from "@/markket";
import { NextResponse } from 'next/server';

export async function verifyToken(token: string) {
  if (!token || !markketConfig.api) return null;

  try {
    const response = await fetch(new URL('api/users/me', markketConfig.api), {
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
  if (!markketConfig.api || !markketConfig.markket_api_key) {
    throw new Error('Server configuration missing');
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

export async function fetchUserStores() {
  const headersList = await headers();
  const token = headersList.get('authorization')?.split('Bearer ')[1];
  const user_id: string | number = headersList.get('markket-user-id') || '';

  const query = qs.stringify({
    filters: {
      users: {
        id: {
          $eq: user_id
        }
      }
    },
    sort: 'updatedAt:desc',
    populate: ['Logo', 'SEO.socialImage', 'Favicon', 'URLS', 'Cover', 'Slides', 'users'],
  }, {
    encodeValuesOnly: true
  });

  try {
    if (!token || !user_id) {
      throw new Error('Missing user credentials');
    }

    const response = await fetch(new URL(`api/stores?${query}`, markketConfig.api), {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      next: { revalidate: 3 }
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

export const errorResponses = {
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

export const validators = {
  config: () => !!markketConfig.api && !!markketConfig.markket_api_key,
  slug: (slug: string) => slug.length >= 5 && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug),
  storeContent: (store: Store) => store?.title && store?.Description && store?.slug,
  storePayload: (payload: { store: Store }) =>
    !!payload?.store?.title &&
    !!payload?.store?.Description &&
    !!payload?.store?.slug &&
    validators.slug(payload.store.slug)
}
