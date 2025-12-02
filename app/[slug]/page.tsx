import { notFound } from 'next/navigation';

/**
 * Catch-all page for dynamic routes
 * This is now only used as a fallback when no specific route matches
 * /stores and /docs have their own dedicated pages
 * Store pages are handled by the rewrite to /store/:slug
 */
export default async function AnyPage() {
  // All dynamic slugs should be handled by rewrites or specific routes
  // If we reach here, it's a 404
  return notFound();
}
