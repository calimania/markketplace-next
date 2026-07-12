'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Alert,
  Badge,
  Button,
  Container,
  Group,
  Paper,
  Skeleton,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import {
  IconArrowLeft,
  IconCircleCheck,
  IconCreditCard,
  IconExternalLink,
} from '@tabler/icons-react';
import Link from 'next/link';
import TinyBreadcrumbs from '@/app/components/ui/tiny.breadcrumbs';
import StripeConnectBlock from '@/app/components/dashboard/stripe.view';
import { useAuth } from '@/app/providers/auth.provider';
import { useStore } from '../store.provider';

type PayoutsClientProps = {
  storeSlug: string;
};

export default function PayoutsClient({ storeSlug }: PayoutsClientProps) {
  const store = useStore();
  const { confirmed, isLoading } = useAuth();
  const searchParams = useSearchParams();
  const stripeReturn = searchParams.get('stripe') === 'return';
  const [returnBannerVisible, setReturnBannerVisible] = useState(stripeReturn);

  useEffect(() => {
    if (!returnBannerVisible) return;
    const timer = setTimeout(() => setReturnBannerVisible(false), 7000);
    return () => clearTimeout(timer);
  }, [returnBannerVisible]);

  if (isLoading) {
    return (
      <Container size="sm" py="lg">
        <Stack gap="md">
          <Skeleton height={18} width={280} radius="sm" />
          <Skeleton height={40} radius="lg" />
          <Skeleton height={200} radius="lg" />
        </Stack>
      </Container>
    );
  }

  if (!confirmed()) {
    return (
      <Container size="sm" py="xl">
        <Paper withBorder radius="lg" p="xl">
          <Text c="dimmed">Sign in to manage payouts.</Text>
        </Paper>
      </Container>
    );
  }

  return (
    <Container size="sm" py="lg">
      <Stack gap="md">
        <TinyBreadcrumbs
          items={[
            { label: 'Me', href: '/me' },
            { label: 'Tienda', href: '/tienda' },
            { label: store.slug || storeSlug, href: `/tienda/${storeSlug}` },
            { label: 'Payouts' },
          ]}
        />

        {/* Header */}
        <Paper withBorder radius="lg" p={{ base: 'sm', sm: 'md' }} className="tienda-panel">
          <Group justify="space-between" align="center" wrap="wrap" gap="sm">
            <Stack gap={4} style={{ minWidth: 0, flex: 1 }}>
              <Group gap="xs" wrap="wrap" align="center">
                <IconCreditCard size={18} style={{ color: '#00BCD4', flexShrink: 0 }} />
                <Title order={2} style={{ fontSize: 'clamp(1.3rem, 3vw, 1.6rem)' }}>
                  Payouts
                </Title>
                <Badge variant="light" color="cyan" radius="xl" size="sm">
                  Stripe Connect
                </Badge>
              </Group>
              <Text size="xs" c="dimmed">
                Manage your Stripe Connect account and payout settings for{' '}
                <Text span fw={600}>{store.title || storeSlug}</Text>.
              </Text>
            </Stack>

            <Group gap="xs" wrap="wrap">
              <Button
                component={Link}
                href={`/tienda/${storeSlug}`}
                variant="default"
                size="xs"
                radius="xl"
                leftSection={<IconArrowLeft size={14} />}
              >
                Overview
              </Button>
              <Button
                component="a"
                href="https://support.stripe.com/"
                target="_blank"
                rel="noopener noreferrer"
                variant="subtle"
                size="xs"
                radius="xl"
                color="gray"
                rightSection={<IconExternalLink size={12} />}
              >
                Stripe Support
              </Button>
            </Group>
          </Group>
        </Paper>

        {/* Return banner — shown after coming back from Stripe onboarding */}
        {returnBannerVisible && (
          <Alert
            icon={<IconCircleCheck size={16} />}
            color="cyan"
            radius="lg"
            withCloseButton
            onClose={() => setReturnBannerVisible(false)}
          >
            Welcome back! Your Stripe status has been refreshed below.
          </Alert>
        )}

        {/* Main connect block */}
        <Paper withBorder radius="lg" p={{ base: 'sm', sm: 'md' }} className="tienda-panel">
          <Stack gap="sm">
            <StripeConnectBlock
              store={store}
              variant="full"
              storeSlug={storeSlug}
            />
          </Stack>
        </Paper>

        {/* Footer help */}
        <Paper withBorder radius="md" p="sm" style={{ background: 'rgba(255,255,255,0.6)', border: '1px solid rgba(15,23,42,0.07)' }}>
          <Stack gap={4}>
            <Text size="xs" fw={700} tt="uppercase" c="dimmed" style={{ letterSpacing: '0.08em' }}>
              Need help?
            </Text>
            <Text size="xs" c="dimmed">
              Contact{' '}
              <Text
                span
                size="xs"
                component="a"
                href="mailto:sell@markket.place"
                style={{ color: '#E4007C', fontWeight: 600 }}
              >
                sell@markket.place
              </Text>
              {' '}with questions about Stripe Connect.
            </Text>
          </Stack>
        </Paper>
      </Stack>
    </Container>
  );
}
