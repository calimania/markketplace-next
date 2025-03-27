import { useState } from 'react';
import { IconKey, IconCheck, IconX } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { useAuth } from '@/app/providers/auth.provider';
import { useForm } from '@mantine/form';
import {
  PasswordInput,
  Paper,
  Title,
  Text,
  Stack,
  Button,
  Group,
  Divider,
  rem,
} from '@mantine/core';
import { markketConfig } from '@/markket/config';

const SecuritySettings = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const form = useForm({
    initialValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
    validate: {
      currentPassword: (value) => (value.length < 6 ? 'Password must be at least 6 characters' : null),
      newPassword: (value) => {
        if (value.length < 6) return 'Password must be at least 6 characters';
        if (!/\d/.test(value)) return 'Password must include at least one number';
        if (!/[a-z]/.test(value)) return 'Password must include at least one lowercase letter';
        if (!/[A-Z]/.test(value)) return 'Password must include at least one uppercase letter';
        return null;
      },
      confirmPassword: (value, values) =>
        value !== values.newPassword ? 'Passwords do not match' : null,
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    setLoading(true);
    try {
      const response = await fetch(new URL('/api/auth/change-password', markketConfig.api), {
        method: 'POST',
        body: JSON.stringify({
          currentPassword: values.currentPassword,
          password: values.newPassword,
          passwordConfirmation: values.confirmPassword,
        }),
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.jwt}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to change password');
      }

      notifications.show({
        title: 'Success',
        message: 'Your password has been updated successfully',
        color: 'green',
        icon: <IconCheck size={16} />,
      });
      form.reset();
    } catch (error) {
      console.error('Error updating password:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to update password. Please try again.',
        color: 'red',
        icon: <IconX size={16} />,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper radius="md" p="xl" withBorder>
      <Title order={2} size="h3" mb="md">
        Security Settings
      </Title>
      <Text c="dimmed" size="sm" mb="xl">
        Change your password to keep your account secure
      </Text>

      <Divider mb="xl" />

      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack>
          <PasswordInput
            label="Current Password"
            placeholder="Enter your current password"
            leftSection={<IconKey size={16} />}
            required
            {...form.getInputProps('currentPassword')}
          />

          <PasswordInput
            label="New Password"
            placeholder="Enter your new password"
            leftSection={<IconKey size={16} />}
            required
            {...form.getInputProps('newPassword')}
          />

          <PasswordInput
            label="Confirm New Password"
            placeholder="Confirm your new password"
            leftSection={<IconKey size={16} />}
            required
            {...form.getInputProps('confirmPassword')}
          />

          <Text size="xs" c="dimmed">
            Password must contain at least:
          </Text>
          <div className="dimmed" style={{ fontSize: rem(12) }}>
            <ul style={{ marginTop: rem(4), marginBottom: 0 }}>
              <li>6 characters</li>
              <li>One uppercase letter</li>
              <li>One lowercase letter</li>
              <li>One number</li>
            </ul>
          </div>

          <Group justify="flex-end" mt="md">
            <Button
              type="submit"
              loading={loading}
            >
              {loading ? 'Updating...' : 'Update Password'}
            </Button>
          </Group>
        </Stack>
      </form>
    </Paper>
  );
};

export default SecuritySettings;
