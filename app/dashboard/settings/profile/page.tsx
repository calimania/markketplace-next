'use client';

import {
  TextInput,
  Textarea,
  Paper,
  Title,
  Text,
  Stack,
  Button,
  Group,
  Avatar,
  FileButton,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useAuth } from '@/app/providers/auth';
import { notifications } from '@mantine/notifications';
import { IconCheck, IconX } from '@tabler/icons-react';
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
  });

  const handleAvatarChange = (file: File | null) => {
    if (file) {
      // Create preview
      const objectUrl = URL.createObjectURL(file);
      setAvatarPreview(objectUrl);
      form.setFieldValue('avatar', file);
    }
  };

  const handleSubmit = async (values: ProfileForm) => {
    console.log('values:', values);
    strapiClient.me();
    // try {
    //   const formData = new FormData();

    //   // Append text fields
    //   formData.append('username', values.username);
    //   formData.append('email', values.email);
    //   formData.append('bio', values.bio);
    //   formData.append('displayName', values.displayName);

    //   // Append avatar if changed
    //   if (values.avatar) {
    //     formData.append('files.avatar', values.avatar);
    //   }

    //   // await strapiClient.updateUserProfile(user!.id, formData);
    //   // await refreshUser(); // Refresh user data in context

    //   notifications.show({
    //     title: 'Profile updated',
    //     message: 'Your profile has been successfully updated',
    //     color: 'green',
    //     icon: <IconCheck size="1.1rem" />,
    //   });
    // } catch (error) {
    //   console.error('Failed to update profile:', error);
    //   notifications.show({
    //     title: 'Update failed',
    //     message: 'Failed to update profile. Please try again.',
    //     color: 'red',
    //     icon: <IconX size="1.1rem" />,
    //   });
    // }
  };

  return (
    <Paper p="xl" radius="md" withBorder>
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="lg">
          <div>
            <Title order={2}>Profile Settings</Title>
            <Text c="dimmed" size="sm">
              Manage your personal information
            </Text>
          </div>

          <Group align="flex-start">
            <Avatar
              size={100}
              radius="md"
              src={avatarPreview}
            />
            <FileButton
              onChange={handleAvatarChange}
              accept="image/png,image/jpeg,image/gif"
            >
              {(props) => (
                <Button variant="light" size="sm" {...props}>
                  Change Avatar
                </Button>
              )}
            </FileButton>
          </Group>

          <TextInput
            label="Display Name"
            placeholder="How should we call you?"
            {...form.getInputProps('displayName')}
          />

          <TextInput
            label="Username"
            placeholder="Your username"
            {...form.getInputProps('username')}
          />

          <TextInput
            label="Email"
            placeholder="your@email.com"
            {...form.getInputProps('email')}
          />

          <Textarea
            label="Bio"
            placeholder="Tell us about yourself"
            minRows={3}
            maxLength={500}
            {...form.getInputProps('bio')}
          />

          <Button type="submit">
            Save Changes
          </Button>
        </Stack>
      </form>
    </Paper>
  );
};
