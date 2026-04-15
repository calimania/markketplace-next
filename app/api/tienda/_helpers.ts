import { NextRequest, NextResponse } from 'next/server';
import { markketplace } from '@/markket/config';
import { tiendaContentTypes } from '@/markket/tienda.endpoints';

export const fetchCache = 'force-no-store';

const ALLOWED_CONTENT_TYPES = new Set<string>(tiendaContentTypes as readonly string[]);
const AUTO_PUBLISH_CONTENT_TYPES = new Set<string>(['article', 'page', 'product', 'event', 'album', 'track']);

const DEFAULT_STORE_POPULATE = ['Logo', 'SEO', 'SEO.socialImage', 'Favicon', 'URLS', 'Cover', 'Slides'];

const DEFAULT_CONTENT_POPULATE: Record<string, string[]> = {
  article: ['SEO', 'SEO.socialImage', 'Tags', 'cover', 'store', 'store.Logo'],
  page: ['SEO', 'SEO.socialImage', 'store', 'store.Logo', 'albums', 'albums.cover', 'albums.SEO', 'albums.tracks'],
  product: ['SEO', 'SEO.socialImage', 'Thumbnail', 'Slides', 'PRICES', 'stores', 'stores.Logo', 'extras'],
  event: ['SEO', 'SEO.socialImage', 'Tag', 'Thumbnail', 'Slides', 'stores', 'stores.Logo'],
  album: ['SEO', 'cover', 'tracks', 'tracks.SEO', 'tracks.media', 'store', 'store.Logo'],
  track: ['SEO', 'media', 'urls', 'store', 'store.Logo'],
};

function hasPopulateParams(searchParams: URLSearchParams) {
  for (const key of searchParams.keys()) {
    if (key === 'populate' || key.startsWith('populate[')) {
      return true;
    }
  }

  return false;
}

function appendPopulateDefaults(searchParams: URLSearchParams, fields: string[]) {
  fields.forEach((field) => {
    searchParams.append('populate[]', field);
  });
}

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Authorization, Content-Type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
};

export function withCors(response: NextResponse) {
  Object.entries(CORS_HEADERS).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  return response;
}

