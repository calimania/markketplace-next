'use client';

import { useEffect, useState } from 'react';
import { Badge, Center, Group, Loader, Paper, ScrollArea, Skeleton, Stack, Table, Text, TextInput } from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';

type CrmSubscriber = {
  documentId: string;
  email: string;
  active?: boolean;
  sync_status?: string;
  source?: string;
  createdAt?: string;
  unsubscribed_at?: string | null;
};

type SubscribersResponse = {
  data?: CrmSubscriber[];
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

const SYNC_COLORS: Record<string, string> = {
  synced: 'green',
  pending: 'yellow',
  failed: 'red',
};

export default function CrmSubscribersListClient({ storeRef }: { storeRef: string }) {
  const [rows, setRows] = useState<CrmSubscriber[]>([]);
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
        const url = `/api/crm/subscribers?storeRef=${encodeURIComponent(storeRef)}&page=1&pageSize=100`;
        const res = await fetch(url, {
          method: 'GET',
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        });
        const payload = (await res.json()) as SubscribersResponse;
        if (!res.ok) throw new Error((payload as any)?.error || `Request failed (${res.status})`);
        setRows(Array.isArray(payload?.data) ? payload.data : []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Could not load subscribers.');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [storeRef]);

  const filtered = search.trim()
    ? rows.filter(r => r.email?.toLowerCase().includes(search.toLowerCase()))
    : rows;

  const activeCount = rows.filter(r => r.active).length;

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
          <Text c="dimmed" size="sm" fw={600}>Sign in required</Text>
          <Text c="dimmed" size="xs" ta="center">Please sign in again to view subscribers.</Text>
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
          <Text fw={600} size="sm">Subscribers</Text>
          <Badge size="xs" variant="light" color="pink">{rows.length}</Badge>
          {activeCount > 0 && <Badge size="xs" variant="light" color="green">{activeCount} active</Badge>}
        </Group>
        <TextInput
          size="xs"
          placeholder="Search by email"
          leftSection={<IconSearch size={12} />}
          value={search}
          onChange={e => setSearch(e.currentTarget.value)}
          style={{ width: 220 }}
        />
      </Group>
      {filtered.length === 0 ? (
        <Paper withBorder radius="md" p="lg" bg="var(--mantine-color-gray-0)">
          <Stack gap={4} align="center">
            <Text c="dimmed" size="sm" fw={600}>{rows.length === 0 ? 'No subscribers yet' : 'No matches'}</Text>
            <Text c="dimmed" size="xs" ta="center">
              {rows.length === 0
                ? 'Subscribers from your forms and checkout will appear here.'
                : 'Try a different email search.'}
            </Text>
          </Stack>
        </Paper>
      ) : (
        <Paper withBorder radius="xl" style={{ overflow: 'hidden' }}>
          <ScrollArea>
            <Table verticalSpacing="sm" horizontalSpacing="md">
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Email</Table.Th>
                  <Table.Th>Status</Table.Th>
                  <Table.Th>Sync</Table.Th>
                  <Table.Th>Subscribed</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {filtered.map((sub, i) => (
                  <Table.Tr key={sub.documentId || i}>
                    <Table.Td>
                      <Text size="sm">{sub.email}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Badge size="sm" variant="light" color={sub.active ? 'green' : 'gray'}>
                        {sub.active ? 'Active' : sub.unsubscribed_at ? 'Unsubscribed' : 'Inactive'}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <Badge
                        size="sm"
                        variant="dot"
                        color={SYNC_COLORS[sub.sync_status?.toLowerCase() || ''] || 'gray'}
                      >
                        {sub.sync_status || 'unknown'}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <Text size="xs" c="dimmed">{toLocalDate(sub.createdAt)}</Text>
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
