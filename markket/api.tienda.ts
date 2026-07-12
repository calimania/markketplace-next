import type { TiendaContentType, TiendaItemId, TiendaRef } from './tienda.endpoints';
import { tiendaCollectionPath, tiendaItemPath } from './tienda.endpoints';
import { markketplace } from './config';

type TiendaRequestOptions = {
  token: string;
  query?: Record<string, string | number | boolean | undefined | null | string[]>;
  body?: unknown;
  baseUrl?: string;
};

type TiendaOverviewListOptions = {
  token: string;
  baseUrl?: string;
  queries?: Partial<Record<'article' | 'page' | 'product' | 'event', TiendaRequestOptions['query']>>;
};

type TiendaInboxSummaryOptions = {
  token: string;
  page?: number;
  pageSize?: number;
  limit?: number;
  search?: string;
  baseUrl?: string;
};

type TiendaUploadOptions = {
  token: string;
  files: File[];
  caption?: string;
  alternativeText?: string;
  fileInfo?: unknown;
  attach?: {
    contentType: string;
    itemId?: string | number;
    field: string;
    mode?: 'replace' | 'append';
  };
  baseUrl?: string;
};

function withQuery(path: string, query?: TiendaRequestOptions['query']) {
  if (!query) return path;

  const params = new URLSearchParams();

  Object.entries(query).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;

    if (Array.isArray(value)) {
      value.forEach((item) => {
        params.append(key, String(item));
      });
      return;
    }

    params.set(key, String(value));
  });

  const queryString = params.toString();
  return queryString ? `${path}?${queryString}` : path;
}

function resolveBaseUrl(baseUrl?: string) {
  if (baseUrl && baseUrl.trim()) {
    return baseUrl.replace(/\/$/, '');
  }

  if (typeof window === 'undefined') {
    return (markketplace.app_url || '').replace(/\/$/, '');
  }

  return '';
}

function resolveRequestUrl(path: string, baseUrl?: string) {
  return `${resolveBaseUrl(baseUrl)}${path}`;
}

