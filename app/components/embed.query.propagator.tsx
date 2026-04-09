'use client';

import { useEffect } from 'react';
import { appendEmbedParamsToHref, getCurrentEmbedParams } from '@/app/utils/embed.query';

export default function EmbedQueryPropagator() {
  useEffect(() => {
    const handler = (event: MouseEvent) => {
      if (event.defaultPrevented) return;
      if (event.button !== 0) return;

      const target = event.target as HTMLElement | null;
      const anchor = target?.closest('a[href]') as HTMLAnchorElement | null;
      if (!anchor) return;

      const href = anchor.getAttribute('href');
      if (!href) return;

      const embedParams = getCurrentEmbedParams();
      if (embedParams.toString().length === 0) return;

      const nextHref = appendEmbedParamsToHref(href, embedParams);
      if (nextHref !== href) {
        anchor.setAttribute('href', nextHref);
      }
    };

    document.addEventListener('click', handler, true);
    return () => {
      document.removeEventListener('click', handler, true);
    };
  }, []);

  return null;
}
