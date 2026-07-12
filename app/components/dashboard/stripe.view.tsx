'use client';

import { useState } from 'react';
import {
  Badge,
  Button,
  Group,
  Loader,
  Paper,
  Select,
  Stack,
  Text,
  ThemeIcon,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import {
  IconAlertTriangle,
  IconArrowRight,
  IconCircleCheck,
  IconCreditCard,
  IconExternalLink,
  IconPlugConnected,
  IconRefresh,
} from '@tabler/icons-react';
import { markketColors } from '@/markket/colors.config';
import {
  useStripeConnect,
  type StripeConnectData,
} from '@/markket/api.pagos';
import type { Store } from '@/markket';

export type StripeConnectStatus = StripeConnectData['status'];

type StripeConnectBlockProps = {
  store: Store;
  variant?: 'compact' | 'full';
  /** optional mock override for UI review — skips live API derivation */
  mockStatus?: StripeConnectStatus;
  storeSlug: string;
  /** called when compact CTA is clicked (e.g. switch to payouts tab) */
  onAction?: () => void;
};

// ─── Status config ────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<StripeConnectStatus, {
  icon: React.ReactNode;
  iconColor: 'pink' | 'yellow' | 'orange' | 'cyan';
  bg: string;
  border: string;
  label: string;
  desc: string;
  cta: string;
  ctaColor: 'pink' | 'yellow' | 'orange' | 'cyan';
  ctaVariant: 'filled' | 'light';
}> = {
  not_connected: {
    icon: <IconCreditCard size={15} />,
    iconColor: 'pink',
    bg: markketColors.rosa.light,
    border: `1px solid ${markketColors.rosa.main}33`,
    label: 'Connect Stripe',
    desc: 'Enable payouts for this store',
    cta: 'Set up payouts',
    ctaColor: 'pink',
    ctaVariant: 'filled',
  },
  pending: {
    icon: <IconAlertTriangle size={15} />,
    iconColor: 'yellow',
    bg: '#FFFDE7',
    border: '1px solid #FFE082',
    label: 'Setup incomplete',
    desc: 'Finish Stripe onboarding to enable payouts',
    cta: 'Resume',
    ctaColor: 'yellow',
    ctaVariant: 'filled',
  },
  restricted: {
    icon: <IconAlertTriangle size={15} />,
    iconColor: 'orange',
    bg: '#FFF3E0',
    border: '1px solid #FFCC80',
    label: 'Account restricted',
    desc: 'Action required — review your Stripe requirements',
    cta: 'Fix issues',
    ctaColor: 'orange',
    ctaVariant: 'filled',
  },
  active: {
    icon: <IconCircleCheck size={15} />,
    iconColor: 'cyan',
    bg: markketColors.sections.shop.light,
    border: `1px solid ${markketColors.sections.shop.main}33`,
    label: 'Stripe Connected',
    desc: 'Charges & payouts enabled',
    cta: 'Manage',
    ctaColor: 'cyan',
    ctaVariant: 'light',
  },
};

// ─── Compact single-row banner ────────────────────────────────────────────────

function StripeCompact({
  status,
  onAction,
  loading,
}: {
  status: StripeConnectStatus;
  onAction?: () => void;
  loading?: boolean;
}) {
  const config = STATUS_CONFIG[status];

  return (
    <Paper
      radius="lg"
      p={{ base: 'xs', sm: 'sm' }}
      className="tienda-panel"
      style={{ background: config.bg, border: config.border }}
    >
      <Group justify="space-between" align="center" wrap="wrap" gap="xs">
        <Group gap="xs" wrap="nowrap" style={{ minWidth: 0, flex: 1 }}>
          <ThemeIcon variant="light" radius="xl" size="sm" color={config.iconColor}>
            {config.icon}
          </ThemeIcon>
          <div style={{ minWidth: 0 }}>
            <Text size="sm" fw={600} lineClamp={1}>{config.label}</Text>
            <Text size="xs" c="dimmed" lineClamp={1}>{config.desc}</Text>
          </div>
        </Group>
        <Button
          size="xs"
          radius="xl"
          variant={config.ctaVariant}
          color={config.ctaColor}
          rightSection={loading ? <Loader size={10} /> : <IconArrowRight size={12} />}
          onClick={onAction}
          disabled={loading}
          style={{ flexShrink: 0 }}
        >
          {config.cta}
        </Button>
      </Group>
    </Paper>
  );
}

// ─── Full payouts panel ───────────────────────────────────────────────────────

const COUNTRY_OPTIONS = [
  { value: 'US', label: '🇺🇸 United States' },
  { value: 'CA', label: '🇨🇦 Canada' },
  { value: 'CO', label: '🇨🇴 Colombia' },
  { value: 'MX', label: '🇲🇽 Mexico' },
  { value: 'SV', label: '🇸🇻 El Salvador' },
];

