import type { Event } from '@/markket/event';
import { findTiendaContent } from '../content.find';

export async function findEvent(itemId: string, storeSlug: string, token: string) {
  return findTiendaContent<Event>(storeSlug, 'event', itemId, token);
}
