export const TIENDA_CONTENT_LIST_QUERY = {
  article: { sort: 'updatedAt:desc', pageSize: 200 },
  page: { sort: 'updatedAt:desc', pageSize: 200 },
  product: { sort: 'updatedAt:desc', pageSize: 200 },
  event: { sort: 'startDate:asc', pageSize: 200 },
} as const;

export const TIENDA_OVERVIEW_PREVIEW_LIMIT = 5;