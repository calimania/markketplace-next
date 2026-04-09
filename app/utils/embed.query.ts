export const EMBED_QUERY_KEYS = ['display', 'navbar', 'footer', 'breadcrumbs', 'crumbs'] as const;

export function getCurrentEmbedParams(): URLSearchParams {
  if (typeof window === 'undefined') return new URLSearchParams();

  const params = new URLSearchParams(window.location.search);
  const embedParams = new URLSearchParams();

  EMBED_QUERY_KEYS.forEach((key) => {
    const value = params.get(key);
    if (value) {
      embedParams.set(key, value);
    }
  });

  return embedParams;
}

export function appendEmbedParamsToHref(href: string, embedParams = getCurrentEmbedParams()): string {
  if (typeof window === 'undefined') return href;
  if (!href || embedParams.toString().length === 0) return href;

  if (
    href.startsWith('#') ||
    href.startsWith('mailto:') ||
    href.startsWith('tel:') ||
    href.startsWith('javascript:')
  ) {
    return href;
  }

  const url = new URL(href, window.location.origin);

  if (url.origin !== window.location.origin) {
    return href;
  }

  embedParams.forEach((value, key) => {
    if (!url.searchParams.has(key)) {
      url.searchParams.set(key, value);
    }
  });

  return `${url.pathname}${url.search}${url.hash}`;
}
