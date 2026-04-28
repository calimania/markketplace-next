'use client';

import { useEffect, useState } from 'react';
import {
  Stack, Text, Badge, Table, Group, Paper,
  Loader, Center, ThemeIcon, Button,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconUsers, IconMailForward } from '@tabler/icons-react';
import { tiendaClient } from '@/markket/api.tienda';
import type { RSVP } from '@/markket/event.d';

type EventRsvpsTabProps = {
  storeRef: string;
  eventDocumentId: string;
  eventNumericId?: number;
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

function isRsvpSynced(rsvp: RSVP) {
  if (rsvp.sync_status) {
    return rsvp.sync_status === 'synced';
  }

  return Boolean(rsvp.last_synced_at);
}

function hasRsvpSyncMetadata(rsvp: RSVP) {
  return Boolean(
    rsvp.sync_status
    || rsvp.last_synced_at
    || rsvp.sendgrid_contact_id
    || rsvp.sendgrid_list_id,
  );
}

function normalizeRsvpItem(raw: any): RSVP {
  const attrs = raw?.attributes || raw;
  return {
    ...attrs,
    id: raw?.id ?? attrs?.id,
    documentId: raw?.documentId ?? attrs?.documentId,
    event: attrs?.event?.data?.attributes
      ? {
          ...attrs.event.data.attributes,
          id: attrs.event.data.id,
          documentId: attrs.event.data.documentId,
        }
      : attrs?.event,
    store: attrs?.store?.data?.attributes
      ? {
          ...attrs.store.data.attributes,
          id: attrs.store.data.id,
          documentId: attrs.store.data.documentId,
        }
      : attrs?.store,
  } as RSVP;
}

export default function EventRsvpsTab({ storeRef, eventDocumentId, eventNumericId }: EventRsvpsTabProps) {
  const [rsvps, setRsvps] = useState<RSVP[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [missingAuth, setMissingAuth] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [resolvedEventId, setResolvedEventId] = useState<string>('');

  const loadRsvps = async (token: string) => {
    setError('');
    const candidateIds = [eventDocumentId, eventNumericId ? String(eventNumericId) : ''].filter(Boolean);
    let lastError = '';

    for (const eventId of candidateIds) {
      const res: any = await tiendaClient.getEventRsvps(storeRef, eventId, { token });
      const status = Number(res?.status || 0);

      if (status >= 400) {
        lastError = res?.error?.message || res?.error || res?.message || `Request failed (${status})`;
        continue;
      }

      const rawItems = Array.isArray(res?.data)
        ? res.data
        : Array.isArray(res?.rsvps)
        ? res.rsvps
        : Array.isArray(res?.items)
        ? res.items
        : Array.isArray(res)
        ? res
        : [];

      const items: RSVP[] = rawItems.map(normalizeRsvpItem);

      setResolvedEventId(eventId);
      setRsvps(items);
      return;
    }

    throw new Error(lastError || 'Could not load RSVPs.');
  };

  useEffect(() => {
    setLoading(true);
    setMissingAuth(false);
    const token = readAuthToken();
    if (!token) {
      setMissingAuth(true);
      setLoading(false);
      return;
    }

    loadRsvps(token)
      .catch((err) => {
        console.error('[event.rsvps.tab] fetch error', err);
        setError(err instanceof Error ? err.message : 'Could not load RSVPs.');
      })
      .finally(() => setLoading(false));
  }, [eventDocumentId, eventNumericId, storeRef]);

  const syncAwareCount = rsvps.filter((r) => hasRsvpSyncMetadata(r)).length;
  const unsyncedCount = rsvps.filter((r) => hasRsvpSyncMetadata(r) && !isRsvpSynced(r)).length;
  const canSync = syncAwareCount > 0 && unsyncedCount > 0;

  const handleSync = async () => {
    const token = readAuthToken();
    if (!token) return;
    if (!canSync) {
      notifications.show({ title: 'Already up to date', message: 'All RSVPs are already synced.', color: 'gray', autoClose: 2200 });
      return;
    }

    setSyncing(true);

    try {
      const syncEventId = resolvedEventId || eventDocumentId || (eventNumericId ? String(eventNumericId) : '');
      const syncResponse: any = await tiendaClient.syncEventRsvps(storeRef, syncEventId, { token });
      const status = Number(syncResponse?.status || 0);

      if (status >= 400) {
        const message = syncResponse?.error?.message || syncResponse?.error || syncResponse?.message || `Sync failed (${status})`;
        throw new Error(String(message));
      }

      await loadRsvps(token);
      notifications.show({ title: 'Synced', message: 'RSVPs synced to SendGrid.', color: 'green', autoClose: 3000 });
    } catch (err) {
      notifications.show({
        title: 'Sync failed',
        message: err instanceof Error ? err.message : 'Could not sync to SendGrid.',
        color: 'red',
      });
    } finally {
      setSyncing(false);
    }
  };

  if (loading) {
    return (
      <Center py="xl">
        <Loader size="sm" />
      </Center>
    );
  }

  if (error) {
    return (
      <Paper withBorder p="xl" radius="md" bg="var(--mantine-color-red-0)">
        <Text size="sm" c="red" ta="center">{error}</Text>
      </Paper>
    );
  }

  if (missingAuth) {
    return (
      <Paper withBorder p="xl" radius="md" bg="var(--mantine-color-yellow-0)">
        <Text size="sm" c="yellow.9" ta="center">Missing auth token. Log in again to load RSVPs.</Text>
      </Paper>
    );
  }

  if (rsvps.length === 0) {
    return (
      <Paper withBorder p="xl" radius="md" bg="var(--mantine-color-gray-0)">
        <Stack align="center" gap="sm">
          <ThemeIcon size={48} radius="xl" variant="light" color="gray">
            <IconUsers size={24} />
          </ThemeIcon>
          <Text fw={600} c="dimmed">No RSVPs yet</Text>
          <Text size="sm" c="dimmed" ta="center">
            When attendees RSVP for this event, they&apos;ll appear here.
          </Text>
        </Stack>
      </Paper>
    );
  }

  const rows = rsvps.map((r) => (
    <Table.Tr key={r.id || r.documentId}>
      <Table.Td>{r.name}</Table.Td>
      <Table.Td>
        <Text size="sm" c="dimmed">{r.email}</Text>
      </Table.Td>
      <Table.Td>
        <Text size="xs" c="dimmed">
          {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : '—'}
        </Text>
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <Stack gap="md">
      <Group justify="space-between" align="center">
        <Group gap="xs">
          <ThemeIcon size={32} radius="xl" variant="light" color="green">
            <IconUsers size={16} />
          </ThemeIcon>
          <Text fw={600}>
            {rsvps.length} RSVP{rsvps.length !== 1 ? 's' : ''}
          </Text>
          <Badge variant="light" color="green">{rsvps.length}</Badge>
          {canSync && <Badge variant="light" color="orange">{unsyncedCount} unsynced</Badge>}
        </Group>
        {canSync && (
          <Button
            size="xs"
            variant="light"
            color="cyan"
            leftSection={<IconMailForward size={14} />}
            loading={syncing}
            onClick={handleSync}
          >
            Sync to SendGrid
          </Button>
        )}
      </Group>

      <Paper withBorder radius="md" style={{ overflow: 'hidden' }}>
        <Table striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Name</Table.Th>
              <Table.Th>Email</Table.Th>
              <Table.Th>Date</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>{rows}</Table.Tbody>
        </Table>
      </Paper>
    </Stack>
  );
}
