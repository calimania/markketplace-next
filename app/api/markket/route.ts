import { NextRequest, NextResponse } from 'next/server';
import { markketplace } from '@/markket/config';
import { verifyToken } from '@/markket/helpers.api';
import { headers } from 'next/headers';

type ProxyRule = {
  methods: string[];
  requiresAuth: boolean;
  match: RegExp;
};

type VerifiedUser = {
  id?: number | string;
  blocked?: boolean;
};

const PROXY_RULES: ProxyRule[] = [
  // Public auth endpoints used by login/register/reset/magic request flows.
  { methods: ['POST'], requiresAuth: false, match: /^\/api\/auth\/local$/ },
  { methods: ['POST'], requiresAuth: false, match: /^\/api\/auth\/local\/register$/ },
  { methods: ['POST'], requiresAuth: false, match: /^\/api\/auth\/forgot-password$/ },
  { methods: ['POST'], requiresAuth: false, match: /^\/api\/auth\/reset-password$/ },
  { methods: ['POST'], requiresAuth: false, match: /^\/api\/auth-magic\/request$/ },

  // Protected uploads and dashboard read-by-id endpoints.
  { methods: ['POST'], requiresAuth: true, match: /^\/api\/upload$/ },
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

function getContentType(path: string): string {
  const match = path.match(/^\/api\/([^/?#]+)/);
  return match?.[1] || '';
}

function isCollectionPath(path: string): boolean {
  return /^\/api\/[a-z-]+$/.test(path);
}

function getRequestedStoreSlug(searchParams: URLSearchParams): string | null {
  const keys = [
    'filters[store][slug][$eq]',
    'filters[store][slug]',
    'filters[stores][slug][$eq]',
    'filters[stores][slug]',
    'filters[slug][$eq]',
    'filters[slug]',
  ];

  for (const key of keys) {
    const value = searchParams.get(key);
    if (value) return value;
  }

  return null;
}

async function fetchAuthorizedStoreSlugs(userId: number | string) {
  const storeUrl = new URL('/api/stores', markketplace.api);
  storeUrl.searchParams.set('filters[users][id][$eq]', String(userId));
  storeUrl.searchParams.set('pagination[pageSize]', '100');
  storeUrl.searchParams.set('fields[0]', 'slug');

  const response = await fetch(storeUrl, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${markketplace.admin_token}`,
      'Content-Type': 'application/json',
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch authorized stores: ${response.status}`);
  }

  const data = await response.json();
  const slugs = ((data?.data || []) as Array<{ slug?: string }>)
    .map((store) => store.slug)
    .filter((slug): slug is string => !!slug);

  return new Set(slugs);
}

function applyAffiliationFilters(targetUrl: URL, contentType: string, storeSlugs: string[], userId: number | string) {
  if (contentType === 'stores') {
    targetUrl.searchParams.set('filters[users][id][$eq]', String(userId));
    return;
  }

  const usesManyStoresRelation = new Set(['products', 'events', 'subscribers', 'inboxes', 'forms', 'orders']);
  const relation = usesManyStoresRelation.has(contentType) ? 'stores' : 'store';

  storeSlugs.forEach((slug, index) => {
    targetUrl.searchParams.set(`filters[${relation}][slug][$in][${index}]`, slug);
  });
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

  const headersList = await headers();
  const token = headersList.get('authorization')?.split('Bearer ')[1] || '';

  if (rule.requiresAuth) {
    if (!token) {
      return NextResponse.json(
        { error: 'Authorization required for this endpoint' },
        { status: 401 }
      );
    }

    const user = await verifyToken(token) as VerifiedUser | null;

    if (!user?.id || user.blocked) {
      return NextResponse.json(
        { error: 'Unauthorized token' },
        { status: 401 }
      );
    }

    const contentType = getContentType(path);
    const canScopeByAffiliation = req.method === 'GET' && isCollectionPath(path) &&
      ['articles', 'pages', 'products', 'albums', 'tracks', 'events', 'subscribers', 'inboxes', 'forms', 'orders', 'stores'].includes(contentType);

    if (canScopeByAffiliation) {
      try {
        const authorizedStoreSlugs = await fetchAuthorizedStoreSlugs(user.id);
        const allowedSlugs = Array.from(authorizedStoreSlugs);

        if (contentType !== 'stores' && allowedSlugs.length === 0) {
          return NextResponse.json({ data: [], meta: { pagination: { page: 1, pageSize: 0, pageCount: 0, total: 0 } } }, { status: 200 });
        }

        const requestedStoreSlug = getRequestedStoreSlug(requestUrl.searchParams);
        if (requestedStoreSlug && contentType !== 'stores' && !authorizedStoreSlugs.has(requestedStoreSlug)) {
          return NextResponse.json(
            { error: 'Unauthorized store affiliation' },
            { status: 403 }
          );
        }

        applyAffiliationFilters(targetUrl, contentType, allowedSlugs, user.id);
      } catch (error) {
        console.error('Affiliation filter error:', error);
        return NextResponse.json(
          { error: 'Failed to validate store affiliation' },
          { status: 500 }
        );
      }
    }
  }
  try {
    // Handle multipart form data differently than JSON to allow binary uploads
    const contentType = req.headers.get('content-type') || '';
    const isMultipart = contentType.includes('multipart/form-data');

    const fetchOptions: RequestInit = {
      method: req.method,
      headers: {
        'Authorization': `Bearer ${markketplace.admin_token}`,
      }
    };

    if (isMultipart) {
      const formData = await req.formData();
      fetchOptions.body = formData;
    } else {
      fetchOptions.headers = {
        ...fetchOptions.headers,
        'Content-Type': 'application/json',
      };
      if (req.method !== 'GET' && req.method !== 'HEAD') {
        fetchOptions.body = JSON.stringify(await req.json());
      }
    }

    const response = await fetch(targetUrl.toString(), fetchOptions);
    const data = await response.json();

    return NextResponse.json(data, {
      status: response.status,
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
