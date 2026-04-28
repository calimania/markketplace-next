'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Stack,
  Title,
  Text,
  Button,
  Group,
  ThemeIcon,
  Loader,
  Alert,
  Badge,
  Avatar,
  Divider,
  Box,
} from '@mantine/core';
import { IconMailCheck, IconMailOff, IconAlertCircle, IconCircleCheck } from '@tabler/icons-react';
import type { Store } from '@/markket/store.d';

type SubscriptionInfo = {
  email: string;
  active: boolean;
  storeName: string;
  status?: string;
  unsubscribedAt?: string | null;
};

type State = 'loading' | 'ready' | 'cancelling' | 'cancelled' | 'error';

export default function SubscriptionClient({ store }: { store: Store }) {
  const params = useSearchParams();
  const code = params.get('code');

  const [info, setInfo] = useState<SubscriptionInfo | null>(null);
  const [state, setState] = useState<State>('loading');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!code) {
      setState('error');
      setErrorMsg('No subscription code found in the URL.');
      return;
    }

    fetch(`/api/cliente/subscription/${code}`)
      .then(async (res) => {
        if (!res.ok) throw new Error((await res.json())?.error || 'Not found');
        return res.json();
      })
      .then((data) => {
        const sub = data?.data ?? data;
        setInfo({
          email: sub.email,
          active: sub.active,
          storeName: sub.store?.Name || sub.store?.slug || store.title || store.slug,
          status: sub.status,
          unsubscribedAt: sub.unsubscribed_at ?? null,
        });
        setState(sub.active ? 'ready' : 'cancelled');
      })
      .catch((err) => {
        setErrorMsg(err.message || 'Could not load subscription.');
        setState('error');
      });
  }, [code, store.title, store.slug]);

  const handleCancel = async () => {
    if (!code) return;
    setState('cancelling');

    try {
      const res = await fetch(`/api/cliente/subscription/${code}`, { method: 'DELETE' });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error || 'Unsubscribe failed.');
      }

      setState('cancelled');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Something went wrong.');
      setState('error');
    }
  };

  const logoUrl = store.Logo?.url || store.SEO?.socialImage?.url;
  const coverUrl = store.Cover?.url;
  const unsubscribedOn = info?.unsubscribedAt
    ? new Date(info.unsubscribedAt).toLocaleString()
    : null;

  return (
    <Stack gap={0}>
      {coverUrl && (
        <Box
          style={{
            height: 160,
            backgroundImage: `url(${coverUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            borderRadius: '12px 12px 0 0',
          }}
        />
      )}

      <Stack gap="lg" p="xl" pt={coverUrl ? 'lg' : 'xl'}>
        <Group gap="md">
          {logoUrl ? (
            <Avatar src={logoUrl} size={52} radius="md" />
          ) : (
            <ThemeIcon variant="light" color="pink" radius="md" size={52}>
              <IconMailCheck size={24} />
            </ThemeIcon>
          )}
          <div>
            <Title order={3} fw={700}>{store.title || store.slug}</Title>
            <Text size="sm" c="dimmed">{store.SEO?.metaDescription || 'You are in control of your inbox preferences.'}</Text>
          </div>
        </Group>

        <Divider />

        {state === 'loading' && (
          <Stack align="center" gap="md" py="md">
            <Loader size="sm" />
            <Text c="dimmed" size="sm">Loading your subscription…</Text>
          </Stack>
        )}

        {state === 'error' && (
          <Alert icon={<IconAlertCircle size={16} />} color="red" title="Something went wrong" radius="md">
            {errorMsg}
          </Alert>
        )}

        {(state === 'ready' || state === 'cancelling') && info && (
          <Stack gap="md">
            <Group justify="space-between" align="center">
              <Stack gap={2}>
                <Text size="xs" c="dimmed" tt="uppercase" fw={600} style={{ letterSpacing: '0.05em' }}>Currently subscribed as</Text>
                <Text fw={700} size="lg">{info.email}</Text>
              </Stack>
              <Badge variant="light" color="green" size="md" radius="md">Active</Badge>
            </Group>

            <Text size="sm" c="dimmed">
              You will keep receiving updates from {info.storeName}. You can unsubscribe at any time.
            </Text>

            <Button
              color="red"
              variant="light"
              leftSection={<IconMailOff size={14} />}
              onClick={handleCancel}
              loading={state === 'cancelling'}
              radius="md"
              mt="xs"
            >
              Unsubscribe
            </Button>
          </Stack>
        )}

        {state === 'cancelled' && (
          <Stack align="center" gap="md" ta="center" py="md">
            <ThemeIcon variant="light" color="gray" radius="xl" size="xl">
              <IconCircleCheck size={22} />
            </ThemeIcon>
            <Title order={4}>Unsubscribed</Title>
            <Text size="sm" c="dimmed">
              You've been removed from <strong>{info?.storeName || store.title}</strong>'s newsletter.
            </Text>
            {!!info?.status && (
              <Badge variant="light" color="gray" size="sm" radius="md">
                {info.status}
              </Badge>
            )}
            {!!unsubscribedOn && (
              <Text size="xs" c="dimmed">Updated on {unsubscribedOn}</Text>
            )}
            <Button component="a" href={`/${store.slug}`} variant="subtle" size="xs" color="gray">
              Back to {store.title || store.slug}
            </Button>
          </Stack>
        )}
      </Stack>
    </Stack>
  );
}
