import { strapiClient } from '@/markket/api.strapi';
import type { Product } from '@/markket/product';

type ProductStatus = 'all' | 'draft' | 'published';

async function findProductByField(field: 'documentId' | 'slug', itemId: string, storeSlug: string, status: ProductStatus = 'all') {
  const filters: Record<string, any> = {
    [field]: {
      $eq: itemId,
    },
    stores: {
      slug: {
        $eq: storeSlug,
      },
    },
  };

  return strapiClient.fetch<Product>({
    contentType: 'products',
    filters,
    status,
    populate: 'SEO.socialImage,Thumbnail,Slides,PRICES,stores,extras',
    paginate: { page: 1, pageSize: 1 },
    includeAuth: true,
  });
}

export async function findProduct(itemId: string, storeSlug: string) {
  const statusesToTry: ProductStatus[] = ['published', 'draft', 'all'];

  for (const status of statusesToTry) {
    const byDocumentId = await findProductByField('documentId', itemId, storeSlug, status);
    if (byDocumentId?.data?.[0]) {
      return byDocumentId.data[0] as Product;
    }

    const bySlug = await findProductByField('slug', itemId, storeSlug, status);
    if (bySlug?.data?.[0]) {
      return bySlug.data[0] as Product;
    }
  }

  return undefined;
}
