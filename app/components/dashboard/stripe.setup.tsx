"use client";

import { useState } from 'react';
import {
  Paper,
  Title,
  Text,
  Button,
  Group,
  Stack,
  Alert,
} from '@mantine/core';
import {
  IconBuildingStore,
  IconCreditCard,
  IconAlertCircle,
  IconExternalLink
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { markketClient } from '@/markket/api.markket';
import { Store, StripeAccount } from '@/markket'

export default function StripePage({ store, stripe }: { store: Store, stripe: StripeAccount }) {
  const [loading, setLoading] = useState(false);
  const [accountCountry, setAccountCountry] = useState<'US' | 'CO' | 'MX'>('US');
  const markket = new markketClient();

  const openDashboard = async () => {
    setLoading(true);

    try {
      const linkResponse = await markket.stripeConnect('account_link', {
        account: store?.STRIPE_CUSTOMER_ID,
        store: store?.documentId,
        test_mode: !!stripe?.info?.test_mode,
      });

      if (linkResponse?.url) {
        setTimeout(() => {
          const url = new URL(linkResponse.url);
          const a = document.createElement('a');
          a.href = url.toString();
          a.target = '_blank';

          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        }, 0);
      } else {
        throw new Error('No account link URL received');
      }
    } catch (error) {
      console.error('Stripe setup error:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to setup Stripe account. Please try again.',
        color: 'red',
      });
    }
    setLoading(false);
  };

  const handleCreateAccount = async () => {
    setLoading(true);
    const markket = new markketClient();
    try {
      const account = await markket.stripeConnect('account', {
        store: store?.documentId,
        account_country: accountCountry,
        // test_mode: true,
        account_type: ['CO', 'SV'].includes(accountCountry) ? 'express' : 'standard',
      });

      if (!account) {
        throw new Error('Failed to create Stripe account');
      }

      console.log('Stripe account created:', account);

      const linkResponse = await markket.stripeConnect('account_link', {
        account: account?.account,
        store: store?.documentId,
      });

      if (linkResponse.url) {
        window.location.href = linkResponse.url;
      } else {
        throw new Error('No account link URL received');
      }

    } catch (error) {
      console.error('Stripe setup error:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to setup Stripe account. Please try again.',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Paper withBorder radius="xl" p="xl" className="border-4 border-black bg-gradient-to-br from-blue-50 to-fuchsia-50 relative overflow-hidden shadow-xl">
        <span className="absolute -top-8 left-8 w-24 h-24 bg-fuchsia-100 rounded-full opacity-30 z-0" />
        <span className="absolute bottom-0 right-0 w-32 h-32 bg-sky-100 rounded-full opacity-30 z-0" />
        <Stack gap="lg" className="relative z-10">
          <Group>
            <IconBuildingStore size={36} className="text-blue-600 drop-shadow" />
            <Title order={2} className="font-black text-fuchsia-700 tracking-tight">Stripe Payments</Title>
          </Group>

          <Text className="text-sky-800 text-lg font-semibold">
            Markket integrates with Stripe to securely send payouts. Your Stripe account is linked to the main email of the person who created this store. You&apos;ll be able to track sales, handle refunds, and receive payouts directly to your bank account.
          </Text>

          {!store?.STRIPE_CUSTOMER_ID && (
            <Text className="text-fuchsia-700 font-semibold">
              You can use all other features (albums, blog posts, products), but payouts are disabled until you connect your Stripe account. This is required for compliance and security.
            </Text>
          )}

          <Group justify="space-between" mt="md">
            {!store?.STRIPE_CUSTOMER_ID && (
              <div className="w-full flex flex-col gap-2">
                <label htmlFor="stripe-country" className="font-semibold text-sky-900">Country for Stripe Account</label>
                <select
                  id="stripe-country"
                  className="rounded-lg border-2 border-black px-3 py-2 bg-white text-fuchsia-700 font-bold focus:ring-2 focus:ring-fuchsia-200"
                  value={accountCountry}
                  onChange={e => setAccountCountry(e.target.value as 'US' | 'CO' | 'MX')}
                  disabled={loading}
                >
                  <option value="US">United States</option>
                  <option value="CO">Colombia</option>
                  <option value="MX">Mexico</option>
                  <option value="SV">El Salvador</option>
                </select>
                <Text size="xs" className="text-sky-700">Choose the country where your business or bank is located. This cannot be changed after setup.</Text>
                <Text size="xs">
                  Contact us [ email@markket.place ] or via
                  <a href="https://de.markket.place/store/next/blog/discord" target="_blank">
                    [ / discord ]
                  </a> with questions or help requests.
                </Text>
                <Button
                  leftSection={<IconCreditCard size={20} />}
                  onClick={handleCreateAccount}
                  disabled={loading}
                  loading={loading}
                  size="md"
                  variant="filled"
                  className="border-2 border-black bg-yellow-100 text-fuchsia-700 font-bold hover:bg-fuchsia-200 hover:text-fuchsia-900 transition-all shadow-md mt-2"
                >
                  {loading ? 'Setting up...' : `Create Stripe Account (${accountCountry})`}
                </Button>
              </div>
            )}

            {store?.STRIPE_CUSTOMER_ID && (
              <Button
                leftSection={<IconCreditCard size={20} />}
                onClick={openDashboard}
                disabled={loading}
                loading={loading}
                size="md"
                variant="filled"
                className="border-2 border-black bg-sky-100 text-blue-900 font-bold hover:bg-blue-200 hover:text-fuchsia-700 transition-all shadow-md"
              >
                {loading ? 'Setting up...' : 'Stripe Onboarding'}
              </Button>
            )}

            {store?.STRIPE_CUSTOMER_ID && (
              <a
                onClick={openDashboard}
                className="flex items-center space-x-2 text-blue-600 hover:text-fuchsia-700 font-bold border-b-2 border-dotted border-blue-400"
                href="https://dashboard.stripe.com/"
                target="_blank"
              >
                <Group>
                  <IconCreditCard size={20} />
                  <span>Stripe Dashboard</span>
                </Group>
              </a>
            )}

            <Button
              variant="light"
              component="a"
              size='md'
              href="https://docs.stripe.com/security"
              target="_blank"
              rightSection={<IconExternalLink size={16} />}
              className="border-2 border-black bg-white text-blue-900 font-bold hover:bg-blue-50 hover:text-fuchsia-700 transition-all shadow-sm"
            >
              Security at Stripe
            </Button>
          </Group>

          {!stripe.info?.payouts_enabled && (<Alert
            icon={<IconAlertCircle size={16} />}
            title="Important Information"
            color="blue"
            className="border-2 border-black bg-blue-50 text-blue-900 mt-4"
          >
            To accept payments, you&apos;ll need to:
            <ul className="list-disc pl-6 mt-2">
              <li>Provide basic business information</li>
              <li>Connect a bank account for payouts</li>
              <li>Verify your identity</li>
            </ul>
          </Alert>)}
        </Stack>
      </Paper>

      <Paper withBorder radius="xl" p="xl" mt="xl" className="border-4 border-black bg-white/80">
        {!store?.STRIPE_CUSTOMER_ID ? (
          <Stack gap="md">
            <Title order={3} className="text-fuchsia-700 font-bold">What happens next?</Title>
            <Text className="text-sky-800">
              After clicking <b>Setup Stripe Account</b>, you&apos;ll be redirected to Stripe to:
            </Text>
            <ol className="list-decimal pl-6 text-blue-900">
              <li className="mb-2">Select the country for your account</li>
              <li className="mb-2">Complete your account setup</li>
              <li className="mb-2">Verify your identity and business details</li>
              <li className="mb-2">Connect your bank account for receiving payments</li>
              <li className="mb-2">Questions? email@markket.place</li>
              <li>Start accepting payments from customers</li>
            </ol>
          </Stack>
        ) : (
          <Stack gap="md" mt="xl">
              <Title order={3} className="text-fuchsia-700 font-bold">Why Stripe? Payouts?</Title>
              <ol className="list-decimal pl-6 text-blue-900">
                <li className="mb-2">Enterprise level encryption</li>
                <li className="mb-2">Regulatory liaisons</li>
                <li className="mb-2">Identity verification & compliance</li>
                <li className="mb-2">Easy refunds, & customer management</li>
              </ol>
              <Title order={3} className="text-fuchsia-700 font-bold">Collaborative accounts</Title>
              <Text className="text-sky-800">
                Each store is associated with one Stripe account (the main email that created the link). The main user can use the Stripe dashboard to manage access.<br />
                We&apos;re working to add more features and control here. If you need a special flow, please reach out!
              </Text>
              <Title order={3} className="text-fuchsia-700 font-bold">Community Accounts</Title>
              <Text className="text-sky-800">
                If your community expects multiple stores to receive payouts in a single Stripe account, contact our team. We can manually link accounts or improve your workflow.
              </Text>
              <Title order={3} className="text-fuchsia-700 font-bold">Support</Title>
              <Text className="text-sky-800">
                The easiest way to reach our team is by emailing <b>email@markket.place</b>
              </Text>
            </Stack>
        )}
      </Paper>
    </>
  );
};
