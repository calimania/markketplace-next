'use client';

import { useState } from 'react';
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
import { useRouter } from 'next/navigation';
import { IconLock, IconSparkles, IconX } from '@tabler/icons-react';
import { markketColors } from '@/markket/colors.config';

import { useAuth } from '@/app/providers/auth.provider';

interface LoginForm {
  identifier: string; // Strapi uses 'identifier' for email/username
  password: string;
}

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

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

      router.push('/dashboard');
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
                  onClick={() => router.push('/auth')}
                  size="xs"
                >
                  Back to auth
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
