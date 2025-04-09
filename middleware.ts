import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { markketConfig } from './markket/config';

/**
 * Routes that require authentication
 * @type {string[]}
 */
const PROTECTED_ROUTES: string[] = [
  '/api/stripe/connect',
];

/**
 * Next.js middleware to protect certain routes,
 * It verifies the JWT token from the request headers
 * and checks if the user is authorized to access the requested store
 * @param request
 * @returns
 */
export async function middleware(request: NextRequest) {

  if (request.headers.get('x-middleware-subrequest')) {
    return NextResponse.json(
      { error: 'Subrequest not allowed' },
      { status: 400 }
    );
  }

  const isProtectedRoute = PROTECTED_ROUTES.some(route =>
    request.nextUrl.pathname.startsWith(route)
  );

  if (!isProtectedRoute) {
    console.warn('middleware:bypass:', request.nextUrl.pathname);
    return NextResponse.next();
  }

  /** read token from request to verify against Strapi */
  const token = request.headers.get('authorization')?.replace('Bearer ', '');

  if (!token) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    );
  }

  try {
    const verifyResponse = await fetch(new URL(`/api/users/me`, markketConfig.api), {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!verifyResponse.ok) {
      console.warn('middleware:token:verification:', verifyResponse.status);
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    const userData = await verifyResponse.json();

    const body = await request.json();
    const storeId = body.store;

    // for stores, check that the user exists in the store
    if (storeId || request.nextUrl.pathname.includes('/api/stripe/connect')) {

      if (storeId) {
        const url = new URL(`/api/stores/${storeId}?populate=users`, markketConfig.api);

        const storeResponse = await fetch(url,
          {
            headers: {
              'Authorization': `Bearer ${markketConfig.admin_token}`,
            },
          }
        );

        const storeData = await storeResponse.json();

        console.info('middleware:store:verification:', {
          storeResponse: storeResponse.status,
          store: storeData?.documentId,
          user: userData?.documentId
        });

        const flattened_user_ids = storeData?.data?.users?.map((user: any) => user.documentId);

        if (!flattened_user_ids?.includes(userData.documentId)) {
          return NextResponse.json(
            { error: 'Not authorized for this store' },
            { status: 403 }
          );
        }
      }
    }

    // Add user info to request headers for downstream use
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', userData.id);
    requestHeaders.set('x-user-email', userData.email);

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });

  } catch (error) {
    console.error('Auth middleware error:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    );
  }
}

/** paths that use this middleware */
export const config = {
  matcher: [
    '/api/stripe/connect/:path*',
  ],
};

