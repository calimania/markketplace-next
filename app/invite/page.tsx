import { Suspense } from 'react';
import type { Metadata } from 'next';
import InviteAcceptHandler from '@/app/components/auth/invite.accept';
import { strapiClient } from '@/markket/api.strapi';

export const metadata: Metadata = {
  title: 'Accept Invite',
  robots: {
    index: false,
    follow: false,
  },
};

type InviteSearchParams = {
  code?: string;
  storeSlug?: string;
};

export default async function InvitePage({
  searchParams,
}: {
  searchParams: Promise<InviteSearchParams>;
}) {
  const { code, storeSlug } = await searchParams;

  let resolvedStoreName: string | undefined;

  if (!resolvedStoreName && storeSlug) {
    try {
      const response = await strapiClient.getStore(storeSlug);
      resolvedStoreName = response?.data?.[0]?.title || response?.data?.[0]?.slug || storeSlug;
    } catch {
      resolvedStoreName = storeSlug;
    }
  }

  if (!code) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 24px' }}>
        <p>No invite code found. Please check the link in your email.</p>
      </div>
    );
  }

  return (
    <Suspense fallback={<div />}>
      <InviteAcceptHandler
        code={code}
        inviteContext={{
          storeName: resolvedStoreName,
          storeSlug,
        }}
      />
    </Suspense>
  );
}
