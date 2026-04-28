import { strapiClient } from '@/markket/api.strapi';
import type { Article } from '@/markket/article';

type ArticleStatus = 'all' | 'draft' | 'published';

async function findArticleByField(
  field: 'documentId' | 'slug',
  itemId: string,
  storeSlug: string,
  status: ArticleStatus = 'all',
) {
  return strapiClient.fetch<Article>({
    contentType: 'articles',
    filters: {
      [field]: { $eq: itemId },
      store: { slug: { $eq: storeSlug } },
    },
    status,
    populate: 'SEO.socialImage,Tags,cover,store',
    paginate: { page: 1, pageSize: 1 },
    includeAuth: true,
  });
}

export async function findBlogArticle(itemId: string, storeSlug: string) {
  const statusesToTry: ArticleStatus[] = ['published', 'draft', 'all'];

  for (const status of statusesToTry) {
    const byDocumentId = await findArticleByField('documentId', itemId, storeSlug, status);
    if (byDocumentId?.data?.[0]) return byDocumentId.data[0] as Article;

    const bySlug = await findArticleByField('slug', itemId, storeSlug, status);
    if (bySlug?.data?.[0]) return bySlug.data[0] as Article;
  }

  return undefined;
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
