import { strapiClient } from '@/markket/api.strapi';
import type { Page } from '@/markket/page.d';

type PageStatus = 'all' | 'draft' | 'published';

async function findPageByField(field: 'documentId' | 'slug', itemId: string, storeSlug?: string, status: PageStatus = 'all') {
  const filters: Record<string, any> = {
    [field]: {
      $eq: itemId,
    },
  };

  if (storeSlug) {
    filters.store = {
      slug: {
        $eq: storeSlug,
      },
    };
  }

  return strapiClient.fetch<Page>({
    contentType: 'pages',
    filters,
    status,
    populate: 'SEO.socialImage,store',
    paginate: { page: 1, pageSize: 1 },
  });
}

export async function findPage(itemId: string, storeSlug?: string) {
  const statusesToTry: PageStatus[] = ['all', 'draft', 'published'];

  for (const status of statusesToTry) {
    const byDocumentId = await findPageByField('documentId', itemId, storeSlug, status);
    if (byDocumentId?.data?.[0]) {
      return byDocumentId.data[0] as Page;
    }

    const bySlug = await findPageByField('slug', itemId, storeSlug, status);
    if (bySlug?.data?.[0]) {
      return bySlug.data[0] as Page;
    }
  }

  return undefined;
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
