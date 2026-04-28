import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Badge, Button, Group, Paper, SimpleGrid, Stack, Text, ThemeIcon } from '@mantine/core';
import { IconArrowLeft, IconCalendarEvent, IconMail, IconShoppingBag, IconUsers } from '@tabler/icons-react';
import TiendaListShell from '@/app/components/ui/tienda.list.shell';
import { findStoreForTienda } from '../store.find';
import CrmOrdersTableClient from './crm.orders.table.client';

type TiendaCrmPageProps = {
  params: Promise<{ storeSlug: string }>;
};

export const metadata: Metadata = {
  title: 'CRM',
};

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
    description: 'Unified list across orders, RSVPs, and subscribers.',
    icon: IconUsers,
    color: 'blue',
    active: true,
    ready: true,
  },
  {
    id: 'orders',
    label: 'Orders',
    description: 'Purchase history and buyer timeline.',
    icon: IconShoppingBag,
    color: 'violet',
    active: false,
    ready: false,
  },
  {
    id: 'subscribers',
    label: 'Subscribers',
    description: 'Newsletter status and sync lifecycle.',
    icon: IconMail,
    color: 'pink',
    active: false,
    ready: false,
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
      subtitle={`Customer, newsletter, order, and RSVP touchpoints for ${storeSlug}`}
      routePath={`/tienda/${storeSlug}/crm`}
      sectionTitle="CRM Index"
      actions={(
        <Button component="a" href={`/tienda/${storeSlug}`} variant="light" leftSection={<IconArrowLeft size={14} />}>
          Back To Overview
        </Button>
      )}
    >
      <Stack gap="md">
        <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="sm">
          {CRM_SECTIONS.map((section) => {
            const Icon = section.icon;
            return (
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
          })}
        </SimpleGrid>

        <CrmOrdersTableClient storeRef={storeRef} />
      </Stack>
    </TiendaListShell>
  );
}
