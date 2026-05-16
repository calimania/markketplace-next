/**
 * Special page slugs that map to top-level storefront routes.
 * All other slugs resolve to /{storeSlug}/about/{slug}.
 */
const PAGE_SLUG_ROUTES: Record<string, (storeSlug: string) => string> = {
  home: (s) => `/${s}`,
  about: (s) => `/${s}/about`,
  products: (s) => `/${s}/products`,
  events: (s) => `/${s}/events`,
  blog: (s) => `/${s}/blog`,
  newsletter: (s) => `/${s}/newsletter`,
};

export function resolvePagePreviewHref(storeSlug: string, pageSlug: string): string {
  const resolver = PAGE_SLUG_ROUTES[pageSlug];
  return resolver ? resolver(storeSlug) : `/${storeSlug}/about/${pageSlug}`;
}