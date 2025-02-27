import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import qs from 'qs';

const STRAPI_URL = process.env.NEXT_PUBLIC_MARKKET_API || 'https://api.markket.place/';
const ADMIN_TOKEN = process.env.MARKKET_API_KEY;

interface CreateStorePayload {
  title: string;
  Description: string;
  slug: string;
}

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
 * components:
 *   schemas:
 *     Store:
 *       type: object
 *       properties:
 *         data:
 *           type: object
 *           properties:
 *             id:
 *               type: number
 *               example: 1
 *             title:
 *               type: string
 *               example: "Makeup store"
 *             Description:
 *               type: string
 *               example: "For clowns and actors"
 *             slug:
 *               type: string
 *               example: "makeup-clowns"
 *             documentId:
 *               type: string
 *               example: "abc123xyz789"
 *             createdAt:
 *               type: string
 *               format: date-time
 *             Logo:
 *               type: object
 *               properties:
 *                 url:
 *                   type: string
 *             Favicon:
 *               type: object
 *               properties:
 *                 url:
 *                   type: string
 *             SEO:
 *               type: object
 *               properties:
 *                 metaTitle:
 *                   type: string
 *                 metaDescription:
 *                   type: string
 *             URLS:
 *               type: array
 *               items:
 *                 type: string
 */

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


/**
 * @swagger
 * /api/markket/store:
 *   post:
 *     summary: Create a new store
 *     description: |
 *       Creates a new store for the authenticated user.
 *       Requires a valid JWT token in the Authorization header.
 *       Uses admin token to create store in Strapi.
 *     tags:
 *       - Stores
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - Description
 *               - slug
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Makeup store"
 *               Description:
 *                 type: string
 *                 example: "For clowns and actors"
 *               slug:
 *                 type: string
 *                 minLength: 5
 *                 pattern: ^[a-z0-9]+(?:-[a-z0-9]+)*$
 *                 example: "makeup-clowns"
 *     responses:
 *       201:
 *         description: Store created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Store'
 *       400:
 *         description: Invalid request payload
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Invalid slug format"
 *       401:
 *         description: Authentication error
 *       500:
 *         description: Internal server error
 */
export async function POST(request: Request) {
  if (!STRAPI_URL || !ADMIN_TOKEN) {
    return NextResponse.json(
      { error: 'API configuration missing' },
      { status: 400 }
    );
  }

  try {
    // Verify user's JWT
    const headersList = headers();
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

    // Validate request body
    const payload: CreateStorePayload = await request.json();

    if (!payload.title || !payload.Description || !payload.slug) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (payload.slug.length < 5) {
      return NextResponse.json(
        { error: 'Slug must be at least 5 characters' },
        { status: 400 }
      );
    }

    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(payload.slug)) {
      return NextResponse.json(
        { error: 'Invalid slug format' },
        { status: 400 }
      );
    }

    // Create store in Strapi
    const response = await fetch(`${STRAPI_URL}/api/stores`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ADMIN_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data: {
          ...payload,
          users: [userData.id],
          active: true,
        }
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to create store');
    }

    const data = await response.json();

    return NextResponse.json(data, { status: 201 });

  } catch (error) {
    console.error('Store creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
};
