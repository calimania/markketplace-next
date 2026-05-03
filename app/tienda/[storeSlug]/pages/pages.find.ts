import type { Page } from '@/markket/page.d';
import { findTiendaContent } from '../content.find';

export async function findPage(itemId: string, storeSlug: string, token: string) {
  return findTiendaContent<Page>(storeSlug, 'page', itemId, token);
}

export function contentBlocksToText(content: Page['Content']) {
  if (!Array.isArray(content)) return '';

  return content
    .flatMap((block: any) => {
      if (!Array.isArray(block?.children)) return [];
      return block.children
        .map((child: any) => (typeof child?.text === 'string' ? child.text : ''))
        .filter(Boolean);
    })
    .join('\n')
    .trim();
}
