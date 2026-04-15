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
  Badge,
  rem,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IconCheck, IconUserPlus } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/providers/auth.provider';
import { markketColors } from '@/markket/colors.config';

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
    <Container size={480} my={32}>
      <Stack gap="sm" align="center" mb="lg">
        <Badge
          size="lg"
          radius="md"
          variant="light"
          leftSection={<IconUserPlus size={14} />}
          style={{
            background: markketColors.sections.events.light,
            color: markketColors.sections.events.main,
          }}
        >
          New Account
        </Badge>
        <Title ta="center" fw={900} style={{ color: markketColors.neutral.charcoal }}>
          Welcome to Markketplace!
        </Title>
        <Text c="dimmed" size="sm" ta="center">
          Already have an account?{' '}
          <Anchor size="sm" component="button" onClick={() => router.push('/auth/login')}>
            Sign in
          </Anchor>
          {' · '}
          <Anchor size="sm" component="button" onClick={() => router.push('/auth/magic')}>
            Use magic link
          </Anchor>
        </Text>
      </Stack>

      <Paper
        withBorder
        radius="xl"
        p={{ base: 22, sm: 34 }}
        shadow="sm"
        style={{
          borderColor: markketColors.neutral.lightGray,
          boxShadow: '0 16px 32px rgba(0,0,0,0.08)',
          background: 'white',
        }}
      >
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack>
            <TextInput
              label="Email"
              placeholder="de@markket.place"
              size="md"
              required
              {...form.getInputProps('email')}
            />

            <TextInput
              label="Username"
              placeholder="anteater"
              size="md"
              required
              {...form.getInputProps('username')}
            />

            <PasswordInput
              label="Password"
              placeholder="At least 6 characters"
              size="md"
              required
              {...form.getInputProps('password')}
            />

            <Button
              loading={loading}
              type="submit"
              fullWidth
              size="md"
              leftSection={<IconUserPlus size={18} />}
              mt="xs"
              style={{
                background: `linear-gradient(135deg, ${markketColors.sections.events.main} 0%, ${markketColors.sections.shop.main} 100%)`,
              }}
            >
              Create Account
            </Button>
          </Stack>
        </form>
      </Paper>
    </Container>
  );
};
