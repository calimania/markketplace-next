'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ActionIcon, Badge, Center, Group, Loader, Paper, ScrollArea, Skeleton, Stack, Table, Text, TextInput, Tooltip } from '@mantine/core';
import { IconExternalLink, IconSearch } from '@tabler/icons-react';

type InboxMessage = {
  id?: number;
  documentId?: string;
  threadKey?: string;
  subject?: string;
  fromName?: string;
  senderName?: string;
  displayName?: string;
  estado?: string;
  publicationState?: string;
  publication?: string;
  latestMessageAt?: string;
  Name?: string;
  Message?: string;
  message?: string;
  text?: string;
  body?: string;
  email?: string;
  from?: string;
  Archived?: boolean;
  createdAt?: string;
  updatedAt?: string;
  raw?: unknown;
  rawData?: unknown;
};

type InboxResponse = {
  data?: InboxMessage[];
  items?: InboxMessage[];
  threads?: InboxMessage[];
  error?: unknown;
  message?: unknown;
  meta?: {
    pagination?: {
      page?: number;
      pageSize?: number;
      pageCount?: number;
      total?: number;
    };
  };
};

function normalizeErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  if (error && typeof error === 'object') {
    const maybeMessage = (error as { message?: unknown }).message;
    if (typeof maybeMessage === 'string' && maybeMessage.trim()) return maybeMessage;
    const maybeError = (error as { error?: unknown }).error;
    if (typeof maybeError === 'string' && maybeError.trim()) return maybeError;
  }
  return 'Could not load inbox messages.';
}

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

function compact(value?: string | null, max = 120) {
  if (!value) return '-';
  const clean = value.replace(/\s+/g, ' ').trim();
  if (!clean) return '-';
  return clean.length > max ? `${clean.slice(0, max - 1)}...` : clean;
}

function normalizeSpaces(value: string) {
  return value.replace(/\s+/g, ' ').trim();
}

function parseDisplayAndEmail(input?: string | null) {
  const source = normalizeSpaces(input || '');
  if (!source) return { display: '', email: '' };

  const bracketMatch = source.match(/^(.*?)<([^>]+)>$/);
  if (bracketMatch) {
    const display = normalizeSpaces(bracketMatch[1] || '').replace(/^"|"$/g, '');
    const email = normalizeSpaces(bracketMatch[2] || '').toLowerCase();
    return { display, email };
  }

  if (source.includes('@')) {
    return { display: '', email: source.toLowerCase() };
  }

  return { display: source, email: '' };
}

function extractRawCandidates(value: unknown): string[] {
  if (!value || typeof value !== 'object') return [];
  const obj = value as Record<string, unknown>;
  const candidates = [
    obj.from,
    obj.email,
    obj.sender,
    obj.senderEmail,
    obj.senderName,
    obj.displayName,
    obj.replyTo,
    obj.reply_to,
  ];

  return candidates
    .filter((item): item is string => typeof item === 'string')
    .map((item) => normalizeSpaces(item))
    .filter(Boolean);
}

function resolveThreadId(row: InboxMessage): string {
  const candidate = row.documentId || (row.id != null ? String(row.id) : '');
  return toShortThreadId(candidate || '');
}

function toShortThreadId(value: string): string {
  const source = String(value || '').trim();
  if (!source) return '';

  const segments = source.split('/').filter(Boolean);
  return (segments[segments.length - 1] || source).trim();
}

function resolveSubject(row: InboxMessage): string {
  return (
    row.subject
    || row.Name
    || row.fromName
    || row.senderName
    || row.displayName
    || ''
  ).trim() || 'No subject';
}

function resolveEmail(row: InboxMessage): string {
  const direct = [
    row.email,
    row.from,
    ...extractRawCandidates(row.raw),
    ...extractRawCandidates(row.rawData),
  ];

  for (const candidate of direct) {
    if (!candidate || typeof candidate !== 'string') continue;
    const parsed = parseDisplayAndEmail(candidate);
    if (parsed.email) return parsed.email;
  }

  return 'No email provided';
}

function resolveMessagePreview(row: InboxMessage): string {
  const body = (
    row.Message
    || row.message
    || row.text
    || row.body
    || ''
  ).trim();

  if (!body) return 'No message preview available';
  return compact(body);
}

function resolveStatusLabel(row: InboxMessage): string {
  if (row.Archived) return 'Archived';
  const normalized = (row.estado || '').toLowerCase().trim();
  if (!normalized) return 'New';
  if (normalized === 'open' || normalized === 'unread' || normalized === 'new') return 'New';
  if (normalized === 'read') return 'Read';
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
}

function resolvePublicationStateLabel(row: InboxMessage): string {
  const publication = (row.publicationState || row.publication || '').toLowerCase().trim();
  if (!publication) return 'Published';
  if (publication === 'published') return 'Published';
  if (publication === 'draft') return 'Draft';
  return publication.charAt(0).toUpperCase() + publication.slice(1);
}

