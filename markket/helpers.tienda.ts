'use client';

/**
 * Centralized helpers for Tienda client operations
 * Reduces duplication across list clients, editors, and components
 */

/**
 * Read JWT token from localStorage
 * Safe for client-side use only
 */
export function readTiendaAuthToken(): string {
  if (typeof window === 'undefined') return '';

  try {
    const raw = localStorage.getItem('markket.auth');
    const parsed = raw ? JSON.parse(raw) : null;
    return parsed?.jwt || '';
  } catch {
    return '';
  }
}

/**
 * Parse Tienda API response to extract data array
 * Handles multiple response formats for robustness
 */
export function parseTiendaResponse<T>(response: unknown): T[] | null {
  if (!response || typeof response !== 'object') return null;

  const payload = response as { status?: number; data?: unknown; ok?: boolean } | null;

  // Check for error status
  if (payload?.status && payload.status >= 400) return null;

  // Check for ok: false
  if (payload?.ok === false) return null;

  // Extract data array
  if (Array.isArray(payload?.data)) return payload.data as T[];
  if (Array.isArray(response)) return response as T[];

  return null;
}

/**
 * Extract status from response for error handling
 */
export function getTiendaResponseStatus(response: unknown): number | null {
  if (!response || typeof response !== 'object') return null;
  const payload = response as { status?: number } | null;
  return payload?.status || null;
}

/**
 * Generate stable key for list items
 * Handles multiple identifier formats
 */
export function getTiendaItemKey(item: { documentId?: string | number; id?: string | number; slug?: string }): string {
  return String(item.documentId || item.id || item.slug || Math.random());
}

/**
 * Slugify free text into tienda-compatible slugs.
 */
export function slugifyTiendaValue(value: string): string {
  return String(value || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

/**
 * Validate normalized slug format.
 */
export function isValidTiendaSlug(value: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);
}

/**
 * Optional URL validator used by editor forms.
 */
export function isValidOptionalHttpUrl(value: string): boolean {
  const trimmed = String(value || '').trim();
  if (!trimmed) return true;
  return /^https?:\/\//.test(trimmed);
}

