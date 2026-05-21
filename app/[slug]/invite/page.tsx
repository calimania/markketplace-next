import type { Metadata } from 'next';
import { Suspense } from 'react';
import InviteAcceptHandler from '@/app/components/auth/invite.accept';
import { strapiClient } from '@/markket/api.strapi';

type StoreInvitePageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ code?: string }>;
};

export const metadata: Metadata = {
  title: 'Store Invite',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function StoreInvitePage({ params, searchParams }: StoreInvitePageProps) {
  const { slug } = await params;
  const { code } = await searchParams;
  let storeName = slug;

  try {
    const response = await strapiClient.getStore(slug);
    storeName = response?.data?.[0]?.title || response?.data?.[0]?.slug || slug;
  } catch {
    storeName = slug;
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
          storeName,
          storeSlug: slug,
        }}
      />
    </Suspense>
  );
}
