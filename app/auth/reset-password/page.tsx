'use client';

import { useState } from 'react';
import {
  PasswordInput,
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
import { useRouter, useSearchParams } from 'next/navigation';

interface ResetPasswordForm {
  password: string;
  passwordConfirmation: string;
  code: string;
}

export default function ResetPasswordPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const code = searchParams.get('code');

  const form = useForm<ResetPasswordForm>({
    initialValues: {
      password: '',
      passwordConfirmation: '',
      code: code || '',
    },
    validate: {
      password: (val) => (val.length < 6 ? 'Password should be at least 6 characters' : null),
      passwordConfirmation: (val, values) =>
        val !== values.password ? 'Passwords do not match' : null,
    },
  });

  // Redirect if no code is present
  if (!code) {
    router.push('/auth/forgot-password');
    return null;
  }

  const handleSubmit = async (values: ResetPasswordForm) => {
    setLoading(true);
    try {
      const response = await fetch('/api/markket?path=/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: values.code,
          password: values.password,
          passwordConfirmation: values.passwordConfirmation,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to reset password');
      }

      notifications.show({
        title: 'Success!',
        message: 'Your password has been reset successfully',
        color: 'green',
        icon: <IconCheck size="1.1rem" />,
        autoClose: 5000,
      });

      // Redirect to login after successful reset
      setTimeout(() => router.push('/dashboard'), 1000);
    } catch (error: any) {
      notifications.show({
        title: 'Error',
        message: error.message || 'Something went wrong. Please try again.',
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
        Create new password
      </Title>
      <Text c="dimmed" size="sm" ta="center" mt={5}>
        Please enter your new password
      </Text>

      <Paper withBorder shadow="md" p={30} mt={30} radius="md">
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack>
            <PasswordInput
              label="New Password"
              placeholder="Your new password"
              required
              {...form.getInputProps('password')}
            />

            <PasswordInput
              label="Confirm Password"
              placeholder="Confirm your new password"
              required
              {...form.getInputProps('passwordConfirmation')}
            />

            <Button loading={loading} type="submit" fullWidth>
              Reset Password
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
