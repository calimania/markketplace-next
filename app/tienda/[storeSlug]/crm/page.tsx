import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Badge, Group, Paper, SimpleGrid, Stack, Text, ThemeIcon } from '@mantine/core';
import { IconCalendarEvent, IconMail, IconShoppingBag, IconUsers } from '@tabler/icons-react';
import TiendaListShell from '@/app/components/ui/tienda.list.shell';
import { findStoreForTienda } from '../store.find';
import CrmOrdersTableClient from './crm.orders.table.client';
import CrmOrdersListClient from './crm.orders.list.client';
import CrmSubscribersListClient from './crm.subscribers.list.client';

type TiendaCrmPageProps = {
  params: Promise<{ storeSlug: string }>;
};

export async function generateMetadata({ params }: TiendaCrmPageProps): Promise<Metadata> {
  const { storeSlug } = await params;
  return { title: `CRM · ${storeSlug}` };
}

type CrmSection = {
  id: string;
  label: string;
  description: string;
  icon: React.ElementType;
  color: string;
  active: boolean;
  ready: boolean;
};

const CRM_SECTIONS: CrmSection[] = [
  {
    id: 'customers',
    label: 'Customers',
    description: 'One shared view of each customer across activity.',
    icon: IconUsers,
    color: 'blue',
    active: true,
    ready: true,
  },
  {
    id: 'orders',
    label: 'Orders',
    description: 'Recent purchases and order status.',
    icon: IconShoppingBag,
    color: 'violet',
    active: true,
    ready: true,
  },
  {
    id: 'subscribers',
    label: 'Subscribers',
    description: 'Newsletter members and sync status.',
    icon: IconMail,
    color: 'pink',
    active: true,
    ready: true,
  },
  {
    id: 'rsvps',
    label: 'Event RSVPs',
    description: 'Attendance intent and follow-up opportunities.',
    icon: IconCalendarEvent,
    color: 'teal',
    active: false,
    ready: false,
  },
];

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
        <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="sm">
          {CRM_SECTIONS.map((section) => {
            const Icon = section.icon;
            const card = (
              <Paper
                key={section.id}
                withBorder
                radius="md"
                p="sm"
                style={{
                  cursor: section.ready ? 'pointer' : 'default',
                  opacity: section.active ? 1 : 0.45,
                  borderWidth: section.active ? 2 : 1,
                  borderColor: section.active ? 'var(--mantine-color-blue-4)' : undefined,
                  background: section.active ? 'var(--mantine-color-blue-0)' : undefined,
                  transition: 'opacity 0.15s',
                }}
              >
                <Stack gap={6} align="flex-start">
                  <Group gap="xs" wrap="nowrap">
                    <ThemeIcon
                      variant={section.active ? 'filled' : 'light'}
                      color={section.color}
                      radius="xl"
                      size="sm"
                    >
                      <Icon size={12} />
                    </ThemeIcon>
                    <Text fw={section.active ? 700 : 500} size="sm" c={section.active ? 'blue' : undefined}>
                      {section.label}
                    </Text>
                  </Group>
                  <Text size="xs" c="dimmed" lineClamp={2}>{section.description}</Text>
                  <Badge
                    variant="light"
                    color={section.active ? 'blue' : 'gray'}
                    size="xs"
                  >
                    {section.active ? 'Active' : 'Coming soon'}
                  </Badge>
                </Stack>
              </Paper>
            );

            if (section.ready) {
              return (
                <a key={section.id} href={`#crm-${section.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  {card}
                </a>
              );
            }

            return (
              <div key={section.id}>{card}</div>
            );
          })}
        </SimpleGrid>

        <div id="crm-customers">
          <CrmOrdersTableClient storeRef={storeRef} />
        </div>
        <div id="crm-orders">
          <CrmOrdersListClient storeRef={storeRef} />
        </div>
        <div id="crm-subscribers">
          <CrmSubscribersListClient storeRef={storeRef} />
        </div>
      </Stack>
    </TiendaListShell>
  );
}
