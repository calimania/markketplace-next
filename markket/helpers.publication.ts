export type TiendaPublication = {
  visibleStatus?: 'published' | 'draft' | 'unpublished';
  publishedAt?: string | null;
  hasPublished?: boolean;
  hasDraft?: boolean;
};

export type PublishedAtSource = {
  publishedAt?: string | null;
  tiendaPublication?: TiendaPublication;
};

/**
 * Checks if an item is published.
 * Prefers tiendaPublication.hasPublished (owner API canonical live/public field),
 * then falls back to visibleStatus,
 * falls back to publishedAt for public/strapi responses.
 */
export function isPublished(item: PublishedAtSource | null | undefined): boolean {
  if (typeof item?.tiendaPublication?.hasPublished === 'boolean') {
    return item.tiendaPublication.hasPublished;
  }

  if (item?.tiendaPublication?.visibleStatus) {
    return item.tiendaPublication.visibleStatus === 'published';
  }

  return typeof item?.publishedAt === 'string' && item.publishedAt.trim().length > 0;
}

export function getPublishLabel(item: PublishedAtSource | null | undefined): string {
  return 'Publish';
}
