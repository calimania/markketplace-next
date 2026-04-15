import { NextResponse } from 'next/server';
import { tiendaBasePath, tiendaContentTypes, tiendaContract } from '@/markket/tienda.endpoints';
import { preflightResponse, withCors } from '@/app/api/tienda/_helpers';

export const fetchCache = 'force-no-store';

export async function GET() {
  return withCors(NextResponse.json({
    ok: true,
    title: 'Tienda API Contract',
    basePath: tiendaBasePath,
    identifiers: tiendaContract.identifiers,
    auth: tiendaContract.auth,
    contentTypes: tiendaContentTypes,
    endpoints: [
      {
        name: 'List Content Items',
        method: 'GET',
        path: tiendaContract.routes.collection.path,
      },
      {
        name: 'Create Content Item',
        method: 'POST',
        path: tiendaContract.routes.collection.path,
      },
      {
        name: 'Get Content Item',
        method: 'GET',
        path: tiendaContract.routes.item.path,
      },
      {
        name: 'Update Content Item',
        method: 'PUT',
        path: tiendaContract.routes.item.path,
      },
      {
        name: 'Delete Content Item',
        method: 'DELETE',
        path: tiendaContract.routes.item.path,
      },
      {
        name: 'Upload Store Media',
        method: 'POST',
        path: tiendaContract.routes.upload.path,
      },
      {
        name: 'Get Media Targets',
        method: 'GET',
        path: tiendaContract.routes.mediaTargets.path,
      },
    ],
    examples: {
      listArticles: '/api/tienda/stores/STORE_DOCUMENT_ID/content/article?page=1&pageSize=25',
      getArticle: '/api/tienda/stores/STORE_DOCUMENT_ID/content/article/ARTICLE_DOCUMENT_ID',
      createArticle: '/api/tienda/stores/STORE_DOCUMENT_ID/content/article',
      updateArticle: '/api/tienda/stores/STORE_DOCUMENT_ID/content/article/ARTICLE_DOCUMENT_ID',
      deleteArticle: '/api/tienda/stores/STORE_DOCUMENT_ID/content/article/ARTICLE_DOCUMENT_ID',
      uploadStoreMedia: '/api/tienda/stores/STORE_DOCUMENT_ID/upload',
      mediaTargets: '/api/tienda/stores/STORE_DOCUMENT_ID/media-targets',
    },
    notes: [
      'All endpoints require Authorization: Bearer {JWT_TOKEN}.',
      'Prefer documentId for both store ref and content item identifiers.',
      'Store authorization is delegated to upstream API.',
      'This contract is the mobile-facing API surface.',
      'For an iPhone-focused endpoint profile see /api/tienda/mobile.',
    ],
  }));
}

export const OPTIONS = preflightResponse;
