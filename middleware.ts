import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { markketConfig } from './markket/config';

/**
 * Routes that require authentication
 * @type {string[]}
 */
const PROTECTED_ROUTES: string[] = [
  '/api/stripe/connect',
  // '/api/markket/store',
  // '/dashboard',
];

/**
 * Next.js middleware to protect certain routes,
 * It verifies the JWT token from the request headers
 * and checks if the user is authorized to access the requested store
 * @param request
 * @returns
 */
export async function middleware(request: NextRequest) {

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

    // For store-specific routes, verify store ownership
    if (request.nextUrl.pathname.includes('/api/stripe/connect')) {
      const storeId = request.nextUrl.searchParams.get('store');

      if (storeId) {
        const storeResponse = await fetch(
          `${markketConfig.api}/api/store/${storeId}`,
          {
            headers: {
              'Authorization': `Bearer ${markketConfig.admin_token}`,
            },
          }
        );

        const storeData = await storeResponse.json();
        console.info('Found store data:', storeData);
        if (!storeData?.data?.users?.includes(userData.documentId)) {
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

/** Paths that use this middleware */
export const config = {
  matcher: [
    '/api/stripe/connect/:path*',
    // '/api/markket/:path*',
    // '/dashboard/:path*',
  ],
};


