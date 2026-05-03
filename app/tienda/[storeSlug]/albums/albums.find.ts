import type { Album } from '@/markket/album';
import { findTiendaContent } from '../content.find';

export async function findAlbum(itemId: string, storeSlug: string, token: string) {
  return findTiendaContent<Album>(storeSlug, 'album', itemId, token);
}
