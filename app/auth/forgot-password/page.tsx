'use client';

import { useState } from 'react';
import {
  TextInput,
  Paper,
  Title,
  Container,
  Button,
  Stack,
  Text,
  Anchor,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IconCheck, IconX } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';

interface ResetPasswordForm {
  email: string;
}

export default function ResetPasswordPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const form = useForm<ResetPasswordForm>({
    initialValues: {
      email: '',
    },
    validate: {
      email: (val) => (/^\S+@\S+$/.test(val) ? null : 'Invalid email'),
    },
  });

  const handleSubmit = async (values: ResetPasswordForm) => {
    setLoading(true);
    try {
      const response = await fetch('/api/markket?path=/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to send reset email');
      }

      notifications.show({
        title: 'Check your email',
        message: 'If an account exists with this email, you will receive a password reset link',
        color: 'green',
        icon: <IconCheck size="1.1rem" />,
        autoClose: 5000,
      });

      // Redirect to login after a short delay
      setTimeout(() => router.push('/auth/login'), 5000);

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
        Reset your password
      </Title>
      <Text c="dimmed" size="sm" ta="center" mt={5}>
        Enter your email address and we'll send you a reset link
      </Text>

      <Paper withBorder shadow="md" p={30} mt={30} radius="md">
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack>
            <TextInput
              label="Email"
              placeholder="you@markket.place"
              required
              {...form.getInputProps('email')}
            />

            <Button loading={loading} type="submit" fullWidth>
              Send reset link
            </Button>

            <Anchor
              component="button"
              type="button"
              c="dimmed"
              size="xs"
              ta="center"
              onClick={() => router.push('/auth/login')}
            >
              Back to login
            </Anchor>
          </Stack>
        </form>
      </Paper>
    </Container>
  );
};
