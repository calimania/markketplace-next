'use client';

import {
  TextInput, Textarea, Paper, Title, Text, Stack,
  Button, Group, Avatar, FileButton, LoadingOverlay
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useAuth } from '@/app/providers/auth';
import { notifications } from '@mantine/notifications';
import { IconCheck, IconX, IconUpload } from '@tabler/icons-react';
import { strapiClient } from '@/markket/api';
import { useState } from 'react';

interface ProfileForm {
  username: string;
  email: string;
  bio: string;
  displayName: string;
  avatar?: File;
}

export default function ProfileSettings() {
  const { user, refreshUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(
    user?.avatar?.url || null
  );

  const form = useForm<ProfileForm>({
    initialValues: {
      username: user?.username || '',
      email: user?.email || '',
      bio: user?.bio || '',
      displayName: user?.displayName || '',
    },
    validate: {
      email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
      username: (value) => {
        if (!value) return 'Username is required';
        if (value.length < 3) return 'Username must be at least 3 characters';
        if (!/^[a-zA-Z0-9_-]+$/.test(value)) return 'Username can only contain letters, numbers, - and _';
        return null;
      },
      displayName: (value) => {
        if (!value) return 'Display name is required';
        if (value.length < 2) return 'Display name must be at least 2 characters';
        return null;
      },
      bio: (value) => (value?.length > 500 ? 'Bio must be less than 500 characters' : null),
    },
  });

  const handleAvatarChange = (file: File | null) => {
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setAvatarPreview(objectUrl);
      form.setFieldValue('avatar', file);
    }
  };

  const handleSubmit = async (values: ProfileForm) => {
    try {
      setIsLoading(true);
      const formData = new FormData();

      Object.entries(values).forEach(([key, value]) => {
        if (key !== 'avatar' && value) {
          formData.append(key, value);
        }
      });

      if (values.avatar) {
        formData.append('files.avatar', values.avatar);
      }

      await strapiClient.updateProfile(formData);
      await refreshUser();

      notifications.show({
        title: '✨ Profile updated',
        message: 'Your changes have been saved successfully',
        color: 'teal',
        icon: <IconCheck size="1.1rem" />,
      });
    } catch (error) {
      console.error('Profile update failed:', error);
      notifications.show({
        title: 'Update failed',
        message: 'Something went wrong. Please try again.',
        color: 'red',
        icon: <IconX size="1.1rem" />,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Paper p="xl" radius="md" withBorder pos="relative">
      <LoadingOverlay visible={isLoading} overlayProps={{ blur: 2 }} />

      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="lg">
          <Stack gap="xs">
            <Title order={2}>Profile Settings</Title>
            <Text c="dimmed" size="sm">
              Customize how others see you on Markket
            </Text>
          </Stack>

          <Group align="flex-start">
            <Stack gap="xs">
              <Avatar
                size={120}
                radius="md"
                src={avatarPreview}
                alt={form.values.displayName}
            />
              <FileButton
                onChange={handleAvatarChange}
                accept="image/png,image/jpeg,image/gif,image/webp"
              >
                {(props) => (
                  <Button
                    variant="light"
                    disabled
                    size="xs"
                    leftSection={<IconUpload size={14} />}
                    {...props}
                  >
                    Change Avatar
                  </Button>
                )}
              </FileButton>
            </Stack>

            <Stack gap="md" style={{ flex: 1 }}>
              <TextInput
                label="Display Name"
                placeholder="How should we call you?"
                {...form.getInputProps('displayName')}
              />

              <TextInput
                label="Username"
                placeholder="your-username"
                {...form.getInputProps('username')}
              />
            </Stack>
          </Group>

          <TextInput
            label="Email"
            placeholder="you@example.com"
            {...form.getInputProps('email')}
          />

          <Textarea
            label="Bio"
            placeholder="Tell us about yourself..."
            minRows={3}
            maxLength={500}
            {...form.getInputProps('bio')}
            description={`${form.values.bio?.length || 0}/500 characters`}
          />

          <Button
            type="submit"
            disabled={!form.isDirty()}
            loading={isLoading}
          >
            Save Changes
          </Button>
        </Stack>
      </form>
    </Paper>
  );
}