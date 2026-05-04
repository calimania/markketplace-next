import type { Product } from '@/markket/product';
import { findTiendaContent } from '../content.find';

export async function findProduct(itemId: string, storeSlug: string, token: string) {
  return findTiendaContent<Product>(storeSlug, 'product', itemId, token);
}
