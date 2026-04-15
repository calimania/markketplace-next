import { markketplace } from "./config";
import {headers } from 'next/headers';
import qs from 'qs';
import { Store } from "./store";
import { NextResponse } from 'next/server';
import { strapiClient } from "./api.strapi";

export async function verifyToken(token: string) {
  if (!token || !markketplace.api) return null;

  try {
    const response = await fetch(new URL('api/users/me', markketplace.api), {
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
  if (!markketplace.api) {
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

  try {
    if (!token) {
      throw new Error('Missing user credentials');
    }

    const response = await fetch(new URL('api/tienda/stores', markketplace.api), {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      next: { revalidate: 1 }
    });


    if (!response.ok) {
      console.warn(`fetch:error:user.stores`, { status: response.status });

      return ({
        status: response.status
      });
    }

    const payload = await response.json();
    if (Array.isArray(payload?.data)) {
      return payload;
    }

    if (Array.isArray(payload)) {
      return { data: payload };
    }

    return payload || { data: [] };
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
  config: () => !!markketplace.api,
  slug: (slug: string) => slug.length >= 5 && /^[a-z0-9](.)+(?:-[a-z0-9]+)*$/.test(slug),
  short_slug: (slug: string) => slug.length >= 3 && /^[a-z0-9](.)+(?:-[a-z0-9]+)*$/.test(slug),
  // Keep store saves resilient across web/iOS clients; Description is optional.
  storeContent: (store: Store) => !!store?.title && !!store?.slug,
  storePayload: (payload: { store: Store }) =>
    !!payload?.store?.title &&
    !!payload?.store?.slug &&
    validators.slug(payload.store.slug)
}

export async function countContentTypeItems(plural: string, limit: number, storeId: string | number, token: string) {
  if (!plural || !limit) return 0;

  try {
    const response = await strapiClient.fetch({
      headers: {
        Authorization: `Bearer ${token}`,
      },
      contentType: plural,
      filters: {
        stores: {
          id: {
            $eq: storeId
          }
        }
      },
      paginate: {
        limit: 1
      }
    });

    return response.meta?.pagination?.total || 0;
  } catch (error) {
    console.error(`Error counting ${plural} items:`, error);
    return 0;
  }
}
