import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Stack, Text, Title, Group } from '@mantine/core';
import { IconUsers } from '@tabler/icons-react';
import TinyBreadcrumbs from '@/app/components/ui/tiny.breadcrumbs';
import { findStoreForTienda } from '../store.find';
import StoreTeamClient from './team.client';

type TiendaTeamPageProps = {
  params: Promise<{ storeSlug: string }>;
};

export async function generateMetadata({ params }: TiendaTeamPageProps): Promise<Metadata> {
  const { storeSlug } = await params;
  return { title: `Team · ${storeSlug}` };
}

export default async function TiendaTeamPage({ params }: TiendaTeamPageProps) {
  const { storeSlug } = await params;
  const store = await findStoreForTienda(storeSlug);

  if (!store) {
    notFound();
  }

  const storeRef = store.documentId || store.slug || storeSlug;

  return (
    <Stack gap="md">
      <TinyBreadcrumbs
        items={[
          { label: 'Me', href: '/me' },
          { label: 'Tienda', href: '/tienda' },
          { label: storeSlug, href: `/tienda/${storeSlug}` },
          { label: 'Team' },
        ]}
      />

      <Group justify="space-between" align="flex-start">
        <div>
          <Group gap="xs" align="center">
            <IconUsers size={22} />
            <Title order={1}>Team</Title>
          </Group>
          <Text c="dimmed" mt={2} size="sm">
            Invite people to this store and manage pending invites.
          </Text>
        </div>
      </Group>

      <StoreTeamClient
        storeRef={storeRef}
        storeSlug={store.slug || storeSlug}
        storeTitle={store.title || store.slug || storeSlug}
        storeLogoUrl={store.Logo?.url || store.Cover?.url}
      />
    </Stack>
  );
}
