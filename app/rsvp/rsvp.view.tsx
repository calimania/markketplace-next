'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Container, Paper, Stack, Title, Text, Badge,
  ThemeIcon, Loader, Center, Anchor, Group, Divider,
  CopyButton, ActionIcon, Tooltip,
} from '@mantine/core';
import { IconCalendarEvent, IconCircleCheck, IconUser, IconLink, IconCheck } from '@tabler/icons-react';
import type { RSVP } from '@/markket/event.d';

function censorEmail(email: string): string {
  const [local, domain] = email.split('@');
  if (!domain) return '***';
  const visible = local.slice(0, Math.min(2, local.length));
  return `${visible}***@${domain}`;
}

function formatDate(value?: string) {
  if (!value) return null;
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d.toLocaleDateString(undefined, {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });
}

type RSVPWithEvent = RSVP & {
  event?: {
    Name?: string;
    slug?: string;
    documentId?: string;
    startDate?: string;
    endDate?: string;
    timezone?: string;
    SEO?: { metaDescription?: string };
    Thumbnail?: { url?: string };
  };
  store?: {
    slug?: string;
    title?: string;
  };
};

export default function RSVPConfirmationView() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const [rsvp, setRsvp] = useState<RSVPWithEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) { setLoading(false); return; }

    fetch(`/api/markket/rsvp/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error('RSVP not found');
        return res.json();
      })
      .then((data) => setRsvp(data?.data ?? data))
      .catch(() => setError("We couldn\u2019t find this RSVP. The link may have expired."))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <Center py={80}>
        <Loader />
      </Center>
    );
  }

  if (error || !rsvp) {
    return (
      <Container size="xs" py={64}>
        <Paper withBorder p="xl" radius="lg" ta="center">
          <ThemeIcon size={56} radius="xl" variant="light" color="gray" mb="md">
            <IconCalendarEvent size={28} />
          </ThemeIcon>
          <Title order={3} mb="xs">RSVP not found</Title>
          <Text c="dimmed" size="sm">
            {error || 'No RSVP ID provided. Check the link in your confirmation email.'}
          </Text>
        </Paper>
      </Container>
    );
  }

  const storeSlug = rsvp.store?.slug;
  const eventLink = storeSlug && rsvp.event?.slug
    ? `/${storeSlug}/events/${rsvp.event.slug}`
    : null;

  return (
    <Container size="xs" py={64}>
      <Paper withBorder p="xl" radius="lg">
        <Stack gap="lg">
          <Stack gap="xs" align="center">
            <ThemeIcon size={64} radius="xl" variant="light" color="green">
              <IconCircleCheck size={36} />
            </ThemeIcon>
            <Title order={2} ta="center">You're confirmed!</Title>
            <Text c="dimmed" size="sm" ta="center">
              Here are your RSVP details.
            </Text>
          </Stack>

          <Divider />

          <Stack gap="sm">
            <Group gap="xs">
              <ThemeIcon size={28} radius="xl" variant="light" color="pink">
                <IconUser size={14} />
              </ThemeIcon>
              <Stack gap={0}>
                <Text fw={600} size="sm">{rsvp.name}</Text>
                <Text size="xs" c="dimmed">{censorEmail(rsvp.email)}</Text>
              </Stack>
            </Group>
          </Stack>

          {rsvp.event?.Name && (
            <>
              <Divider label="Event" labelPosition="left" />
              <Stack gap="xs">
                <Group justify="space-between" align="flex-start">
                  <Stack gap={2}>
                    {eventLink ? (
                      <Anchor href={eventLink} fw={600} size="md">
                        {rsvp.event.Name}
                      </Anchor>
                    ) : (
                      <Text fw={600}>{rsvp.event.Name}</Text>
                    )}
                    {rsvp.store?.title && (
                      <Text size="sm" c="dimmed">by {rsvp.store.title}</Text>
                    )}
                  </Stack>
                  <Badge variant="light" color="green" size="sm">Confirmed</Badge>
                </Group>

                {rsvp.event.startDate && (
                  <Text size="sm" c="dimmed">
                    {formatDate(rsvp.event.startDate)}
                    {rsvp.event.endDate && rsvp.event.endDate !== rsvp.event.startDate && (
                      <> — {formatDate(rsvp.event.endDate)}</>
                    )}
                  </Text>
                )}

                {rsvp.event.SEO?.metaDescription && (
                  <Text size="sm" c="dimmed">{rsvp.event.SEO.metaDescription}</Text>
                )}

                {eventLink && (
                  <Group gap="xs" mt={4}>
                    <Anchor
                      href={eventLink}
                      size="xs"
                      c="pink"
                      style={{ wordBreak: 'break-all' }}
                    >
                      {typeof window !== 'undefined'
                        ? `${window.location.origin}${eventLink}`
                        : eventLink}
                    </Anchor>
                    <CopyButton
                      value={typeof window !== 'undefined'
                        ? `${window.location.origin}${eventLink}`
                        : eventLink}
                      timeout={2000}
                    >
                      {({ copied, copy }) => (
                        <Tooltip label={copied ? 'Copied!' : 'Copy event link'} withArrow>
                          <ActionIcon
                            size="xs"
                            variant="subtle"
                            color={copied ? 'green' : 'gray'}
                            onClick={copy}
                          >
                            {copied ? <IconCheck size={12} /> : <IconLink size={12} />}
                          </ActionIcon>
                        </Tooltip>
                      )}
                    </CopyButton>
                  </Group>
                )}
              </Stack>
            </>
          )}

          <Divider />

          <Text size="xs" c="dimmed" ta="center">
            RSVP confirmed on {formatDate(rsvp.createdAt) || '—'}
          </Text>
        </Stack>
      </Paper>
    </Container>
  );
}
