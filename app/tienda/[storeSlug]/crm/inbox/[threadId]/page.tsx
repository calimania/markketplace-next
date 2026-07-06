import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Stack } from '@mantine/core';
import TiendaListShell from '@/app/components/ui/tienda.list.shell';
import { findStoreForTienda } from '../../../store.find';
import CrmInboxThreadClient from './thread.client';

type ThreadPageProps = {
  params: Promise<{ storeSlug: string; threadId: string }>;
};

export async function generateMetadata({ params }: ThreadPageProps): Promise<Metadata> {
  const { storeSlug } = await params;
  return { title: `Inbox Thread · CRM · ${storeSlug}` };
}

export default async function TiendaCrmInboxThreadPage({ params }: ThreadPageProps) {
  const { storeSlug, threadId } = await params;
  const store = await findStoreForTienda(storeSlug);

  if (!store) {
    notFound();
  }

  const storeRef = String(store.documentId || store.slug || storeSlug);

  return (
    <TiendaListShell
      breadcrumbs={[
        { label: 'Tienda', href: '/tienda' },
        { label: storeSlug, href: `/tienda/${storeSlug}` },
        { label: 'CRM', href: `/tienda/${storeSlug}/crm` },
        { label: 'Inbox thread' },
      ]}
      title="CRM Inbox"
      subtitle={`Thread details for ${store.title || storeSlug}`}
      routePath={`/tienda/${storeSlug}/crm/inbox/${threadId}`}
      sectionTitle="Conversation"
      tone="crm"
    >
      <Stack gap="md">
        <CrmInboxThreadClient
          storeRef={storeRef}
          storeSlug={storeSlug}
          threadId={decodeURIComponent(threadId)}
        />
      </Stack>
    </TiendaListShell>
  );
}
