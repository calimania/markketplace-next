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
  PasswordInput,
  Collapse,
} from '@mantine/core';
import {
  IconMailForward,
  IconMailCheck,
  IconAlertCircle,
  IconMail,
  IconLogin2,
  IconCheck,
  IconLockOpen,
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { useRouter } from 'next/navigation';

const AuthUnconfirmed = () => {
  const { user, login } = useAuth();
  const [sentEmail, setSentEmail] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [password, setPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const router = useRouter();

  const requestNewConfirmation = async () => {
    setLoading(true);
    if (!user?.email) {
      console.error('No email address found for user');
      return;
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

  const handleDirectLogin = async () => {
    if (!user?.email || !password) return;

    setLoginLoading(true);

    try {
      const response = await fetch('/api/markket?path=/api/auth/local', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          identifier: user.email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        notifications.show({
          title: 'Login Failed',
          message: 'Invalid password',
          color: 'red',
          icon: <IconAlertCircle size="1.1rem" />,
          autoClose: 3000,
        });
        throw new Error(data.error?.message || 'Login failed');
      }

      login({
        id: data.user.id,
        username: data.user.username,
        email: data.user.email,
        jwt: data.jwt,
      });

      notifications.show({
        title: 'Welcome!',
        message: 'You are now logged in',
        color: 'green',
        icon: <IconCheck size="1.1rem" />,
        autoClose: 1500,
      });

      router.push('/dashboard');
    } catch (error) {
      console.error('Login failed:', error);
    } finally {
      setLoginLoading(false);
    }
  };

  return (
    <Paper
      withBorder
      p="xl"
      radius="md"
      mt="xl"
      className="bg-gradient-to-r from-blue-50 to-cyan-50"
    >
      <Stack align="center" my={30}>
        <ThemeIcon
          size={90}
          radius="md"
          variant="light"
          color="blue"
          className="border-2 border-blue-100"
        >
          <IconMail style={{ width: rem(50), height: rem(50) }} />
        </ThemeIcon>

        <Stack align="center">
          <Text size="xl" fw={500} ta="center">
            Please verify your email address
          </Text>
          <Text c="dimmed" size="sm" ta="center" maw={500}>
            We&apos;ve sent a confirmation email to{' '}
            <Text span fw={500} c="dark">
              {user?.email}
            </Text>
          </Text>
        </Stack>

        <Alert
          icon={<IconLogin2 size={16} />}
          color="blue"
          variant="light"
          className="max-w-lg"
        >
          <Text mb={8}>Email confirmed? Login to continue:</Text>
          <Button
            onClick={() => setShowLoginForm(prev => !prev)}
            variant="subtle"
            color={showLoginForm ? "gray" : "blue"}
            mb={showLoginForm ? 10 : 0}
            leftSection={<IconLockOpen size={16} />}
          >
            {showLoginForm ? "Cancel" : "Enter Password"}
          </Button>
          <Collapse in={showLoginForm}>
            <Stack>
              <PasswordInput
                placeholder="Your password"
                value={password}
                onChange={(e) => setPassword(e.currentTarget.value)}
                required
              />
              <Button
                onClick={handleDirectLogin}
                loading={loginLoading}
                disabled={!password}
                fullWidth
              >
                Login
              </Button>
            </Stack>
          </Collapse>
        </Alert>

        {sentEmail === false && (
          <Alert
            icon={<IconAlertCircle size={16} />}
            color="red"
            variant="light"
            className="max-w-lg"
          >
            Failed to send confirmation email. Please try again, or login if you already verified your email.
          </Alert>
        )}

        {sentEmail === true && (
          <Alert
            icon={<IconMailCheck size={16} />}
            color="green"
            variant="light"
            className="max-w-lg"
          >
            New confirmation email sent! Please check your inbox and spam folders.
          </Alert>
        )}
        <Text size="xs" c="dimmed" ta="center" maw={450} mt={10}>
          Can&apos;t find the email? Please check your spam folder or request a new confirmation email.
        </Text>
        <Group mt={10}>
          <Button
            variant="light"
            leftSection={sentEmail ? <IconMailCheck size={18} /> : <IconMailForward size={18} />}
            onClick={requestNewConfirmation}
            loading={loading}
            color={sentEmail ? "green" : "blue"}
          >
            {loading
              ? "Sending..."
              : sentEmail
                ? "Email sent successfully"
                : "Resend confirmation email"}
          </Button>
        </Group>
      </Stack>
    </Paper>
  );
};

export default AuthUnconfirmed;
