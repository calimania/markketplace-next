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
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { useRouter } from 'next/navigation';
import { IconMusicHeart, IconX } from '@tabler/icons-react';

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
        icon: <IconMusicHeart size="1.1rem" />,
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
    <Container size={420} my={40}>
      <Title ta="center" fw={900}>
        Welcome back!
      </Title>
      <Text c="dimmed" size="sm" ta="center" mt={5}>
        Request a secret link{' '}
        <Anchor size="sm" component="button" onClick={() => router.push('/auth/magic')}>
          [ /auth/magic]
        </Anchor>
      </Text>
      <Text c="dimmed" size="sm" ta="center" mt={5}>
        Don&apos;t have an account yet?{' '}
        <Anchor size="sm" component="button" onClick={() => router.push('/auth/register')}>
          [ /auth/register]
        </Anchor>
      </Text>

      <Paper withBorder shadow="md" p={30} mt={30} radius="md">
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack>
            <TextInput
              label="Email or Username"
              placeholder="de@markket.place"
              required
              disabled={loading}
              {...form.getInputProps('identifier')}
            />

            <PasswordInput
              label="Password"
              placeholder="Your password"
              disabled={loading}
              required
              {...form.getInputProps('password')}
            />

            <Group justify="space-between">
              <Anchor
                component="button"
                type="button"
                c="dimmed"
                onClick={() => router.push('/auth/forgot-password')}
                size="xs"
              >
                Forgot password?
              </Anchor>
            </Group>

            <Button loading={loading} type="submit" fullWidth disabled={loading}>
              Sign in
            </Button>
          </Stack>
        </form>
      </Paper>
    </Container>
  );
};
