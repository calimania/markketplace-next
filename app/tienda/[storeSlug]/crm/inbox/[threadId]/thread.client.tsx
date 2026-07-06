'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { Badge, Button, Group, Loader, Paper, Stack, Text, Textarea } from '@mantine/core';
import { IconArrowLeft, IconSend } from '@tabler/icons-react';

type InboxMessage = {
  id?: number;
  documentId?: string;
  threadKey?: string;
  subject?: string;
  Name?: string;
  fromName?: string;
  senderName?: string;
  displayName?: string;
  Message?: string;
  message?: string;
  text?: string;
  body?: string;
  email?: string;
  from?: string;
  to?: string;
  raw?: unknown;
  rawData?: unknown;
  direction?: string;
  estado?: string;
  publicationState?: string;
  Archived?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

type InboxThread = InboxMessage & {
  messages?: InboxMessage[];
  Messages?: InboxMessage[];
};

type InboxResponse = {
  data?: InboxThread[];
  item?: InboxThread;
  thread?: InboxThread;
  items?: InboxThread[];
  threads?: InboxThread[];
  messages?: InboxMessage[];
  error?: unknown;
  message?: unknown;
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

function pickBody(item: InboxMessage): string {
  return (
    item.message
    || item.Message
    || item.text
    || item.body
    || ''
  ).trim();
}

function toLocalDateTime(value?: string | null) {
  if (!value) return '-';
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? '-' : d.toLocaleString();
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

function toTitleCaseWords(input: string) {
  return input
    .split(/[\s._-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ')
    .trim();
}

function displayNameFromEmail(email: string) {
  const local = (email.split('@')[0] || '').trim();
  if (!local) return '';
  return toTitleCaseWords(local);
}

function extractRawFromFields(value: unknown): string[] {
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

function resolveSenderDisplay(message: InboxMessage, outgoing: boolean) {
  if (outgoing) return 'You';

  const directCandidates = [
    message.fromName,
    message.senderName,
    message.displayName,
    message.from,
    message.email,
    message.Name,
    ...extractRawFromFields(message.raw),
    ...extractRawFromFields(message.rawData),
  ];

  let bestDisplay = '';
  let bestEmail = '';

  for (const candidate of directCandidates) {
    if (!candidate || typeof candidate !== 'string') continue;
    const parsed = parseDisplayAndEmail(candidate);

    if (!bestDisplay && parsed.display) bestDisplay = parsed.display;
    if (!bestEmail && parsed.email) bestEmail = parsed.email;

    if (bestDisplay && bestEmail) break;
  }

  if (bestDisplay && bestEmail) return `${bestDisplay} <${bestEmail}>`;
  if (bestDisplay) return bestDisplay;
  if (bestEmail) {
    const derived = displayNameFromEmail(bestEmail);
    return derived ? `${derived} <${bestEmail}>` : bestEmail;
  }

  // Last-resort fallback that avoids unknown/missing sender copy.
  return 'Customer';
}

function normalizeError(error: unknown) {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  if (error && typeof error === 'object') {
    const message = (error as { message?: unknown }).message;
    if (typeof message === 'string' && message.trim()) return message;
    const plain = (error as { error?: unknown }).error;
    if (typeof plain === 'string' && plain.trim()) return plain;
  }
  return 'Could not load thread.';
}

function matchesThreadId(value: InboxMessage | InboxThread, threadId: string) {
  const normalized = normalizeThreadIdForCompare(threadId);
  const candidates = [
    value.threadKey,
    value.documentId,
    value.id != null ? String(value.id) : undefined,
  ].filter(Boolean).map((item) => normalizeThreadIdForCompare(String(item)));

  return candidates.includes(normalized);
}

function toShortThreadId(value?: string | null) {
  const source = String(value || '').trim();
  if (!source) return '';
  const segments = source.split('/').filter(Boolean);
  return (segments[segments.length - 1] || source).trim();
}

function normalizeThreadIdForCompare(value?: string | null) {
  return toShortThreadId(value).toLowerCase();
}

function splitQuotedReply(body: string): { visibleBody: string; quotedBody: string } {
  const normalized = body.replace(/\r\n/g, '\n');

  const markerPatterns = [
    /^On\s.+\swrote:\s*$/m,
    /^From:\s.+$/m,
    /^-----Original Message-----$/m,
  ];

  let quoteStart = -1;

  for (const pattern of markerPatterns) {
    const match = pattern.exec(normalized);
    if (match && (quoteStart === -1 || match.index < quoteStart)) {
      quoteStart = match.index;
    }
  }

  if (quoteStart !== -1) {
    const visibleBody = normalized.slice(0, quoteStart).trim();
    const quotedBody = normalized.slice(quoteStart).trim();
    return { visibleBody, quotedBody };
  }

  const lines = normalized.split('\n');
  const firstQuotedLine = lines.findIndex((line) => /^>+\s?/.test(line.trim()));
  if (firstQuotedLine >= 0) {
    const leading = lines.slice(0, firstQuotedLine).join('\n').trim();
    const quoted = lines.slice(firstQuotedLine).join('\n').trim();
    return { visibleBody: leading, quotedBody: quoted };
  }

  return { visibleBody: normalized.trim(), quotedBody: '' };
}

export default function CrmInboxThreadClient({
  storeRef,
  storeSlug,
  threadId,
}: {
  storeRef: string;
  storeSlug: string;
  threadId: string;
}) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [thread, setThread] = useState<InboxThread | null>(null);
  const [didMarkRead, setDidMarkRead] = useState(false);
  const [showQuotedById, setShowQuotedById] = useState<Record<string, boolean>>({});
  const [replyText, setReplyText] = useState('');
  const [sendingReply, setSendingReply] = useState(false);
  const [replyError, setReplyError] = useState('');
  const [replyNotice, setReplyNotice] = useState('');

  useEffect(() => {
    const token = readAuthToken();

    if (!token) {
      setError('Sign in required to view this thread.');
      setLoading(false);
      return;
    }

    const load = async () => {
      try {
        const threadIdentifier = toShortThreadId(threadId);
        if (!threadIdentifier) {
          throw new Error('Missing thread ID.');
        }

        const response = await fetch(`/api/crm/inbox/thread/${encodeURIComponent(threadIdentifier)}`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        const payload = (await response.json()) as InboxResponse;

        if (!response.ok) {
          throw new Error(
            (typeof payload?.error === 'string' && payload.error)
            || (typeof payload?.message === 'string' && payload.message)
            || `Request failed (${response.status})`
          );
        }

        const found = (
          (Array.isArray(payload?.data) ? payload.data[0] : payload?.data)
          || payload?.item
          || payload?.thread
          || (Array.isArray(payload?.items) ? payload.items[0] : null)
          || (Array.isArray(payload?.threads) ? payload.threads[0] : null)
          || null
        ) as InboxThread | null;

        setThread(found);
      } catch (requestError) {
        setError(normalizeError(requestError));
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [storeRef, storeSlug, threadId]);

  const threadMessages = useMemo(() => {
    if (!thread) return [] as InboxMessage[];

    const direct = Array.isArray(thread.messages)
      ? thread.messages
      : Array.isArray(thread.Messages)
        ? thread.Messages
        : [];

    if (direct.length > 0) {
      return [...direct].sort((a, b) => +new Date(a.createdAt || a.updatedAt || 0) - +new Date(b.createdAt || b.updatedAt || 0));
    }

    const fallbackBody = pickBody(thread);
    if (fallbackBody) {
      return [thread];
    }

    return [] as InboxMessage[];
  }, [thread]);

  const title = (thread?.subject || thread?.Name || '').trim() || 'Inbox thread';
  const headerDirection = ((thread?.direction || '').toLowerCase() === 'outgoing' || (thread?.direction || '').toLowerCase() === 'sent');
  const headerSender = thread ? resolveSenderDisplay(thread, headerDirection) : 'Customer';
  const headerStatusRaw = (thread?.estado || '').toLowerCase().trim();
  const headerStatus = thread?.Archived
    ? 'Archived'
    : (!headerStatusRaw || headerStatusRaw === 'open' || headerStatusRaw === 'new' || headerStatusRaw === 'unread')
      ? 'New'
      : headerStatusRaw.charAt(0).toUpperCase() + headerStatusRaw.slice(1);
  const publicationStateRaw = (thread?.publicationState || '').toLowerCase().trim();
  const publicationState = publicationStateRaw === 'draft'
    ? 'Draft'
    : publicationStateRaw === 'published' || !publicationStateRaw
      ? 'Published'
      : publicationStateRaw.charAt(0).toUpperCase() + publicationStateRaw.slice(1);
  const threadIdentifier = toShortThreadId(threadId);

  useEffect(() => {
    if (!thread || didMarkRead) return;

    const token = readAuthToken();
    if (!token) return;

    const estado = (thread.estado || '').toLowerCase().trim();
    const shouldMarkRead = !thread.Archived && (!estado || estado === 'open' || estado === 'new' || estado === 'unread');
    if (!shouldMarkRead) return;

    if (!threadIdentifier) return;

    const markRead = async () => {
      try {
        await fetch(`/api/crm/inbox/thread/${encodeURIComponent(threadIdentifier)}/state`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            store: storeSlug,
            storeId: storeRef,
            action: 'read',
          }),
        });

        setThread((current) => {
          if (!current) return current;
          return {
            ...current,
            estado: 'read',
          };
        });
      } catch (markError) {
        console.warn('[crm/thread] mark read failed:', markError);
      } finally {
        setDidMarkRead(true);
      }
    };

    void markRead();
  }, [thread, didMarkRead, storeRef, storeSlug, threadIdentifier]);

  const handleSendReply = async () => {
    const token = readAuthToken();
    if (!token) {
      setReplyError('Sign in required to send replies.');
      return;
    }

    const text = replyText.trim();
    if (!text) {
      setReplyError('Reply message cannot be empty.');
      return;
    }

    if (!threadIdentifier) {
      setReplyError('Missing thread ID for reply.');
      return;
    }

    setSendingReply(true);
    setReplyError('');
    setReplyNotice('');

    try {
      const response = await fetch(`/api/crm/inbox/thread/${encodeURIComponent(threadIdentifier)}/outbound`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
        }),
      });

      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        const message = typeof payload?.error === 'string'
          ? payload.error
          : typeof payload?.message === 'string'
            ? payload.message
            : `Reply failed (${response.status})`;
        throw new Error(message);
      }

      setReplyText('');
      setReplyNotice('Reply sent.');
      setThread((current) => {
        if (!current) return current;

        const nowIso = new Date().toISOString();
        const optimisticOutgoing: InboxMessage = {
          message: text,
          text,
          direction: 'outgoing',
          createdAt: nowIso,
          updatedAt: nowIso,
          to: 'customer',
        };

        const currentMessages = Array.isArray(current.messages)
          ? current.messages
          : Array.isArray(current.Messages)
            ? current.Messages
            : [];

        return {
          ...current,
          estado: 'read',
          updatedAt: nowIso,
          messages: [...currentMessages, optimisticOutgoing],
        };
      });
    } catch (sendError) {
      setReplyError(normalizeError(sendError));
    } finally {
      setSendingReply(false);
    }
  };

  if (loading) {
    return (
      <Paper withBorder radius="md" p="md">
        <Group justify="center" py="lg">
          <Loader size="sm" />
        </Group>
      </Paper>
    );
  }

  if (error) {
    return (
      <Paper withBorder radius="md" p="md">
        <Stack gap="xs">
          <Text c="red" size="sm">{error}</Text>
          <Button component={Link} href={`/tienda/${storeSlug}/crm#crm-inbox`} variant="light" size="xs" leftSection={<IconArrowLeft size={14} />}>
            Back to inbox
          </Button>
        </Stack>
      </Paper>
    );
  }

  if (!thread) {
    return (
      <Paper withBorder radius="md" p="md">
        <Stack gap="xs">
          <Text size="sm" c="dimmed">Thread not found.</Text>
          <Button component={Link} href={`/tienda/${storeSlug}/crm#crm-inbox`} variant="light" size="xs" leftSection={<IconArrowLeft size={14} />}>
            Back to inbox
          </Button>
        </Stack>
      </Paper>
    );
  }

  return (
    <Stack gap="sm">
      <Group justify="space-between" align="center" wrap="wrap">
        <Stack gap={2}>
          <Text fw={700}>{title}</Text>
          <Text size="xs" c="dimmed">{headerSender}</Text>
        </Stack>
        <Group gap="xs">
          <Badge size="xs" variant="light" color={thread.Archived ? 'gray' : 'orange'}>
            {headerStatus}
          </Badge>
          <Badge size="xs" variant="light" color={publicationState === 'Draft' ? 'violet' : 'teal'}>
            {publicationState}
          </Badge>
          <Button component={Link} href={`/tienda/${storeSlug}/crm#crm-inbox`} variant="light" size="xs" leftSection={<IconArrowLeft size={14} />}>
            Inbox
          </Button>
        </Group>
      </Group>

      {threadMessages.length > 0 ? (
        <Stack gap="xs">
          {threadMessages.map((message, index) => {
            const direction = (message.direction || '').toLowerCase();
            const outgoing = direction === 'outgoing' || direction === 'sent';
            const body = pickBody(message) || '(No message body)';
            const sender = resolveSenderDisplay(message, outgoing);
            const messageKey = String(message.documentId || message.id || index);
            const { visibleBody, quotedBody } = splitQuotedReply(body);
            const hasQuoted = Boolean(quotedBody);
            const showQuoted = Boolean(showQuotedById[messageKey]);
            const displayBody = visibleBody || '(No message body)';

            return (
              <Paper
                key={messageKey}
                withBorder
                radius="md"
                p="sm"
                style={{
                  marginLeft: outgoing ? '12%' : 0,
                  marginRight: outgoing ? 0 : '12%',
                  background: outgoing ? 'var(--mantine-color-orange-0)' : 'var(--mantine-color-gray-0)',
                }}
              >
                <Stack gap={4}>
                  <Group justify="space-between" align="center" wrap="wrap">
                    <Text size="xs" fw={700}>{sender}</Text>
                    <Text size="xs" c="dimmed">{toLocalDateTime(message.createdAt || message.updatedAt)}</Text>
                  </Group>
                  <Text size="sm" style={{ whiteSpace: 'pre-wrap' }}>{displayBody}</Text>
                  {hasQuoted ? (
                    <Stack gap={6}>
                      <Button
                        size="compact-xs"
                        variant="subtle"
                        color="gray"
                        style={{ alignSelf: 'flex-start' }}
                        onClick={() => {
                          setShowQuotedById((current) => ({
                            ...current,
                            [messageKey]: !current[messageKey],
                          }));
                        }}
                      >
                        {showQuoted ? 'Hide quoted text' : 'Show quoted text'}
                      </Button>
                      {showQuoted ? (
                        <Paper withBorder radius="sm" p="xs" bg="var(--mantine-color-gray-0)">
                          <Text size="xs" c="dimmed" style={{ whiteSpace: 'pre-wrap' }}>
                            {quotedBody}
                          </Text>
                        </Paper>
                      ) : null}
                    </Stack>
                  ) : null}
                </Stack>
              </Paper>
            );
          })}
        </Stack>
      ) : (
        <Paper withBorder radius="md" p="md" bg="var(--mantine-color-gray-0)">
          <Text size="sm" c="dimmed">No messages found in this thread yet.</Text>
        </Paper>
      )}

      <Paper withBorder radius="md" p="md">
        <Stack gap="xs">
          <Text size="sm" fw={600}>Reply</Text>
          <Textarea
            minRows={4}
            placeholder="Type your reply..."
            value={replyText}
            onChange={(event) => setReplyText(event.currentTarget.value)}
            disabled={sendingReply}
          />
          {replyError ? <Text size="xs" c="red">{replyError}</Text> : null}
          {replyNotice ? <Text size="xs" c="teal">{replyNotice}</Text> : null}
          <Group justify="flex-end">
            <Button
              leftSection={<IconSend size={14} />}
              loading={sendingReply}
              onClick={handleSendReply}
              disabled={!replyText.trim()}
            >
              Send
            </Button>
          </Group>
        </Stack>
      </Paper>
    </Stack>
  );
}
