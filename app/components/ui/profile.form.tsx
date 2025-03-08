'use client';

import { useEffect, useState } from 'react';
import {
  TextInput,
  Button,
  Group,
  Stack,
  Paper,
  Title,
  Text,
  Avatar,
  FileButton,
  ActionIcon,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { showNotification } from '@mantine/notifications';
import { IconUpload, IconTrash, IconUser } from '@tabler/icons-react';
import { useAuth } from '@/app/providers/auth';
import { markketClient } from '@/markket/api.markket';

interface ProfileFormValues {
  username: string;
  email: string;
  bio: string;
  displayName: string;
  avatar?: File | null;
}


export default function ProfileForm() {
  const { user, refreshUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [avatar, setAvatar] = useState<File | null>(null);

  const markket = new markketClient();

  const form = useForm<ProfileFormValues>({
    initialValues: {
      username: user?.username || '',
      email: user?.email || '',
      bio: user?.bio || '',
      displayName: user?.displayName || '',
    },
    validate: {
      username: (value) => (value.length < 3 ? 'Username must be at least 3 characters' : null),
      email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
    },
  });

  useEffect(() => {
    form.setValues({
      username: user?.username || '',
      email: user?.email || '',
      bio: user?.bio || '',
      displayName: user?.displayName || '',
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleSubmit = async (values: ProfileFormValues) => {
    if (!user || !user.id) {
      return;
    }

    setLoading(true);

    try {
      const response = markket.put(`/api/markket/user`, {
        body: {
          id: user?.id,
          ...values,
        },
      });

      // if (!response.ok) {
      //   throw new Error('Failed to update profile');
      // }
      console.log('Profile updated:', response);

      showNotification({
        title: 'Success',
        message: 'Profile updated successfully',
        color: 'green',
        onClose: () => refreshUser()
      });
    } catch (error) {
      console.error('Failed to update profile:', error);
      showNotification({
        title: 'Error',
        message: 'Failed to update profile',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper withBorder p="md" radius="md">
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack>
          <Group justify="space-between" align="center">
            <div>
              <Title order={3}>Profile Settings</Title>
              <Text size="sm" c="dimmed">
                Update your personal information
              </Text>
            </div>
            <Group>
              <Avatar
                src={avatar ? URL.createObjectURL(avatar) : user?.avatar?.url}
                size="xl"
                radius="xl"
              >
                <IconUser size={36} />
              </Avatar>
              <Stack gap="xs">
                <FileButton
                  onChange={setAvatar}
                  accept="image/png,image/jpeg"
                >
                  {(props) => (
                    <Button
                      variant="light"
                      size="xs"
                      leftSection={<IconUpload size={14} />}
                      disabled
                      {...props}
                    >
                      Upload avatar
                    </Button>
                  )}
                </FileButton>
                {avatar && (
                  <ActionIcon
                    variant="subtle"
                    color="red"
                    onClick={() => setAvatar(null)}
                    size="sm"
                  >
                    <IconTrash size={14} />
                  </ActionIcon>
                )}
              </Stack>
            </Group>
          </Group>

          <TextInput
            label="Username"
            placeholder="Your username"
            required
            readOnly
            {...form.getInputProps('username')}
          />

          <TextInput
            label="Email"
            placeholder="your@email.com"
            required
            readOnly
            {...form.getInputProps('email')}
          />

          <TextInput
            label="Display Name"
            placeholder="Darth Plagueis"
            {...form.getInputProps('displayName')}
          />
          <TextInput
            label="Bio"
            placeholder="I've became paranoid as I've grown in power"
            {...form.getInputProps('bio')}
          />

          <Group justify="flex-end">
            <Button
              type="submit"
              loading={loading}
            >
              Update Profile
            </Button>
          </Group>
        </Stack>
      </form>
    </Paper>
  );
};
