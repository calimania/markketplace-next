import { NextResponse } from 'next/server';
import { tiendaContract, tiendaContentTypes } from '@/markket/tienda.endpoints';
import { preflightResponse, withCors } from '@/app/api/tienda/_helpers';

export const fetchCache = 'force-no-store';

export async function GET() {
  return withCors(NextResponse.json({
    ok: true,
    audience: 'iphone-app',
    contractVersion: '2026-04-13.1',
    auth: tiendaContract.auth,
    identifiers: tiendaContract.identifiers,
    supportedContentTypes: tiendaContentTypes,
    endpoints: {
      list: {
        method: 'GET',
        path: tiendaContract.routes.collection.path,
        query: ['page', 'pageSize', 'search', 'status'],
      },
      create: {
        method: 'POST',
        path: tiendaContract.routes.collection.path,
        body: '{ data: {...content fields...} }',
      },
      get: {
        method: 'GET',
        path: tiendaContract.routes.item.path,
      },
      update: {
        method: 'PUT',
        path: tiendaContract.routes.item.path,
        body: '{ data: {...content fields...} }',
      },
      remove: {
        method: 'DELETE',
        path: tiendaContract.routes.item.path,
      },
      upload: {
        method: 'POST',
        path: tiendaContract.routes.upload.path,
        contentType: 'multipart/form-data',
        fields: ['file|files', 'caption?', 'altText|alternativeText?', 'fileInfo?', 'attach?'],
      },
      mediaTargets: {
        method: 'GET',
        path: tiendaContract.routes.mediaTargets.path,
      },
    },
    examples: {
      listArticles: '/api/tienda/stores/STORE_DOCUMENT_ID/content/article?page=1&pageSize=25',
      getArticle: '/api/tienda/stores/STORE_DOCUMENT_ID/content/article/ARTICLE_DOCUMENT_ID',
      createArticle: {
        path: '/api/tienda/stores/STORE_DOCUMENT_ID/content/article',
        body: {
          data: {
            Title: 'My Article',
            Content: [],
            slug: 'my-article',
          },
        },
      },
      uploadExample: {
        path: '/api/tienda/stores/STORE_DOCUMENT_ID/upload',
        fields: {
          files: ['slide-1.jpg', 'slide-2.jpg'],
          attach: {
            contentType: 'product',
            itemId: 'PRODUCT_DOCUMENT_ID',
            field: 'Slides',
            mode: 'replace',
          },
        },
      },
    },
    notes: [
      'Prefer documentId for store ref and item id.',
      'Slug is accepted as fallback when needed.',
      'All calls must include Authorization Bearer token.',
    ],
  }));
}

export const OPTIONS = preflightResponse;