async function tiendaFetch(method: string, path: string, options: TiendaRequestOptions) {
  const { token, body, baseUrl } = options;
  const requestUrl = resolveRequestUrl(path, baseUrl);

  if (!token) {
    throw new Error('Missing JWT token for Tienda request');
  }

  console.log(`[tiendaFetch] ${method} ${requestUrl}`, body ? { bodyKeys: Object.keys(body), body } : {});

  const response = await fetch(requestUrl, {
    method,
    cache: method === 'GET' ? 'no-store' : 'default',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  const contentType = response.headers.get('content-type') || '';
  const responseRequestId = response.headers.get('x-request-id') || undefined;

  console.log(`[tiendaFetch] ${method} response status:`, response.status, responseRequestId ? { requestId: responseRequestId } : {});

  if (contentType.includes('application/json')) {
    const data = await response.json();
    return {
      ...data,
      requestId: data?.requestId || responseRequestId,
      status: response.status,
    };
  }

  return {
    ok: response.ok,
    status: response.status,
    requestId: responseRequestId,
    text: await response.text(),
  };
}

async function tiendaUpload(ref: TiendaRef, options: TiendaUploadOptions) {
  const { token, files, caption, alternativeText, fileInfo, attach, baseUrl } = options;

  if (!token) {
    throw new Error('Missing JWT token for Tienda upload request');
  }

  if (!files?.length) {
    throw new Error('No files provided for upload');
  }

  const formData = new FormData();

  files.forEach((file, index) => {
    formData.append(index === 0 ? 'file' : 'files', file);
  });

  if (caption) {
    formData.append('caption', caption);
  }

  if (alternativeText) {
    formData.append('alternativeText', alternativeText);
  }

  if (fileInfo !== undefined) {
    formData.append('fileInfo', typeof fileInfo === 'string' ? fileInfo : JSON.stringify(fileInfo));
  }

  if (attach) {
    formData.append('attach', JSON.stringify(attach));
    console.log('[tiendaUpload] attach:', attach);
  }

  const url = resolveRequestUrl(`/api/tienda/stores/${ref}/upload`, baseUrl);
  console.log('[tiendaUpload] uploading', files.length, 'file(s) to', url);

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  const contentType = response.headers.get('content-type') || '';
  const responseRequestId = response.headers.get('x-request-id') || undefined;
  console.log('[tiendaUpload] response status:', response.status, 'content-type:', contentType);

  if (contentType.includes('application/json')) {
    const data = await response.json();

    if (!response.ok) {
      console.error('[tiendaUpload] error response:', JSON.stringify(data).slice(0, 200));
    }

    return {
      ...data,
      ok: data?.ok ?? response.ok,
      status: response.status,
      requestId: data?.requestId || responseRequestId,
    };
  }

  const text = await response.text();

  if (!response.ok) {
    console.error('[tiendaUpload] error response:', text.slice(0, 200));
  }

  return {
    ok: response.ok,
    status: response.status,
    requestId: responseRequestId,
    text,
  };
}

export const tiendaClient = {
  fetchInboxSummary(options: TiendaInboxSummaryOptions) {
    const { token, page, pageSize, limit, search, baseUrl } = options;
    const params = new URLSearchParams();

    if (typeof page === 'number' && Number.isFinite(page) && page >= 1) {
      params.set('page', String(Math.max(1, Math.floor(page))));
    }

    const resolvedPageSize = typeof pageSize === 'number' && Number.isFinite(pageSize)
      ? Math.min(100, Math.max(1, Math.floor(pageSize)))
      : undefined;

    const resolvedLimit = typeof limit === 'number' && Number.isFinite(limit)
      ? Math.min(100, Math.max(1, Math.floor(limit)))
      : undefined;

    if (resolvedPageSize !== undefined) {
      params.set('pageSize', String(resolvedPageSize));
      params.set('limit', String(resolvedPageSize));
    } else if (resolvedLimit !== undefined) {
      params.set('limit', String(resolvedLimit));
    }

    const query = typeof search === 'string' ? search.trim() : '';
    if (query) {
      params.set('search', query);
    }

    const path = params.toString() ? `/api/tienda/inbox/summary?${params.toString()}` : '/api/tienda/inbox/summary';
    return tiendaFetch('GET', path, { token, baseUrl });
  },

  async getStore(ref: TiendaRef, options: TiendaRequestOptions) {
    const primaryPath = withQuery(`/api/tienda/stores/${ref}`, options.query);
    const primaryResponse = await tiendaFetch('GET', primaryPath, options);

    if ((primaryResponse as { status?: number } | null)?.status === 404) {
      const aliasPath = withQuery(`/api/tienda/${ref}`, options.query);
      return tiendaFetch('GET', aliasPath, options);
    }

    return primaryResponse;
  },

  listContent(ref: TiendaRef, contentType: TiendaContentType, options: TiendaRequestOptions) {
    const path = withQuery(tiendaCollectionPath(ref, contentType), options.query);
    return tiendaFetch('GET', path, options);
  },

  async listOverviewContent(ref: TiendaRef, options: TiendaOverviewListOptions) {
    const { token, baseUrl, queries } = options;

    const [article, page, product, event] = await Promise.all([
      this.listContent(ref, 'article', { token, baseUrl, query: queries?.article }),
      this.listContent(ref, 'page', { token, baseUrl, query: queries?.page }),
      this.listContent(ref, 'product', { token, baseUrl, query: queries?.product }),
      this.listContent(ref, 'event', { token, baseUrl, query: queries?.event }),
    ]);

    return { article, page, product, event };
  },

  createContent(ref: TiendaRef, contentType: TiendaContentType, data: unknown, options: TiendaRequestOptions) {
    const path = tiendaCollectionPath(ref, contentType);
    return tiendaFetch('POST', path, { ...options, body: { data } });
  },

  getContent(ref: TiendaRef, contentType: TiendaContentType, itemId: TiendaItemId, options: TiendaRequestOptions) {
    const path = withQuery(tiendaItemPath(ref, contentType, itemId), options.query);
    return tiendaFetch('GET', path, options);
  },

  updateContent(ref: TiendaRef, contentType: TiendaContentType, itemId: TiendaItemId, data: unknown, options: TiendaRequestOptions) {
    const path = tiendaItemPath(ref, contentType, itemId);
    return tiendaFetch('PUT', path, { ...options, body: { data } });
  },

  deleteContent(ref: TiendaRef, contentType: TiendaContentType, itemId: TiendaItemId, options: TiendaRequestOptions) {
    const path = tiendaItemPath(ref, contentType, itemId);
    return tiendaFetch('DELETE', path, options);
  },

  uploadStoreMedia(ref: TiendaRef, options: TiendaUploadOptions) {
    return tiendaUpload(ref, options);
  },

  getMediaTargets(ref: TiendaRef, options: TiendaRequestOptions) {
    return tiendaFetch('GET', `/api/tienda/stores/${ref}/media-targets`, options);
  },

  storeAction(ref: TiendaRef, action: 'publish' | 'unpublish', options: TiendaRequestOptions) {
    return tiendaFetch('POST', `/api/tienda/stores/${ref}/actions/${action}`, options);
  },

  getEventRsvps(ref: TiendaRef, eventId: TiendaItemId, options: TiendaRequestOptions) {
    return tiendaFetch('GET', `/api/tienda/stores/${ref}/events/${eventId}/rsvps`, options);
  },

  syncEventRsvps(ref: TiendaRef, eventId: TiendaItemId, options: TiendaRequestOptions) {
    return tiendaFetch('POST', `/api/tienda/stores/${ref}/events/${eventId}/rsvps/sync`, options);
  },

  syncProductStripe(ref: TiendaRef, productId: TiendaItemId, options: TiendaRequestOptions) {
    return tiendaFetch('POST', `/api/tienda/stores/${ref}/products/${productId}/stripe-sync`, options);
  },

  syncEventStripe(ref: TiendaRef, eventId: TiendaItemId, options: TiendaRequestOptions) {
    return tiendaFetch('POST', `/api/tienda/stores/${ref}/events/${eventId}/stripe-sync`, options);
  },
};
