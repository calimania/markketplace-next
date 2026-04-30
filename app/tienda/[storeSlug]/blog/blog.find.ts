import { strapiClient } from '@/markket/api.strapi';
import type { Article } from '@/markket/article';
import { cache } from 'react';

export const findBlogArticle = cache(async (itemId: string, storeSlug: string) => {
  const [byDocumentId, bySlug] = await Promise.all([
    strapiClient.fetch<Article>({
      contentType: 'articles',
      filters: { documentId: { $eq: itemId }, store: { slug: { $eq: storeSlug } } },
      status: 'all',
      populate: 'SEO.socialImage,Tags,cover,store',
      paginate: { page: 1, pageSize: 1 },
      includeAuth: true,
    }),
    strapiClient.fetch<Article>({
      contentType: 'articles',
      filters: { slug: { $eq: itemId }, store: { slug: { $eq: storeSlug } } },
      status: 'all',
      populate: 'SEO.socialImage,Tags,cover,store',
      paginate: { page: 1, pageSize: 1 },
      includeAuth: true,
    }),
  ]);

  return (byDocumentId?.data?.[0] || bySlug?.data?.[0]) as Article | undefined;
});

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
