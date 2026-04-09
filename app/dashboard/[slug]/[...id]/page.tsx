import { redirect } from 'next/navigation';

// Old /dashboard/[slug]/[action]/[id] item routes — replaced by /tienda/[storeSlug]/[contentType]/[itemId]
// See: app/tienda/[storeSlug]/[contentType]/[itemId]/page.tsx
// and: app/tienda/[storeSlug]/[contentType]/new/page.tsx

export default async function ItemPage() {
  redirect('/tienda');
}