export default function CrmInboxListClient({
  storeRef,
  storeSlug,
}: {
  storeRef: string;
  storeSlug: string;
}) {
  const [rows, setRows] = useState<InboxMessage[]>([]);
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
        const params = new URLSearchParams();
        params.set('storeId', storeRef);
        params.set('store', storeSlug);
        params.set('includeMessages', 'false');
        params.set('page', '1');
        params.set('pageSize', '100');
        params.set('sortBy', 'latestMessageAt');
        params.set('sortOrder', 'desc');

        const res = await fetch(`/api/crm/inbox?${params.toString()}`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        const payload = (await res.json()) as InboxResponse;

        if (!res.ok) {
          throw new Error(
            (typeof payload?.error === 'string' && payload.error)
            || (typeof payload?.message === 'string' && payload.message)
            || `Request failed (${res.status})`
          );
        }

        const list = Array.isArray(payload?.data)
          ? payload.data
          : Array.isArray(payload?.items)
            ? payload.items
            : Array.isArray(payload?.threads)
              ? payload.threads
              : [];

        setRows(list);
      } catch (err) {
        setError(normalizeErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [storeRef, storeSlug]);

  const q = search.trim().toLowerCase();
  const filtered = q
    ? rows.filter((row) => {
        const haystack = `${resolveSubject(row)} ${resolveEmail(row)} ${resolveMessagePreview(row)}`.toLowerCase();
        return haystack.includes(q);
      })
    : rows;

  if (loading) {
    return (
      <Paper withBorder radius="xl" p="md">
        <Stack gap="sm">
          <Center py={4}><Loader size="sm" /></Center>
          {[1, 2, 3].map((i) => <Skeleton key={i} height={44} radius="md" />)}
        </Stack>
      </Paper>
    );
  }

  if (missingAuth) {
    return (
      <Paper withBorder radius="xl" p="md">
        <Stack gap={4} align="center">
          <Text c="dimmed" size="sm" fw={600}>Sign in required</Text>
          <Text c="dimmed" size="xs" ta="center">Please sign in again to view inbox messages.</Text>
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
          <Text fw={600} size="sm">Inbox</Text>
          <Badge size="xs" variant="light" color="orange">{rows.length}</Badge>
        </Group>
        <TextInput
          size="xs"
          placeholder="Search name, email, or message"
          leftSection={<IconSearch size={12} />}
          value={search}
          onChange={(e) => setSearch(e.currentTarget.value)}
          style={{ width: 250 }}
        />
      </Group>

      {filtered.length === 0 ? (
        <Paper withBorder radius="md" p="lg" bg="var(--mantine-color-gray-0)">
          <Stack gap={4} align="center">
            <Text c="dimmed" size="sm" fw={600}>{rows.length === 0 ? 'No inbox messages yet' : 'No matches'}</Text>
            <Text c="dimmed" size="xs" ta="center">
              {rows.length === 0
                ? 'Messages sent from forms or inbox actions will appear here.'
                : 'Try a different search term.'}
            </Text>
          </Stack>
        </Paper>
      ) : (
        <Paper withBorder radius="xl" style={{ overflow: 'hidden' }}>
          <ScrollArea>
            <Table verticalSpacing="sm" horizontalSpacing="md">
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Thread</Table.Th>
                  <Table.Th>Email</Table.Th>
                  <Table.Th>Message</Table.Th>
                  <Table.Th>Status</Table.Th>
                  <Table.Th>Date</Table.Th>
                  <Table.Th></Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {filtered.map((row, i) => (
                  <Table.Tr key={row.documentId || row.id || i}>
                    <Table.Td>
                      <Text size="sm" fw={600}>{resolveSubject(row)}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm">{resolveEmail(row)}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm" c="dimmed">{resolveMessagePreview(row)}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Group gap={6} wrap="wrap">
                        <Badge size="sm" variant="light" color={row.Archived ? 'gray' : 'orange'}>
                          {resolveStatusLabel(row)}
                        </Badge>
                        <Badge
                          size="sm"
                          variant="light"
                          color={resolvePublicationStateLabel(row) === 'Draft' ? 'violet' : 'teal'}
                        >
                          {resolvePublicationStateLabel(row)}
                        </Badge>
                      </Group>
                    </Table.Td>
                    <Table.Td>
                      <Text size="xs" c="dimmed">{toLocalDate(row.latestMessageAt || row.createdAt || row.updatedAt)}</Text>
                    </Table.Td>
                    <Table.Td>
                      {resolveThreadId(row) ? (
                        <Tooltip label="View thread" withArrow>
                          <ActionIcon
                            component={Link}
                            href={`/tienda/${storeSlug}/crm/inbox/${encodeURIComponent(resolveThreadId(row))}`}
                            variant="light"
                            color="orange"
                            size="sm"
                            aria-label="View thread"
                          >
                            <IconExternalLink size={14} />
                          </ActionIcon>
                        </Tooltip>
                      ) : (
                        <Text size="xs" c="dimmed">-</Text>
                      )}
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
