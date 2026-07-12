import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default function MeStoreNewPage() {
  redirect('/tienda/new');
}
