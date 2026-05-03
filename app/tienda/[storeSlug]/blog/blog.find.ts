import type { Article } from '@/markket/article';
import { findTiendaContent } from '../content.find';

export async function findBlogArticle(itemId: string, storeSlug: string, token: string) {
  return findTiendaContent<Article>(storeSlug, 'article', itemId, token);
}

export function contentBlocksToText(content: Article['Content']) {
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
