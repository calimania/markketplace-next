'use client';

import { useEffect, useRef, useState } from 'react';
import {
  TextInput,
  PasswordInput,
  Paper,
  Title,
  Container,
  Button,
  Stack,
  Text,
  Anchor,
  Group,
  Badge,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { useRouter, useSearchParams } from 'next/navigation';
import { IconLock, IconSparkles, IconX } from '@tabler/icons-react';
import { markketColors } from '@/markket/colors.config';

import { useAuth } from '@/app/providers/auth.provider';

interface LoginForm {
  identifier: string; // Strapi uses 'identifier' for email/username
  password: string;
}

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const oauthHydratedRef = useRef(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, confirmed, isLoading, refreshUser } = useAuth();

  const resolveNextPath = () => {
    const next = searchParams.get('next');
    if (!next) return '/me';

    try {
      const decoded = decodeURIComponent(next);
      if (decoded.startsWith('/')) return decoded;
      return '/me';
    } catch {
      return '/me';
    }
  };

  const nextPath = resolveNextPath();

  useEffect(() => {
    if (isLoading) return;
    if (!confirmed()) return;
    router.replace(nextPath);
  }, [confirmed, isLoading, nextPath, router]);

  useEffect(() => {
    const oauthJwt = searchParams.get('jwt');
    if (!oauthJwt) return;
    if (oauthHydratedRef.current) return;
    oauthHydratedRef.current = true;

    const hydrateOauthSession = async () => {
      try {
        localStorage.setItem('markket.auth', JSON.stringify({ jwt: oauthJwt }));
        await refreshUser();
        router.replace(nextPath);
      } catch {
        notifications.show({
          title: 'Authentication failed',
          message: 'Could not complete sign in. Please try again.',
          color: 'red',
          icon: <IconX size="1.1rem" />,
          autoClose: 3500,
        });
      }
    };

    hydrateOauthSession();
  }, [nextPath, refreshUser, router, searchParams]);

  const form = useForm<LoginForm>({
    initialValues: {
      identifier: '',
      password: '',
    },
    validate: {
      identifier: (val) => (val.length < 3 ? 'Invalid email or username' : null),
      password: (val) => (val.length < 6 ? 'Password should be at least 6 characters' : null),
    },
  });

  const handleSubmit = async (values: LoginForm) => {
    setLoading(true);

    try {
      const response = await fetch('/api/markket?path=/api/auth/local', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          identifier: values.identifier,
          password: values.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.warn('Login failed:', data.error?.message);
        notifications.show({
          title: 'Login Failed',
          message: 'Invalid email/username or password',
          color: 'red',
          icon: <IconX size="1.1rem" />,
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
        title: 'Welcome back!',
        message: 'Authorized credentials. Loading dashboard...',
        color: 'green',
        icon: <IconSparkles size="1.1rem" />,
        autoClose: 800,
      });

      router.replace(nextPath);
    } catch (error: any) {
      console.warn({ error });
      notifications.show({
        title: 'Error',
        message: 'Something went wrong. Please try again.',
        color: 'red',
        icon: <IconX size="1.1rem" />,
        autoClose: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container size="xs" py="md">
      <Stack gap="md">
        <Badge
          size="md"
          radius="xl"
          variant="light"
          leftSection={<IconLock size={14} />}
          style={{
            alignSelf: 'flex-start',
            background: markketColors.rosa.light,
            color: markketColors.rosa.main,
            fontWeight: 600,
          }}
        >
          Password Login
        </Badge>
        <Title order={2} fw={800} style={{ color: markketColors.neutral.charcoal }}>
          Welcome back
        </Title>
        <Text c="dimmed" size="sm">
          Use your email and password to continue. Prefer passwordless? Use a magic link instead.
        </Text>
        <Group gap="xs">
          <Button
            size="xs"
            variant="light"
            color="pink"
            leftSection={<IconSparkles size={14} />}
            onClick={() => router.push('/auth/magic')}
          >
            Use Magic Link
          </Button>
          <Button
            size="xs"
            variant="subtle"
            color="gray"
            onClick={() => router.push('/auth/register')}
          >
            Create account
          </Button>
        </Group>

        <Paper
          withBorder
          radius="xl"
          p={{ base: 20, sm: 28 }}
          shadow="sm"
          style={{
            borderColor: markketColors.neutral.lightGray,
            boxShadow: '0 10px 28px rgba(0,0,0,0.07)',
            background: 'white',
          }}
        >
          <form onSubmit={form.onSubmit(handleSubmit)}>
            <Stack gap="md">
              <TextInput
                label="Email or Username"
                placeholder="de@markket.place"
                size="md"
                radius="md"
                required
                disabled={loading}
                {...form.getInputProps('identifier')}
              />

              <PasswordInput
                label="Password"
                placeholder="Your password"
                size="md"
                radius="md"
                disabled={loading}
                required
                {...form.getInputProps('password')}
              />

              <Group justify="space-between" align="center">
                <Anchor
                  component="button"
                  type="button"
                  c="dimmed"
                  onClick={() => router.push('/auth/forgot-password')}
                  size="xs"
                >
                  Forgot password?
                </Anchor>
                <Anchor
                  component="button"
                  type="button"
                  c="dimmed"
                  onClick={() => router.push('/')}
                  size="xs"
                >
                  Back home
                </Anchor>
              </Group>

              <Button
                loading={loading}
                type="submit"
                fullWidth
                size="md"
                radius="lg"
                leftSection={<IconSparkles size={18} />}
                disabled={loading}
                style={{
                  background: `linear-gradient(135deg, ${markketColors.rosa.main} 0%, ${markketColors.sections.shop.main} 100%)`,
                }}
              >
                Sign in
              </Button>
            </Stack>
          </form>
        </Paper>
      </Stack>
    </Container>
  );
};
