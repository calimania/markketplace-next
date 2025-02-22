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
  Divider,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { useRouter } from 'next/navigation';
import { IconCheck, IconX } from '@tabler/icons-react';

interface LoginForm {
  identifier: string; // Strapi uses 'identifier' for email/username
  password: string;
}

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

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
      const response = await fetch('/api/markket/auth/local', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
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

      notifications.show({
        title: 'Welcome back!',
        message: 'Successfully logged in',
        color: 'green',
        icon: <IconCheck size="1.1rem" />,
        autoClose: 2000,
      });

      router.push('/dashboard');
    } catch (error: any) {
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
        Don't have an account yet?{' '}
        <Anchor size="sm" component="button" onClick={() => router.push('/auth/register')}>
          Create account
        </Anchor>
      </Text>

      <Paper withBorder shadow="md" p={30} mt={30} radius="md">
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack>
            <TextInput
              label="Email or Username"
              placeholder="de@markket.place"
              required
              {...form.getInputProps('identifier')}
            />

            <PasswordInput
              label="Password"
              placeholder="Your password"
              required
              {...form.getInputProps('password')}
            />

            <Group justify="space-between">
              <Anchor
                component="button"
                type="button"
                c="dimmed"
                onClick={() => router.push('/auth/reset-password')}
                size="xs"
              >
                Forgot password?
              </Anchor>
            </Group>

            <Button loading={loading} type="submit" fullWidth>
              Sign in
            </Button>
          </Stack>
        </form>
      </Paper>
    </Container>
  );
}