function StripeFull({
  connectData,
  store,
  loading,
  onStart,
  onResume,
  onReview,
  onDashboard,
  onReload,
}: {
  connectData?: StripeConnectData;
  store: Store;
  storeSlug: string;
  loading: boolean;
  onStart: (country: string) => void;
  onResume: () => void;
  onReview: () => void;
  onDashboard: () => void;
  onReload: () => void;
}) {
  const [country, setCountry] = useState('US');
  const status = connectData?.status ?? 'not_connected';

  if (status === 'not_connected') {
    return (
      <Stack gap="md">
        <Text size="sm" c="dimmed">
          Connect a Stripe account to receive payouts directly to your bank.
          Markketplace uses Stripe Connect so each store manages its own payouts securely.
        </Text>

        <Select
          label="Country for Stripe account"
          description="Choose the country where your business or bank is located."
          data={COUNTRY_OPTIONS}
          value={country}
          onChange={(v) => setCountry(v || 'US')}
          size="sm"
          style={{ maxWidth: 320 }}
        />

        <Button
          leftSection={<IconPlugConnected size={16} />}
          color="pink"
          radius="xl"
          size="sm"
          loading={loading}
          disabled={loading}
          onClick={() => onStart(country)}
          style={{ alignSelf: 'flex-start' }}
        >
          Connect Stripe ({country})
        </Button>

        <Paper
          withBorder
          radius="md"
          p="sm"
          style={{ background: markketColors.neutral.lightGray, border: '1px solid rgba(15,23,42,0.07)' }}
        >
          <Text size="xs" fw={700} tt="uppercase" c="dimmed" mb={6} style={{ letterSpacing: '0.08em' }}>
            What you will need
          </Text>
          <Stack gap={4}>
            {[
              'A valid email and basic business information',
              'Bank account details for payouts',
              'Identity verification (depends on country)',
            ].map((item) => (
              <Group key={item} gap="xs" wrap="nowrap" align="flex-start">
                <Text size="xs" c={markketColors.rosa.main} fw={700} style={{ flexShrink: 0 }}>·</Text>
                <Text size="xs" c="dimmed">{item}</Text>
              </Group>
            ))}
          </Stack>
        </Paper>

        <Button
          component="a"
          href="https://stripe.com/connect"
          target="_blank"
          rel="noopener noreferrer"
          variant="subtle"
          size="xs"
          color="gray"
          rightSection={<IconExternalLink size={12} />}
          style={{ alignSelf: 'flex-start' }}
        >
          Learn about Stripe Connect
        </Button>
      </Stack>
    );
  }

  if (status === 'pending' || status === 'restricted') {
    const hasPastDue = (connectData?.requirements_past_due?.length ?? 0) > 0;

    return (
      <Stack gap="md">
        <Paper
          withBorder
          radius="md"
          p="sm"
          style={{ background: status === 'restricted' ? '#FFF3E0' : '#FFFDE7', borderColor: '#FFE082' }}
        >
          <Group gap="xs" wrap="nowrap">
            <ThemeIcon variant="light" color={status === 'restricted' ? 'orange' : 'yellow'} radius="xl" size="sm">
              <IconAlertTriangle size={14} />
            </ThemeIcon>
            <div>
              <Text size="sm" fw={600}>
                {status === 'restricted' ? 'Account restricted' : 'Onboarding in progress'}
              </Text>
              <Text size="xs" c="dimmed">
                {status === 'restricted'
                  ? 'Stripe flagged requirements. Review and resolve them to re-enable payouts.'
                  : 'Your Stripe account was created but setup is not complete. Resume to enable payouts.'}
              </Text>
            </div>
          </Group>
        </Paper>

        {connectData?.requirements_due && connectData.requirements_due.length > 0 && (
          <Paper withBorder radius="md" p="sm" style={{ borderColor: '#FFE082' }}>
            <Text size="xs" fw={700} tt="uppercase" c="dimmed" mb={4} style={{ letterSpacing: '0.07em' }}>
              Requirements {hasPastDue ? '(past due)' : 'due'}
            </Text>
            <Stack gap={2}>
              {connectData.requirements_due.slice(0, 8).map((req) => (
                <Text key={req} size="xs" c={hasPastDue ? 'red' : 'orange'} style={{ fontFamily: 'monospace' }}>
                  · {req.replace(/_/g, ' ')}
                </Text>
              ))}
            </Stack>
          </Paper>
        )}

        <Group gap="xs" wrap="wrap">
          <Button
            leftSection={<IconArrowRight size={16} />}
            color={status === 'restricted' ? 'orange' : 'yellow'}
            radius="xl"
            size="sm"
            loading={loading}
            disabled={loading}
            onClick={status === 'restricted' ? onReview : onResume}
          >
            {status === 'restricted' ? 'Fix requirements' : 'Resume onboarding'}
          </Button>
          <Button
            variant="subtle"
            size="xs"
            color="gray"
            leftSection={<IconRefresh size={14} />}
            onClick={onReload}
            disabled={loading}
          >
            Refresh
          </Button>
        </Group>
      </Stack>
    );
  }

  // active
  const accountId = connectData?.account_id || store.STRIPE_CUSTOMER_ID || '';

  return (
    <Stack gap="md">
      <Group gap="xs" wrap="wrap">
        <Badge color="cyan" variant="dot" radius="xl">Active</Badge>
        {connectData?.charges_enabled && (
          <Badge color="green" variant="light" radius="xl">Charges enabled</Badge>
        )}
        {connectData?.payouts_enabled && (
          <Badge color="green" variant="light" radius="xl">Payouts enabled</Badge>
        )}
        {connectData?.disabled_reason && (
          <Badge color="red" variant="light" radius="xl">Restricted: {connectData.disabled_reason}</Badge>
        )}
        {accountId && (
          <Badge color="gray" variant="outline" radius="xl" style={{ fontFamily: 'monospace', fontSize: 10 }}>
            {accountId.slice(0, 24)}{accountId.length > 24 ? '…' : ''}
          </Badge>
        )}
      </Group>

      {connectData?.requirements_due && connectData.requirements_due.length > 0 && (
        <Paper withBorder radius="md" p="sm" style={{ borderColor: '#FFE082', background: '#FFFDE7' }}>
          <Text size="xs" fw={700} tt="uppercase" c="dimmed" mb={4} style={{ letterSpacing: '0.07em' }}>
            Upcoming requirements
          </Text>
          <Stack gap={2}>
            {connectData.requirements_due.slice(0, 5).map((req) => (
              <Text key={req} size="xs" c="orange" style={{ fontFamily: 'monospace' }}>
                · {req.replace(/_/g, ' ')}
              </Text>
            ))}
          </Stack>
          <Button
            mt="xs"
            size="xs"
            radius="xl"
            color="orange"
            variant="light"
            leftSection={<IconArrowRight size={12} />}
            loading={loading}
            onClick={onReview}
          >
            Review requirements
          </Button>
        </Paper>
      )}

      <Group gap="xs" wrap="wrap">
        <Button
          leftSection={<IconExternalLink size={14} />}
          color="cyan"
          variant="light"
          radius="xl"
          size="sm"
          loading={loading}
          disabled={loading}
          onClick={onDashboard}
        >
          Open Stripe Dashboard
        </Button>
        <Button
          variant="subtle"
          size="xs"
          color="gray"
          leftSection={<IconRefresh size={14} />}
          onClick={onReload}
          disabled={loading}
        >
          Refresh
        </Button>
      </Group>

      {connectData?.last_synced_at && (
        <Text size="xs" c="dimmed">
          Last synced: {new Date(connectData.last_synced_at).toLocaleString()}
        </Text>
      )}
    </Stack>
  );
}

