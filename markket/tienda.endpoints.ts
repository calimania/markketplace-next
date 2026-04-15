export const tiendaBasePath = '/api/tienda';

export const tiendaContentTypes = [
  'article',
  'page',
  'album',
  'track',
  'category',
  'product',
  'event',
  'shortner',
  'order',
] as const;

export type TiendaContentType = (typeof tiendaContentTypes)[number];

export type TiendaMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';
export type TiendaRef = string | number;
export type TiendaItemId = string | number;

export function tiendaCollectionPath(ref: TiendaRef, contentType: TiendaContentType) {
  return `${tiendaBasePath}/stores/${ref}/content/${contentType}`;
}

export function tiendaItemPath(ref: TiendaRef, contentType: TiendaContentType, itemId: TiendaItemId) {
  return `${tiendaCollectionPath(ref, contentType)}/${itemId}`;
}

export const tiendaContract = {
  identifiers: {
    storeRef: {
      accepts: ['documentId', 'slug'],
      preferred: 'documentId',
    },
    itemId: {
      accepts: ['documentId', 'id', 'slug'],
      preferred: 'documentId',
    },
  },
  auth: {
    type: 'bearer',
    required: true,
    header: 'Authorization: Bearer {JWT_TOKEN}',
  },
  routes: {
    collection: {
      path: '/api/tienda/stores/:ref/content/:contentType',
      methods: ['GET', 'POST'] as TiendaMethod[],
    },
    item: {
      path: '/api/tienda/stores/:ref/content/:contentType/:itemId',
      methods: ['GET', 'PUT', 'DELETE'] as TiendaMethod[],
    },
    upload: {
      path: '/api/tienda/stores/:ref/upload',
      methods: ['POST'] as TiendaMethod[],
    },
    mediaTargets: {
      path: '/api/tienda/stores/:ref/media-targets',
      methods: ['GET'] as TiendaMethod[],
    },
  },
};
