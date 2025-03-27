"use client";

import { useContext, useState, useEffect } from 'react';
import { DashboardContext } from "@/app/providers/dashboard.provider";
import { markketConfig } from "@/markket/config";
import { Store } from "@/markket";
import {
  Paper,
  Group,
  Text,
  Badge,
  Avatar,
  Grid,
  ThemeIcon,
  Tooltip,
  Skeleton,
} from '@mantine/core';
import {
  IconBuildingBank,
  IconWallet,
  IconCreditCard,
  IconBuildingStore,
  IconMail,
  IconPhone,
} from '@tabler/icons-react';

interface StripeAccount {
  info: {
    business_profile: {
      name: string;
      url: string;
      support_phone: string;
    };
    charges_enabled: boolean;
    payouts_enabled: boolean;
    default_currency: string;
    email: string;
    settings: {
      dashboard: {
        display_name: string;
      };
      branding: {
        primary_color: string;
        secondary_color: string;
        logo: string;
      };
    };
    external_accounts: {
      data: Array<{
        bank_name: string;
        last4: string;
        routing_number: string;
      }>;
    };
    capabilities: Record<string, string>;
  };
}

export default function StripeHeader() {
  const [loading, setLoading] = useState(true);
  const [account, setAccount] = useState<StripeAccount | null>(null);
  const { store } = useContext(DashboardContext) as { store: Store };

  useEffect(() => {
    const getAccountData = async () => {
      try {
        const response = await fetch(new URL('/api/markket', markketConfig.api), {
          body: JSON.stringify({
            action: 'stripe.account',
            store_id: store?.documentId,
          }),
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        const { data } = await response.json();
        setAccount(data);
      } catch (error) {
        console.error('Failed to fetch Stripe account:', error);
      } finally {
        setLoading(false);
      }
    };

    if (store?.documentId) {
      getAccountData();
    }
  }, [store?.documentId]);

  if (!store?.STRIPE_CUSTOMER_ID) {
    return null;
  }

  if (loading) {
    return <Skeleton height={200} radius="md" animate />;
  }

  if (!account) {
    return null;
  }

  const activeCapabilities = Object.entries(account.info.capabilities)
    .filter(([, status]) => status === 'active')
    .length;

  return (
    <Paper withBorder radius="md" p="md" mb="xl">
      <Text fz="lg" fw={500} >
            Stripe{account?.info?.test_mode ? ' test' : '' }: {account.info.settings?.dashboard?.display_name}
      </Text>
      <Grid>
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Group wrap="nowrap" gap="xl">
            <Avatar
              src={account.info.settings?.branding?.logo}
              size={80}
              radius="md"
              color="blue"
            >
              <IconBuildingStore size={40} />
            </Avatar>
            <div>
              <Group gap="xs">
                <Badge
                  color={account.info.charges_enabled ? "green" : "yellow"}
                  variant="dot"
                >
                  Charges {account.info.charges_enabled ? 'Enabled' : 'Disabled'}
                </Badge>
                <Badge
                  color={account.info.payouts_enabled ? "green" : "yellow"}
                  variant="dot"
                >
                  Payouts {account.info.payouts_enabled ? 'Enabled' : 'Disabled'}
                </Badge>
              </Group>
              <Group gap="xs" mt="xs">
                <IconMail size={16} />
                <Text size="sm">{account.info.email}</Text>
              </Group>
              {account.info.business_profile?.support_phone && (
                <Group gap="xs" mt={4}>
                  <IconPhone size={16} />
                  <Text size="sm">{account.info.business_profile.support_phone}</Text>
                </Group>
              )}
            </div>
          </Group>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 6 }}>
          <Group justify="space-between" h="100%" align="center">
            <Tooltip label="Connected Bank Account">
              <Group gap="xs">
                <ThemeIcon size="lg" variant="light" color="blue">
                  <IconBuildingBank size={20} />
                </ThemeIcon>
                <div>
                  <Text size="sm" fw={500}>
                    {account.info.external_accounts?.data[0]?.bank_name}
                  </Text>
                  <Text size="xs" c="dimmed">
                    ****{account.info.external_accounts?.data[0]?.last4}
                  </Text>
                </div>
              </Group>
            </Tooltip>

            <Tooltip label="Active Payment Methods">
              <Group gap="xs">
                <ThemeIcon size="lg" variant="light" color="green">
                  <IconCreditCard size={20} />
                </ThemeIcon>
                <div>
                  <Text size="sm" fw={500}>
                    {activeCapabilities} Payment
                  </Text>
                  <Text size="xs" c="dimmed">
                    Methods Accepted
                  </Text>
                </div>
              </Group>
            </Tooltip>

            <Tooltip label="Default Currency">
              <Group gap="xs">
                <ThemeIcon size="lg" variant="light" color="grape">
                  <IconWallet size={20} />
                </ThemeIcon>
                <div>
                  <Text size="sm" fw={500}>
                    {account.info.default_currency.toUpperCase()}
                  </Text>
                  <Text size="xs" c="dimmed">
                    Currency
                  </Text>
                </div>
              </Group>
            </Tooltip>
          </Group>
        </Grid.Col>
      </Grid>
    </Paper>
  );
}
