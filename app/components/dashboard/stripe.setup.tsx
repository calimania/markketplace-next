"use client";

import { useContext, useState } from 'react';
import {
  Container,
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
import { DashboardContext } from '@/app/providers/dashboard.provider';
import StoreHeader from './store.header';

export default function StripePage() {
  const [loading, setLoading] = useState(false);

  const { store } = useContext(DashboardContext) as { store: any };

  const openDashboard = async () => {
    setLoading(true);
    const markket = new markketClient();
    try {
      const linkResponse = await markket.stripeConnect('account_link', {
        account: store?.STRIPE_CUSTOMER_ID,
        store: store?.documentId,
      });

      console.log({ linkResponse, ur: linkResponse?.data?.url });

      if (linkResponse?.url) {
        const url = new URL(linkResponse.url);
        const a = document.createElement('a');
        a.href = url.toString();
        a.target = '_blank';
        a.click();
        a.remove();
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
    <Container size="md" pb="xl">
      <StoreHeader store={store} />
      <Paper withBorder radius="md" p="xl">
        <Stack gap="lg">
          <Group>
            <IconBuildingStore size={32} color="var(--mantine-color-blue-6)" />
            <Title order={2}>Stripe Payments</Title>
          </Group>

          <Text c="dimmed">
            Markket uses Stripe connect to send payouts.
            You&apos;ll be able to track sales, handle refunds, and receive payouts directly to your bank account.
          </Text>

          {!store?.STRIPE_CUSTOMER_ID && (
            <Text c="dimmed">
              You can continue using every other feature, to create albums, blog posts, and products;
              however, for compliance & technical reasons, payouts will be disabled until you set up your Stripe account
            </Text>
          )}

          <Group justify="space-between" mt="md">
            {!store?.STRIPE_CUSTOMER_ID && (
              <Button
                leftSection={<IconCreditCard size={20} />}
                onClick={handleCreateAccount}
                disabled={loading}
                loading={loading}
                size="md"
                variant="filled"
              >
                {loading ? 'Setting up...' : 'Create Stripe Account'}
              </Button>
            )}

            {store?.STRIPE_CUSTOMER_ID && (
              <Button
                leftSection={<IconCreditCard size={20} />}
                onClick={openDashboard}
                disabled={loading}
                loading={loading}
                size="md"
                variant="filled"
              >
                {loading ? 'Setting up...' : 'Stripe Onboarding'}
              </Button>
            )}

            {store?.STRIPE_CUSTOMER_ID && (
              <a
                onClick={openDashboard}
                className="flex items-center space-x-2 text-blue-600 hover:text-blue-800"
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
            >
              Security at Stripe
            </Button>
          </Group>

          <Alert
            icon={<IconAlertCircle size={16} />}
            title="Important Information"
            color="blue"
          >
            To accept payments, you&apos;ll need to:
            <ul className="list-disc pl-6 mt-2">
              <li>Provide basic business information</li>
              <li>Connect a bank account for payouts</li>
              <li>Verify your identity</li>
            </ul>
          </Alert>
        </Stack>
      </Paper>

      {/* Additional Info Section */}
      <Paper withBorder radius="md" p="xl" mt="xl">
        {!store.STRIPE_CUSTOMER_ID && (<Stack gap="md">
          <Title order={3}>What happens next?</Title>
          <Text c="dimmed">
            After clicking &quot;Setup Stripe Account&quot;, you&apos;ll be redirected to Stripe to:
          </Text>
          <ol className="list-decimal pl-6">
            <li className="mb-2">Complete your account setup</li>
            <li className="mb-2">Verify your identity and business details</li>
            <li className="mb-2">Connect your bank account for receiving payments</li>
            <li>Start accepting payments from customers</li>
          </ol>
        </Stack>
        )}

        <Stack gap="md" mt="xl">
          <Title order={3}>Why Stripe? Payouts?</Title>
          <Text c="dimmed">
            Storing private and sensitive information like credit cards is very complex, malign actors
            are always looking for ways to steal this information, and there are many regulatory nuances.
            At Markket we want to keep your data safe, and your transactions aways from prying eyes
          </Text>
          <ol className="list-decimal pl-6">
            <li className="mb-2">Enterprise level encryption</li>
            <li className="mb-2">Regulatory liasons</li>
            <li className="mb-2">Identity verification & compliance</li>
            <li className="mb-2">Easy refunds, & customer management</li>
          </ol>
        </Stack>
      </Paper>
    </Container>
  );
};
