'use client';

import { useEffect, useState } from 'react';
import { Badge, Center, Group, Loader, Paper, ScrollArea, Skeleton, Stack, Table, Text, TextInput } from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';

type CrmOrder = {
  documentId: string;
  status?: string;
  total?: number;
  currency?: string;
  email?: string;
  createdAt?: string;
  updatedAt?: string;
  stripe_session_id?: string;
};

type OrdersResponse = {
  data?: CrmOrder[];
  meta?: {
    page?: number;
    pageSize?: number;
    pageCount?: number;
    total?: number;
  };
};

function readAuthToken() {
  if (typeof window === 'undefined') return '';
  try {
    const raw = localStorage.getItem('markket.auth');
    const parsed = raw ? JSON.parse(raw) : null;
    return parsed?.jwt || '';
  } catch {
    return '';
  }
}

function toLocalDate(value?: string | null) {
  if (!value) return '-';
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? '-' : d.toLocaleDateString();
}

const STATUS_COLORS: Record<string, string> = {
  paid: 'green',
  fulfilled: 'teal',
  pending: 'yellow',
  cancelled: 'red',
  refunded: 'gray',
};

export default function CrmOrdersListClient({ storeRef }: { storeRef: string }) {
  const [rows, setRows] = useState<CrmOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [missingAuth, setMissingAuth] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const token = readAuthToken();
    if (!token) {
      setMissingAuth(true);
      setLoading(false);
      return;
    }

    const load = async () => {
      try {
        const url = `/api/crm/orders?storeRef=${encodeURIComponent(storeRef)}&page=1&pageSize=50`;
        const res = await fetch(url, {
          method: 'GET',
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        });
        const payload = (await res.json()) as OrdersResponse;
        if (!res.ok) throw new Error((payload as any)?.error || `Request failed (${res.status})`);
        setRows(Array.isArray(payload?.data) ? payload.data : []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Could not load orders.');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [storeRef]);

  const filtered = search.trim()
    ? rows.filter(r => r.email?.toLowerCase().includes(search.toLowerCase()) || r.documentId?.includes(search))
    : rows;

  if (loading) {
    return (
      <Paper withBorder radius="xl" p="md">
        <Stack gap="sm">
          <Center py={4}><Loader size="sm" /></Center>
          {[1, 2, 3].map(i => <Skeleton key={i} height={44} radius="md" />)}
        </Stack>
      </Paper>
    );
  }

  if (missingAuth) {
    return (
      <Paper withBorder radius="xl" p="md">
        <Stack gap={4} align="center">
          <Text c="dimmed" size="sm" fw={600}>You need to be signed in</Text>
          <Text c="dimmed" size="xs" ta="center">Sign in again to see your order history.</Text>
        </Stack>
      </Paper>
    );
  }

  if (error) {
    return (
      <Paper withBorder radius="xl" p="md">
        <Text c="red" size="sm">{error}</Text>
      </Paper>
    );
  }

  return (
    <Stack gap="sm">
      <Group justify="space-between" wrap="nowrap">
        <Group gap={6} align="center">
          <Text fw={600} size="sm">Orders</Text>
          <Badge size="xs" variant="light" color="violet">{rows.length}</Badge>
        </Group>
        <TextInput
          size="xs"
          placeholder="Search by email or order ID"
          leftSection={<IconSearch size={12} />}
          value={search}
          onChange={e => setSearch(e.currentTarget.value)}
          style={{ width: 220 }}
        />
      </Group>
      {filtered.length === 0 ? (
        <Paper withBorder radius="md" p="lg" bg="var(--mantine-color-gray-0)">
          <Stack gap={4} align="center">
            <Text c="dimmed" size="sm" fw={600}>{rows.length === 0 ? 'No orders yet' : 'No matches'}</Text>
            <Text c="dimmed" size="xs" ta="center">
              {rows.length === 0
                ? 'Your first paid order will appear here automatically.'
                : 'Try a different email or order ID.'}
            </Text>
          </Stack>
        </Paper>
      ) : (
        <Paper withBorder radius="xl" style={{ overflow: 'hidden' }}>
          <ScrollArea>
            <Table verticalSpacing="sm" horizontalSpacing="md">
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Status</Table.Th>
                  <Table.Th>Customer</Table.Th>
                  <Table.Th>Total</Table.Th>
                  <Table.Th>Date</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {filtered.map((order, i) => (
                  <Table.Tr key={order.documentId || i}>
                    <Table.Td>
                      <Badge
                        size="sm"
                        variant="light"
                        color={STATUS_COLORS[order.status?.toLowerCase() || ''] || 'gray'}
                      >
                        {order.status || 'unknown'}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm">{order.email || '-'}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm" fw={600}>
                        {order.total != null
                          ? `${(order.total / 100).toFixed(2)} ${(order.currency || 'USD').toUpperCase()}`
                          : '-'}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Text size="xs" c="dimmed">{toLocalDate(order.createdAt)}</Text>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </ScrollArea>
        </Paper>
      )}
    </Stack>
  );
}
