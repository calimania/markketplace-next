import { strapiClient } from '@/markket/api.strapi';
import type { Event } from '@/markket/event';

type EventStatus = 'all' | 'draft' | 'published';

async function findEventByField(field: 'documentId' | 'slug', itemId: string, storeSlug: string, status: EventStatus = 'all') {
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

  return strapiClient.fetch<Event>({
    contentType: 'events',
    filters,
    status,
    populate: 'SEO,SEO.socialImage,Tag,Thumbnail,Slides,stores',
    paginate: { page: 1, pageSize: 1 },
  });
}

export async function findEvent(itemId: string, storeSlug: string) {
  const statusesToTry: EventStatus[] = ['all', 'draft', 'published'];

  for (const status of statusesToTry) {
    const byDocumentId = await findEventByField('documentId', itemId, storeSlug, status);
    if (byDocumentId?.data?.[0]) {
      return byDocumentId.data[0] as Event;
    }

    const bySlug = await findEventByField('slug', itemId, storeSlug, status);
    if (bySlug?.data?.[0]) {
      return bySlug.data[0] as Event;
    }
  }

  return undefined;
}
