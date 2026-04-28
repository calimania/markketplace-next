'use client';

import { useEffect, useMemo, useState } from 'react';
import { Badge, Center, Loader, Paper, ScrollArea, Stack, Table, Text } from '@mantine/core';
import type { CrmCustomer } from '@/markket/crm';

type CrmOrdersTableClientProps = {
  storeRef: string;
};

type CrmCustomersResponse = {
  data?: CrmCustomer[];
  meta?: {
    page?: number;
    pageSize?: number;
    pageCount?: number;
    total?: number;
  };
};

type CrmCustomerRow = {
  key: string;
  name: string;
  email: string;
  ordersCount: number;
  totalSpent: number;
  lastOrderAt: string;
  rsvpsCount: number;
  lastRsvpAt: string;
  subscriber: string;
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

function toLocalDate(value: string | null | undefined) {
  if (!value) return '-';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '-' : date.toLocaleString();
}

function normalizeCustomerItem(raw: CrmCustomer, index: number): CrmCustomerRow {
  const subscriber = raw.subscriber
    ? `${raw.subscriber.active ? 'active' : 'inactive'} · ${raw.subscriber.sync_status}`
    : 'none';

  return {
    key: `${raw.email}-${index}`,
    name: raw.name || '-',
    email: raw.email,
    ordersCount: Number(raw.ordersCount || 0),
    totalSpent: Number(raw.totalSpent || 0),
    lastOrderAt: toLocalDate(raw.lastOrderAt),
    rsvpsCount: Number(raw.rsvpsCount || 0),
    lastRsvpAt: toLocalDate(raw.lastRsvpAt),
    subscriber,
  };
}

export default function CrmOrdersTableClient({ storeRef }: CrmOrdersTableClientProps) {
  const [rows, setRows] = useState<CrmCustomerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [missingAuth, setMissingAuth] = useState(false);
  const [error, setError] = useState('');
  const [endpointHit, setEndpointHit] = useState('');
  const [pageInfo, setPageInfo] = useState<{ page: number; pageSize: number; total: number } | null>(null);

  useEffect(() => {
    const token = readAuthToken();
    if (!token) {
      setMissingAuth(true);
      setLoading(false);
      return;
    }

    const load = async () => {
      try {
        const endpointPath = `/api/crm/customers?storeRef=${encodeURIComponent(storeRef)}&page=1&pageSize=25`;
        setEndpointHit(endpointPath);

        const response = await fetch(endpointPath, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        const payload = (await response.json()) as CrmCustomersResponse;

        if (!response.ok) {
          throw new Error((payload as any)?.error || `Request failed (${response.status})`);
        }

        const data = Array.isArray(payload?.data) ? payload.data : [];

        setPageInfo({
          page: Number(payload?.meta?.page || 1),
          pageSize: Number(payload?.meta?.pageSize || 25),
          total: Number(payload?.meta?.total || data.length),
        });

        const normalized = data.map((item, index) => normalizeCustomerItem(item, index));
        setRows(normalized);
      } catch (requestError) {
        setError(requestError instanceof Error ? requestError.message : 'Could not load CRM customers.');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [storeRef]);

  const subscriberCounts = useMemo(() => {
    return rows.reduce<Record<string, number>>((acc, row) => {
      const key = row.subscriber.toLowerCase();
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
  }, [rows]);

  if (loading) {
    return (
      <Paper withBorder radius="md" p="md">
        <Center py="md">
          <Loader size="sm" />
        </Center>
      </Paper>
    );
  }

  if (missingAuth) {
    return (
      <Paper withBorder radius="md" p="md" bg="var(--mantine-color-yellow-0)">
        <Text size="sm" c="yellow.9">Missing auth token. Sign in again to load CRM endpoint data.</Text>
      </Paper>
    );
  }

  if (error) {
    return (
      <Paper withBorder radius="md" p="md" bg="var(--mantine-color-red-0)">
        <Stack gap={4}>
          <Text fw={600} size="sm" c="red">CRM endpoint request failed</Text>
          <Text size="xs" c="red.8">{error}</Text>
        </Stack>
      </Paper>
    );
  }

  return (
    <Paper withBorder radius="md" p="md">
      <Stack gap="sm">
        <Stack gap={2}>
          <Text fw={600} size="sm">Customers Endpoint Preview</Text>
          <Text size="xs" c="dimmed">
            Endpoint: {endpointHit || `/api/crm/customers?storeRef=${storeRef}&page=1&pageSize=25`} (GET)
          </Text>
          <Text size="xs" c="dimmed">
            Showing unified customer records returned by CRM API.
          </Text>
        </Stack>

        <Stack gap={6}>
          <Badge variant="light" color="blue">{rows.length} result{rows.length === 1 ? '' : 's'}</Badge>
          {pageInfo && (
            <Text size="xs" c="dimmed">
              Page {pageInfo.page} · Size {pageInfo.pageSize} · Total {pageInfo.total}
            </Text>
          )}
          {Object.entries(subscriberCounts).length > 0 && (
            <Text size="xs" c="dimmed">
              Subscriber mix: {Object.entries(subscriberCounts).map(([status, count]) => `${status} (${count})`).join(', ')}
            </Text>
          )}
        </Stack>

        {rows.length === 0 ? (
          <Text size="sm" c="dimmed">No customers returned from the endpoint yet.</Text>
        ) : (
          <ScrollArea>
            <Table striped highlightOnHover withTableBorder>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Name</Table.Th>
                  <Table.Th>Email</Table.Th>
                  <Table.Th>Orders</Table.Th>
                  <Table.Th>Total Spent</Table.Th>
                  <Table.Th>Last Order</Table.Th>
                  <Table.Th>RSVPs</Table.Th>
                  <Table.Th>Last RSVP</Table.Th>
                  <Table.Th>Subscriber</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {rows.map((row) => (
                  <Table.Tr key={row.key}>
                    <Table.Td>{row.name}</Table.Td>
                    <Table.Td>{row.email}</Table.Td>
                    <Table.Td>{row.ordersCount}</Table.Td>
                    <Table.Td>{row.totalSpent.toFixed(2)}</Table.Td>
                    <Table.Td>{row.lastOrderAt}</Table.Td>
                    <Table.Td>{row.rsvpsCount}</Table.Td>
                    <Table.Td>{row.lastRsvpAt}</Table.Td>
                    <Table.Td>{row.subscriber}</Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </ScrollArea>
        )}
      </Stack>
    </Paper>
  );
}
