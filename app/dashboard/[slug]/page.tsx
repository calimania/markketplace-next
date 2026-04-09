import { redirect } from 'next/navigation';

// Old /dashboard/[slug] routes — replaced by /tienda/[storeSlug] and /me
// See: app/tienda/[storeSlug]/ and app/me/
//
// Slug mapping reference (for migration tracking):
//   settings  → /me/account
//   store     → /tienda
//   stores    → /tienda
//   products  → /tienda  (pick store first, then /tienda/[slug]/products)
//   articles  → /tienda
//   pages     → /tienda
//   albums    → /tienda
//   tracks    → /tienda
//   events    → /tienda
//   crm       → /tienda
//   stripe    → /tienda
//   onboarding → /me

type AnyDashboardPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function DashboardPage({ params }: AnyDashboardPageProps) {
  const { slug } = await params;

  if (slug === 'settings') {
    redirect('/me/account');
  }

  if (slug === 'onboarding') {
    redirect('/me');
  }

  redirect('/tienda');
}
