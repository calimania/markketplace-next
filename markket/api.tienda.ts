import type { TiendaContentType, TiendaItemId, TiendaRef } from './tienda.endpoints';
import { tiendaCollectionPath, tiendaItemPath } from './tienda.endpoints';

type TiendaRequestOptions = {
  token: string;
  query?: Record<string, string | number | boolean | undefined | null | string[]>;
  body?: unknown;
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

async function tiendaFetch(method: string, path: string, options: TiendaRequestOptions) {
  const { token, body, baseUrl = '' } = options;

  if (!token) {
    throw new Error('Missing JWT token for Tienda request');
  }

  console.log(`[tiendaFetch] ${method} ${baseUrl}${path}`, body ? { bodyKeys: Object.keys(body), body } : {});

  const response = await fetch(`${baseUrl}${path}`, {
    method,
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
  const { token, files, caption, alternativeText, fileInfo, attach, baseUrl = '' } = options;

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

  const url = `${baseUrl}/api/tienda/stores/${ref}/upload`;
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
  listContent(ref: TiendaRef, contentType: TiendaContentType, options: TiendaRequestOptions) {
    const path = withQuery(tiendaCollectionPath(ref, contentType), options.query);
    return tiendaFetch('GET', path, options);
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
};
