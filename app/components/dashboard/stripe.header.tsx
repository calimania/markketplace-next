"use client";

import { useContext, } from 'react';
import { DashboardContext } from "@/app/providers/dashboard.provider";
import { Store, StripeAccount } from "@/markket";
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
  Button,
} from '@mantine/core';
import {
  IconBuildingBank,
  IconWallet,
  IconCreditCard,
  IconBuildingStore,
  IconMail,
  IconPhone,
} from '@tabler/icons-react';


// Country code to flag and name mapping
const COUNTRY_MAP: Record<string, { name: string; flag: string }> = {
  US: { name: 'United States', flag: '🇺🇸' },
  CO: { name: 'Colombia', flag: '🇨🇴' },
  MX: { name: 'Mexico', flag: '🇲🇽' },
  SV: { name: 'El Salvador', flag: '🇸🇻' },
  IL: { name: 'Israel', flag: '🇮🇱' },
  CA: { name: 'Canada', flag: '🇨🇦' },
};

export default function StripeHeader() {

  const { stripe: account, isLoading } = useContext(DashboardContext) as { store: Store, stripe: StripeAccount | undefined, isLoading: boolean };

  if (!account?.info) {
    return null;
  }

  if (isLoading) {
    return <Skeleton height={200} radius="md" animate />;
  }

  const activeCapabilities = Object.entries(account.info.capabilities)
    .filter(([, status]) => status === 'active')
    .length;

  const country = account.info.country?.toUpperCase() || 'US';
  const countryInfo = COUNTRY_MAP[country] || { name: country, flag: '🏳️' };
  const currency = account.info.default_currency?.toUpperCase() || 'USD';
  const businessType = (account.info as any).business_type || 'N/A';
  const accountType = (account.info as any).type || 'N/A';

  return (
    <Paper withBorder radius="xl" p="xl" mb="xl" className="border-4 border-fuchsia-200 bg-gradient-to-br from-fuchsia-50 to-sky-50 shadow-xl">
      <Group justify="space-between" align="center" mb="md">
        <Text fz="lg" fw={700} className={account?.info?.test_mode ? 'text-fuchsia-700' : 'text-cyan-700'}>

          {account.info.settings?.dashboard?.display_name || ''}
        </Text>
        <Badge color="blue" variant="light" className="border-2 border-black font-bold">
          {countryInfo.flag} {countryInfo.name} {(account?.info as any)?.test_mode ? '  - test' : ''}
        </Badge>
        <Badge color={account?.info?.test_mode ? 'magenta' : 'cyan'} size="lg" className="border-2 border-black font-bold">
          {account.info.id}
        </Badge>
        <Button
          component="a"
          href="https://support.stripe.com/"
          target="_blank"
          size="xs"
          variant="light"
          color="blue"
          className="border-2 border-black bg-white text-blue-900 font-bold hover:bg-blue-50 hover:text-fuchsia-700 transition-all shadow-sm"
        >
          Stripe Support
        </Button>
      </Group>
      <Grid>
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Group wrap="nowrap" gap="xl">
            <Avatar
              src={account.info.settings?.branding?.logo}
              size={80}
              radius="xl"
              color="blue"
              className="border-2 border-fuchsia-200 bg-white"
            >
              <IconBuildingStore size={36} />
            </Avatar>
            <div>
              <Group gap="xs">
                <Badge
                  color={account.info.charges_enabled ? "green" : "yellow"}
                  variant="dot"
                  className="border-2 border-black font-bold"
                >
                  Charges {account.info.charges_enabled ? 'Enabled' : 'Disabled'}
                </Badge>
                <Badge
                  color={account.info.payouts_enabled ? "green" : "yellow"}
                  variant="dot"
                  className="border-2 border-black font-bold"
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
              <Group gap="xs" mt={4}>
                <Badge color="gray" size="xs" className="border-2 border-black">Business Type: {businessType}</Badge>
                <Badge color="gray" size="xs" className="border-2 border-black">Account Type: {accountType}</Badge>
              </Group>
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
                    {account.info.external_accounts?.data[0]?.bank_name || 'No bank linked'}
                  </Text>
                  <Text size="xs" c="dimmed">
                    {account.info.external_accounts?.data[0]?.last4 ? `****${account.info.external_accounts?.data[0]?.last4}` : '—'}
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
                    {currency}
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
