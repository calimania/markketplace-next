import { useState } from "react";
import { useAuth } from "@/app/providers/auth.provider";
import { markketConfig } from "@/markket/config";
import {
  Paper,
  Text,
  Button,
  Stack,
  ThemeIcon,
  Group,
  rem,
  Alert,
} from '@mantine/core';
import {
  IconMailForward,
  IconMailCheck,
  IconAlertCircle,
  IconMail,
} from '@tabler/icons-react';

const AuthUnconfirmed = () => {
  const { user } = useAuth();
  const [sentEmail, setSentEmail] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);

  const requestNewConfirmation = async () => {
    setLoading(true);
    if (!user?.email) {
      console.error('No email address found for user');
    }

    try {
      const request = await fetch(
        new URL('/api/auth/send-email-confirmation', markketConfig.api),
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: user?.email }),
        }
      );
      setSentEmail(request.ok);
    } catch (error) {
      console.error('Failed to send confirmation email:', error);
      setSentEmail(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper
      withBorder
      p="xl"
      radius="md"
      mt="xl"
      className="bg-gradient-to-r from-yellow-50 to-orange-50"
    >
      <Stack align="center" my={30}>
        <ThemeIcon
          size={90}
          radius="md"
          variant="light"
          color="yellow"
          className="border-2 border-yellow-100"
        >
          <IconMail style={{ width: rem(50), height: rem(50) }} />
        </ThemeIcon>

        <Stack align="center">
          <Text size="xl" fw={500} ta="center">
            Please verify your email address
          </Text>
          {sentEmail && (<Text c="dimmed" size="sm" ta="center" maw={400}>
            We&apos;ve sent a confirmation email to{' '}
            <Text span fw={500} c="dark">
              {user?.email}
            </Text>
          </Text>)}
        </Stack>

        {sentEmail === false && (
          <Alert
            icon={<IconAlertCircle size={16} />}
            color="red"
            variant="light"
          >
            Failed to send confirmation email. Please try again, or login if you were already verified.
            <br />
          </Alert>
        )}

        {sentEmail === true && (
          <Alert
            icon={<IconMailCheck size={16} />}
            color="green"
            variant="light"
          >
            New confirmation email sent! Please check your inbox.
          </Alert>
        )}

        <Group>
          <Button
            variant="light"
            leftSection={sentEmail ? <IconMailCheck size={18} /> : <IconMailForward size={18} />}
            onClick={requestNewConfirmation}
            loading={loading}
            color={sentEmail ? "green" : ""}
          >
            {loading
              ? "Sending..."
              : sentEmail
                ? "Email sent successfully"
                : "Resend confirmation email"}
          </Button>
        </Group>

        <Text size="xs" c="dimmed" ta="center">
          Can&apos;t find the email? Please check your spam folder or request a new one.
        </Text>
      </Stack>
    </Paper>
  );
};

export default AuthUnconfirmed;
