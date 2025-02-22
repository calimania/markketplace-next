

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
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useAuth } from '@/app/providers/auth';
import { notifications } from '@mantine/notifications';
import { IconCheck } from '@tabler/icons-react';

interface ProfileForm {
  username: string;
  email: string;
  bio: string;
  avatar?: File;
}

export default function ProfileSettings() {
  const { user } = useAuth();

  const form = useForm<ProfileForm>({
    initialValues: {
      username: user?.username || '',
      email: user?.email || '',
      bio: '',
    },
  });

  const handleSubmit = async (values: ProfileForm) => {
    console.log('Form values:', values);

    try {
      // Add your update profile API call here
      notifications.show({
        title: 'Profile updated',
        message: 'Your profile has been successfully updated',
        color: 'green',
        icon: <IconCheck size="1.1rem" />,
      });
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
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
              src={null}
            />
            <Button variant="light" size="sm">
              Change Avatar
            </Button>
          </Group>

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
