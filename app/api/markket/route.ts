import { NextRequest, NextResponse } from 'next/server';
import { markketplace } from '@/markket/config';
import qs from 'qs';

type ProxyRule = {
  methods: string[];
  requiresAuth: boolean;
  match: RegExp;
};

const PROXY_RULES: ProxyRule[] = [
  // Public auth endpoints used by login/register/reset/magic request flows.
  { methods: ['POST'], requiresAuth: false, match: /^\/api\/auth\/local$/ },
  { methods: ['POST'], requiresAuth: false, match: /^\/api\/auth\/local\/register$/ },
  { methods: ['POST'], requiresAuth: false, match: /^\/api\/auth\/forgot-password$/ },
  { methods: ['POST'], requiresAuth: false, match: /^\/api\/auth\/reset-password$/ },
  { methods: ['POST'], requiresAuth: false, match: /^\/api\/auth-magic\/request$/ },

  // Protected uploads and dashboard read-by-id endpoints.
  { methods: ['POST'], requiresAuth: true, match: /^\/api\/upload\/?$/ },
  {
    methods: ['GET'],
    requiresAuth: true,
    match: /^\/api\/(articles|pages|products|albums|tracks|events|subscribers|inboxes|forms|orders|stores)\/[^/?#]+$/,
  },
  {
    methods: ['GET'],
    requiresAuth: true,
    match: /^\/api\/(articles|pages|products|albums|tracks|events|subscribers|inboxes|forms|orders|stores)(\?.*)?$/,
  }
];

function normalizePath(path: string | null) {
  if (!path) return '';

  if (path.startsWith('/api/')) {
    return path;
  }

  if (path.startsWith('api/')) {
    return `/${path}`;
  }

  return `/api/${path.replace(/^\/+/, '')}`;
}

function findRule(method: string, path: string) {
  return PROXY_RULES.find((rule) => rule.methods.includes(method) && rule.match.test(path));
}

function readBearerToken(req: NextRequest) {
  const rawAuth = req.headers.get('authorization') || req.headers.get('Authorization') || '';
  const match = rawAuth.match(/^Bearer\s+(.+)$/i);
  return match?.[1]?.trim() || '';
}

type StoreOwnershipCheck = {
  allowed: boolean;
  reason: 'ok' | 'missing_token_or_store' | 'invalid_user_token' | 'missing_user_id' | 'stores_lookup_failed' | 'store_not_found' | 'user_not_in_store';
};

function extractStoreUsers(store: any): Array<{ id?: string | number; documentId?: string | number }> {
  const users = store?.users;

  if (Array.isArray(users)) return users;
  if (Array.isArray(users?.data)) return users.data;

  return [];
}

async function verifyStoreOwnership(token: string, storeIdentifier: string): Promise<StoreOwnershipCheck> {
  if (!token || !storeIdentifier) {
    return { allowed: false, reason: 'missing_token_or_store' };
  }

  try {
    const meResponse = await fetch(new URL('/api/users/me', markketplace.api), {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      next: { revalidate: 0 },
    });

    if (!meResponse.ok) {
      return { allowed: false, reason: 'invalid_user_token' };
    }

    const me = await meResponse.json();
    const userId = me?.id;
    const userDocumentId = me?.documentId;

    if (!userId && !userDocumentId) {
      return { allowed: false, reason: 'missing_user_id' };
    }

    const query = qs.stringify({
      filters: {
        users: {
          id: {
            $eq: userId,
          },
        },
      },
      pagination: {
        page: 1,
        pageSize: 200,
      },
      fields: ['id', 'documentId'],
    }, { encodeValuesOnly: true });

    const storesResponse = await fetch(new URL(`/api/stores?${query}`, markketplace.api), {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      next: { revalidate: 0 },
    });

    if (storesResponse.ok) {
      const storesPayload = await storesResponse.json();
      const stores = Array.isArray(storesPayload?.data) ? storesPayload.data : [];

      const directMatch = stores.some((store: any) => `${store?.id}` === `${storeIdentifier}` || `${store?.documentId}` === `${storeIdentifier}`);
      if (directMatch) {
        return { allowed: true, reason: 'ok' };
      }
    }

    const specificStoreQuery = qs.stringify({
      filters: {
        $or: [
          { id: { $eq: Number.isNaN(Number(storeIdentifier)) ? -1 : Number(storeIdentifier) } },
          { documentId: { $eq: storeIdentifier } },
        ],
      },
      fields: ['id', 'documentId'],
      populate: {
        users: {
          fields: ['id', 'documentId'],
        },
      },
      pagination: {
        page: 1,
        pageSize: 1,
      },
    }, { encodeValuesOnly: true });

    const specificStoreResponse = await fetch(new URL(`/api/stores?${specificStoreQuery}`, markketplace.api), {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      next: { revalidate: 0 },
    });

    if (!specificStoreResponse.ok) {
      return { allowed: false, reason: 'stores_lookup_failed' };
    }

    const specificStorePayload = await specificStoreResponse.json();
    const targetStore = Array.isArray(specificStorePayload?.data) ? specificStorePayload.data[0] : null;

    if (!targetStore) {
      return { allowed: false, reason: 'store_not_found' };
    }

    const users = extractStoreUsers(targetStore);
    const ownsStore = users.some((user: any) => {
      const matchesNumericId = userId !== undefined && userId !== null && (`${user?.id}` === `${userId}` || `${user?.documentId}` === `${userId}`);
      const matchesDocumentId = !!userDocumentId && (`${user?.id}` === `${userDocumentId}` || `${user?.documentId}` === `${userDocumentId}`);
      return matchesNumericId || matchesDocumentId;
    });

    if (!ownsStore) {
      return { allowed: false, reason: 'user_not_in_store' };
    }

    return { allowed: true, reason: 'ok' };
  } catch (error) {
    console.error('Upload ownership verification failed:', error);
    return { allowed: false, reason: 'stores_lookup_failed' };
  }
}

/**
 * @swagger
 * components:
 *   schemas:
 *     CollectionItem:
 *       type: object
 *       properties:
 *         id:
 *           type: number
 *           example: 3
 *         documentId:
 *           type: string
 *           example: "u6gmw4g46s4a5citybgx1g16"
 *         title:
 *           type: string
 *           example: "Jessica Santana, Co-founder and CEO at America On Tech"
 *         slug:
 *           type: string
 *           example: "jessica-santana"
 *         bio:
 *           type: string
 *           example: "## Jessica Santana\nCo-founder and CEO at America On Tech..."
 *         URLS:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               id:
 *                 type: number
 *               Label:
 *                 type: string
 *               URL:
 *                 type: string
 *
 *     Collection:
 *       type: object
 *       required:
 *         - id
 *         - title
 *         - slug
 *         - items
 *       properties:
 *         id:
 *           type: number
 *           example: 3
 *         documentId:
 *           type: string
 *           example: "vv980fdda07oirdzvlsrlr8w"
 *         title:
 *           type: string
 *           example: "#NYCTech Week Club Calima speakers"
 *         slug:
 *           type: string
 *           example: "summit-2025-speakers"
 *         description:
 *           type: string
 *         items:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/CollectionItem'
 *
 *     CollectionResponse:
 *       type: object
 *       properties:
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Collection'
 *         meta:
 *           type: object
 *           properties:
 *             pagination:
 *               type: object
 *               properties:
 *                 page:
 *                   type: number
 *                   example: 1
 *                 pageSize:
 *                   type: number
 *                   example: 25
 *                 pageCount:
 *                   type: number
 *                   example: 1
 *                 total:
 *                   type: number
 *                   example: 1
 *
 * /api/markket/collections:
 *   get:
 *     summary: Get collections
 *     description: Retrieve a list of collections with their items
 *     parameters:
 *       - in: query
 *         name: slug
 *         schema:
 *           type: string
 *         description: Collection slug to filter by
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 25
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: Successful response with collections
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CollectionResponse'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
async function handler(req: NextRequest) {
  const requestUrl = new URL(req.url);
  const rawPath = requestUrl.searchParams.get('path');
  const path = normalizePath(rawPath);

  if (!path) {
    return NextResponse.json(
      { error: 'Path parameter is required' },
      { status: 400 }
    );
  }

  const rule = findRule(req.method, path);

  if (!rule) {
    return NextResponse.json(
      { error: 'Path or method is not allowed for proxy access' },
      { status: 403 }
    );
  }

  const targetUrl = new URL(
    path,
    markketplace.api,
  );

  requestUrl.searchParams.delete('path');
  targetUrl.search = requestUrl.searchParams.toString();

  console.log(`Proxie:${req.method}:${targetUrl.toString()}`);

  const token = readBearerToken(req);

  if (rule.requiresAuth) {
    if (!token) {
      return NextResponse.json(
        { error: 'Authorization required for this endpoint' },
        { status: 401 }
      );
    }
  }
  try {
    // Handle multipart form data differently than JSON to allow binary uploads
    const contentType = req.headers.get('content-type') || '';
    const isMultipart = contentType.includes('multipart/form-data');

    const fetchHeaders: Record<string, string> = {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    const fetchOptions: RequestInit = {
      method: req.method,
      headers: fetchHeaders,
    };

    if (isMultipart) {
      const formData = await req.formData();

      if (path.startsWith('/api/upload')) {
        const storeId = formData.get('storeId')?.toString().trim() || '';

        if (storeId) {
          const storeCheck = await verifyStoreOwnership(token, storeId);

          if (!storeCheck.allowed) {
            return NextResponse.json(
              {
                error: 'Store not found or unauthorized for upload',
                reason: storeCheck.reason,
              },
              { status: 403 }
            );
          }
        }
      }

      fetchOptions.body = formData;
    } else {
      fetchOptions.headers = {
        ...(fetchOptions.headers as Record<string, string>),
        'Content-Type': 'application/json',
      };
      if (req.method !== 'GET' && req.method !== 'HEAD') {
        fetchOptions.body = JSON.stringify(await req.json());
      }
    }

    const response = await fetch(targetUrl.toString(), fetchOptions);
    const responseContentType = response.headers.get('content-type') || '';

    if (responseContentType.includes('application/json')) {
      const data = await response.json();
      return NextResponse.json(data, { status: response.status });
    }

    const text = await response.text();
    return new NextResponse(text, {
      status: response.status,
      headers: {
        'Content-Type': responseContentType || 'text/plain',
      },
    });

  } catch (error) {
    console.error('API proxy error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
};

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const DELETE = handler;
export const PATCH = handler;
