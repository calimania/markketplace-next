export type PublishedAtSource = {
  publishedAt?: string | null;
};

export function isPublished(item: PublishedAtSource | null | undefined): boolean {
  return typeof item?.publishedAt === 'string' && item.publishedAt.trim().length > 0;
}
