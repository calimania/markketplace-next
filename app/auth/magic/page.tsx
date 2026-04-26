import { Suspense } from 'react';
import { strapiClient } from '@/markket/api.strapi';
import { markketplace } from '@/markket/config';
import MagicLinkPage from '@/app/components/auth/magic.page';
import MagicCodeHandler from '@/app/components/auth/magic.code';

export default async function MagicPageWrapper({
  searchParams,
}: {
  searchParams: Promise<{ code?: string }>;
}) {
  const { code } = await searchParams;

  const [{ data: pages }, { data: stores }] = await Promise.all([
    strapiClient.getPage('auth.magic', markketplace.slug),
    strapiClient.getStore(markketplace.slug),
  ]);

  const page = pages?.[0];
  const store = stores?.[0];

  if (code) {
    return (
      <Suspense fallback={<div />}>
        <MagicCodeHandler code={code} />
      </Suspense>
    );
  }

  return <MagicLinkPage page={page} store={store} />;
}
