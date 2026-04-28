import { strapiClient } from '@/markket/api.strapi';
import type { Album } from '@/markket/album';

type AlbumStatus = 'all' | 'draft' | 'published';

async function findAlbumByField(
  field: 'documentId' | 'slug',
  itemId: string,
  storeSlug: string,
  status: AlbumStatus = 'all',
) {
  return strapiClient.fetch<Album>({
    contentType: 'albums',
    filters: {
      [field]: { $eq: itemId },
      store: { slug: { $eq: storeSlug } },
    },
    status,
    populate: 'SEO.socialImage,cover,tracks',
    paginate: { page: 1, pageSize: 1 },
    includeAuth: true,
  });
}

export async function findAlbum(itemId: string, storeSlug: string) {
  const statusesToTry: AlbumStatus[] = ['published', 'draft', 'all'];

  for (const status of statusesToTry) {
    const byDocumentId = await findAlbumByField('documentId', itemId, storeSlug, status);
    if (byDocumentId?.data?.[0]) return byDocumentId.data[0] as Album;

    const bySlug = await findAlbumByField('slug', itemId, storeSlug, status);
    if (bySlug?.data?.[0]) return bySlug.data[0] as Album;
  }

  return undefined;
}
