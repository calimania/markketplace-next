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
  rem,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IconCheck } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/providers/auth.provider';

interface RegisterForm {
  email: string;
  username: string;
  password: string;
}

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  const form = useForm<RegisterForm>({
    initialValues: {
      email: '',
      username: '',
      password: '',
    },
    validate: {
      email: (val) => (/^\S+@\S+$/.test(val) ? null : 'Invalid email'),
      password: (val) => (val.length < 6 ? 'Password should be at least 6 characters' : null),
      username: (val) => (val.length < 3 ? 'Username should be at least 3 characters' : null),
    },
  });

  const handleSubmit = async (values: RegisterForm) => {
    setLoading(true);
    try {
      const response = await fetch('/api/markket?path=/api/auth/local/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Registration failed');
      }

      login({
        id: data.user.id,
        username: data.user.username,
        email: data.user.email,
        jwt: data.jwt,
      });

      notifications.show({
        title: 'Success!',
        message: 'Your account has been created, check your inbox for a confirmation email',
        color: 'green',
        icon: <IconCheck style={{ width: rem(18), height: rem(18) }} />,
      });

      router.push('/auth');
      // @eslint-ignore-next-line
    } catch (error: any) {
      notifications.show({
        title: 'Error',
        message: error.message || 'Something went wrong',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container size={633} my={40}>
      <Title ta="center" fw={900}>
        Welcome to Markket.ts!
      </Title>
      <Text c="dimmed" size="sm" ta="center" mt={5}>
        Request a secret link{' '}
        <Anchor size="sm" component="button" onClick={() => router.push('/auth/magic')}>
          [ /auth/magic]
        </Anchor>
      </Text>
      <Text c="dimmed" size="sm" ta="center" mt={5}>
        Login with password?{' '}
        <Anchor size="sm" component="button" onClick={() => router.push('/auth/login')}>
          [ /auth/login]
        </Anchor>
      </Text>
      <Paper withBorder shadow="md" p={30} mt={30} radius="md">
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack>
            <TextInput
              label="Email"
              placeholder="de@markket.place"
              required
              {...form.getInputProps('email')}
            />

            <TextInput
              label="Username"
              placeholder="anteater"
              required
              {...form.getInputProps('username')}
            />

            <PasswordInput
              label="Password"
              placeholder="hunter2"
              required
              {...form.getInputProps('password')}
            />

            <Button loading={loading} type="submit" fullWidth mt="xl">
              Register
            </Button>
          </Stack>
        </form>
      </Paper>
    </Container>
  );
};
