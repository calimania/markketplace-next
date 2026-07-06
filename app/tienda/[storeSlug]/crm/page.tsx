import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Stack } from '@mantine/core';
import TiendaListShell from '@/app/components/ui/tienda.list.shell';
import { findStoreForTienda } from '../store.find';
import CrmWorkspaceClient from './crm.workspace.client';

type TiendaCrmPageProps = {
  params: Promise<{ storeSlug: string }>;
};

export async function generateMetadata({ params }: TiendaCrmPageProps): Promise<Metadata> {
  const { storeSlug } = await params;
  return { title: `CRM · ${storeSlug}` };
}

export default async function TiendaCrmPage({ params }: TiendaCrmPageProps) {
  const { storeSlug } = await params;
  const store = await findStoreForTienda(storeSlug);

  if (!store) {
    notFound();
  }

  const storeRef = store.documentId || store.slug || storeSlug;

  return (
    <TiendaListShell
      breadcrumbs={[
        { label: 'Tienda', href: '/tienda' },
        { label: storeSlug, href: `/tienda/${storeSlug}` },
        { label: 'CRM' },
      ]}
      title="CRM"
      subtitle={`Customers, subscribers, and orders for ${store.title || storeSlug}`}
      routePath={`/tienda/${storeSlug}/crm`}
      sectionTitle="Overview"
      tone="crm"
    >
      <Stack gap="md">
        <CrmWorkspaceClient storeRef={storeRef} storeSlug={storeSlug} />
      </Stack>
    </TiendaListShell>
  );
}