export function preflightResponse() {
  return new NextResponse(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
}

export function readBearerToken(req: NextRequest) {
  const raw = req.headers.get('authorization') || req.headers.get('Authorization') || '';
  const match = raw.match(/^Bearer\s+(.+)$/i);
  return match?.[1]?.trim() || '';
}

export function requireBearerToken(req: NextRequest) {
  const token = readBearerToken(req);

  if (!token) {
    const response = withCors(NextResponse.json(
      { ok: false, message: 'Authentication required', status: 401 },
      { status: 401 },
    ));

    return {
      token: '',
      error: response,
    };
  }

  return { token, error: null as NextResponse | null };
}

export function validateContentType(contentType: string) {
  if (ALLOWED_CONTENT_TYPES.has(contentType)) {
    return null;
  }

  return withCors(NextResponse.json(
    { ok: false, message: 'Invalid content type', status: 400 },
    { status: 400 },
  ));
}

export function buildUpstreamUrl(req: NextRequest, path: string) {
  const target = new URL(path, markketplace.api);
  target.search = req.nextUrl.searchParams.toString();
  return target;
}

export async function proxyToUpstream(req: NextRequest, upstreamUrl: URL, token: string) {
  const contentType = req.headers.get('content-type') || '';
  const isMultipart = contentType.includes('multipart/form-data');
  const method = req.method.toUpperCase();
  const shouldAttachRequestId = method === 'POST' || method === 'PUT' || method === 'DELETE';
  const requestId = req.headers.get('x-request-id')?.trim() || crypto.randomUUID();

  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
  };

  if (shouldAttachRequestId) {
    headers['X-Request-Id'] = requestId;
  }

  if (!isMultipart && req.method !== 'GET' && req.method !== 'HEAD') {
    headers['Content-Type'] = 'application/json';
  }

  const targetUrl = new URL(upstreamUrl.toString());
  const isTiendaContentRequest = targetUrl.pathname.includes('/api/tienda/stores/') && targetUrl.pathname.includes('/content/');
  const contentTypeMatch = targetUrl.pathname.match(/\/content\/([^/]+)/);
  const targetContentType = contentTypeMatch?.[1];
  const shouldAutoPublish = isTiendaContentRequest && !!targetContentType && AUTO_PUBLISH_CONTENT_TYPES.has(targetContentType);

  // iOS and dashboard clients often omit populate params; provide media-rich defaults.
  if (method === 'GET' && !hasPopulateParams(targetUrl.searchParams)) {
    const isStoresCollectionRequest = targetUrl.pathname === '/api/tienda/stores';

    if (isStoresCollectionRequest) {
      appendPopulateDefaults(targetUrl.searchParams, DEFAULT_STORE_POPULATE);
      console.log('[tiendaProxy] appended default store populate fields');
    }

    if (isTiendaContentRequest && targetContentType && DEFAULT_CONTENT_POPULATE[targetContentType]) {
      appendPopulateDefaults(targetUrl.searchParams, DEFAULT_CONTENT_POPULATE[targetContentType]);
      console.log(`[tiendaProxy] appended default populate fields for ${targetContentType}`);
    }
  }

  // Strapi draft/publish content types require status=published at create time for immediate visibility.
  if (method === 'POST' && shouldAutoPublish && !targetUrl.searchParams.get('status')) {
    targetUrl.searchParams.set('status', 'published');
    console.log(`[tiendaProxy] appended status=published to ${targetContentType} create request`);
  }

  const options: RequestInit = {
    method: req.method,
    headers,
  };

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    if (isMultipart) {
      try {
        const incomingFormData = await req.formData();

        const fields: string[] = [];
        incomingFormData.forEach((value, key) => {
          if (value instanceof File) {
            fields.push(`${key}:File(${value.name}, ${value.size} bytes)`);
          } else {
            const preview = String(value).slice(0, 50);
            fields.push(`${key}:${preview}`);
          }
        });
        console.log('[tiendaProxy] multipart upload fields:', fields);

        options.body = incomingFormData;
      } catch (error) {
        console.error('[tiendaProxy] error reading FormData:', error instanceof Error ? error.message : String(error));
        throw error;
      }
    } else {
      const bodyJson = await req.json();

      // Auto-publish content on creation so it's visible on public pages immediately
      if (method === 'POST' && bodyJson?.data && typeof bodyJson.data === 'object' && !bodyJson.data.publishedAt) {
        bodyJson.data.publishedAt = new Date().toISOString();
        bodyJson.data.status = 'published';
        console.log('[tiendaProxy] injected publishedAt + status:published for auto-publish on create');
      }

      console.log(`[tiendaProxy] ${req.method} upstream body keys:`, Object.keys(bodyJson?.data || {}));
      options.body = JSON.stringify(bodyJson);
    }
  }

  console.log(`[tiendaProxy] sending to ${targetUrl.toString()}, method: ${req.method}, headers:`, Object.keys(headers));

  const response = await fetch(targetUrl.toString(), options);
  const responseContentType = response.headers.get('content-type') || '';

  console.log(`[tiendaProxy] upstream ${req.method} -> ${response.status} ${response.statusText}, content-type: ${responseContentType}`);

  if (!response.ok) {
    try {
      const errorText = await response.clone().text();
      const errorPreview = errorText.slice(0, 300);
      console.error(`[tiendaProxy] error response (${response.status}):`, errorPreview);
    } catch {
      console.error('[tiendaProxy] could not read error response body');
    }
  }

  const withRequestHeaders = (res: NextResponse) => {
    if (shouldAttachRequestId) {
      res.headers.set('X-Request-Id', requestId);
    }
    return withCors(res);
  };

  if (responseContentType.includes('application/json')) {
    const data = await response.json();

    if (shouldAttachRequestId && data && typeof data === 'object') {
      return withRequestHeaders(NextResponse.json(
        {
          ...data,
          requestId,
        },
        { status: response.status },
      ));
    }

    return withRequestHeaders(NextResponse.json(data, { status: response.status }));
  }

  const text = await response.text();
  return withRequestHeaders(new NextResponse(text, {
    status: response.status,
    headers: {
      'Content-Type': responseContentType || 'text/plain',
    },
  }));
}
