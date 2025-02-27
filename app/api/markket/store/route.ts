import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import qs from 'qs';

const STRAPI_URL = process.env.NEXT_PUBLIC_MARKKET_API || 'https://api.markket.place/';
const ADMIN_TOKEN = process.env.MARKKET_API_KEY;

async function verifyToken(token: string) {
  const _url = new URL('api/users/me', STRAPI_URL);

  try {
    const response = await fetch(_url.toString(), {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('Token verification response:', response);

    if (!response.ok) {
      return null;
    }

    return response.json();
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

async function fetchUserStores(userId: number) {
  const query = qs.stringify({
    filters: {
      users: {
        id: {
          $eq: userId
        }
      }
    },
    populate: ['Logo', 'SEO.socialImage', 'Favicon', 'URLS'],
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

/**
 * @swagger
 * /api/markket/store:
 *   get:
 *     summary: Retrieve stores for authenticated user
 *     description: |
 *       Fetches all stores associated with the authenticated user.
 *       Requires a valid JWT token in the Authorization header.
 *       Uses admin token to fetch from Strapi with user-specific filters.
 *     tags:
 *       - Stores
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of stores for the authenticated user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: number
 *                       title:
 *                         type: string
 *                       slug:
 *                         type: string
 *                       Logo:
 *                         type: object
 *                       Favicon:
 *                         type: object
 *                       SEO:
 *                         type: object
 *                       URLS:
 *                         type: array
 *       400:
 *         description: Missing API configuration
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Bad request
 *       401:
 *         description: Authentication error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: No token provided
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Internal server error
 */
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
