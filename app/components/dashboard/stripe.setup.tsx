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
      const accountResponse = await markket.stripeConnect('account', {
        store: store?.documentId,
      });

      const { account } = await accountResponse.json();

      if (!account) {
        throw new Error('Failed to create Stripe account');
      }

      const linkResponse = await markket.stripeConnect('account_link', {
        account,
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
            Connect your store with Stripe to start accepting payments and manage your transactions.
            You&apos;ll be able to track sales, handle refunds, and receive payouts directly to your bank account.
          </Text>
          <Text c="dimmed">
            You can continue using every other feature, to create albums, blog posts, and products;
            however, for compliance & technical reasons, automatic payouts will be disabled until you set up your Stripe account
          </Text>
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
                {loading ? 'Setting up...' : 'Open Stripe Dashboard'}
              </Button>
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
        </Stack>
      </Paper>

      {/* Additional Info Section */}
      <Paper withBorder radius="md" p="xl" mt="xl">
        <Stack gap="md">
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
        <Stack gap="md" mt="xl">
          <Title order={3}>Why are you asking this from me?</Title>
          <Text c="dimmed">
            We&apos;re not asking for anything you havent given Venmo already - we just receive a
            prime number we use to identify your account
          </Text>
        </Stack>
        <Stack gap="md" mt="xl">
          <Title order={3}>I refuse</Title>
          <Text c="dimmed">
            Markket is open source, you can self-host and control your Stripe, or a different gateway;
            or install a community alternative: (more to come)
          </Text>
          <ol className="list-decimal pl-6">
            <li className="mb-2">ask customers to venmo you</li>
            <li className="mb-2">cash</li>
            <li className="mb-2">Square</li>
            <li className="mb-2">Wells fargo</li>
          </ol>
        </Stack>
      </Paper>
    </Container>
  );
};
