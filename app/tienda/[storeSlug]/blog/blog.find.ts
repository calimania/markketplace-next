import { strapiClient } from '@/markket/api.strapi';
import type { Article } from '@/markket/article';

export async function findBlogArticle(itemId: string, storeSlug: string) {
  const byDocumentId = await strapiClient.fetch<Article>({
    contentType: 'articles',
    filters: {
      documentId: itemId,
      store: {
        slug: {
          $eq: storeSlug,
        },
      },
    },
    populate: 'SEO.socialImage,Tags,cover,store',
    paginate: { page: 1, pageSize: 1 },
  });

  if (byDocumentId?.data?.[0]) {
    return byDocumentId.data[0] as Article;
  }

  const bySlug = await strapiClient.getPost(itemId, storeSlug);
  return bySlug?.data?.[0] as Article | undefined;
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