// ─── Public export ────────────────────────────────────────────────────────────

export default function StripeConnectBlock({
  store,
  variant = 'compact',
  mockStatus,
  storeSlug,
  onAction,
}: StripeConnectBlockProps) {
  const {
    state,
    connectStatus,
    actionLoading,
    load,
    handleStart,
    handleResume,
    handleReview,
    handleDashboard,
  } = useStripeConnect(storeSlug);

  const derivedStatus: StripeConnectStatus =
    mockStatus
    ?? connectStatus
    ?? (store.STRIPE_CUSTOMER_ID ? 'active' : 'not_connected');

  const connectData = state.phase === 'loaded' ? state.connectData : undefined;

  const handleCompactAction = async () => {
    try {
      if (derivedStatus === 'not_connected') {
        await handleStart('US');
      } else if (derivedStatus === 'pending') {
        await handleResume();
      } else if (derivedStatus === 'restricted') {
        await handleReview();
      } else {
        await handleDashboard();
      }
    } catch (err) {
      notifications.show({
        title: 'Stripe error',
        message: err instanceof Error ? err.message : 'Action failed. Please try again.',
        color: 'red',
        autoClose: 5000,
      });
    }
  };

  if (variant === 'compact') {
    return (
      <StripeCompact
        status={derivedStatus}
        loading={actionLoading}
        onAction={onAction ?? handleCompactAction}
      />
    );
  }

  return (
    <StripeFull
      connectData={connectData}
      store={store}
      storeSlug={storeSlug}
      loading={actionLoading || state.phase === 'loading'}
      onStart={handleStart}
      onResume={handleResume}
      onReview={handleReview}
      onDashboard={handleDashboard}
      onReload={load}
    />
  );
}
