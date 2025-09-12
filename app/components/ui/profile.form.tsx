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
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { showNotification } from '@mantine/notifications';
import { IconUpload, IconUser, IconCameraBolt } from '@tabler/icons-react';
import { useAuth } from '@/app/providers/auth.provider';
import { strapiClient, markketClient } from '@/markket/api';
import ImageModal from '@/markket/components/image.modal';

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
  const [imageModalOpen, setImageModalOpen] = useState(false);

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

  const handleAvatarUpload = async (file: File) => {
    if (!user?.id) return;
    if (!file) return;

    try {
      setLoading(true);
      const response = await strapiClient.uploadAvatar(file, { id: user.id });

      if (response.status === 201) {
        showNotification({
          title: 'Success',
          message: 'Avatar uploaded successfully',
          color: 'green',
        });
      } else {
        console.warn('Avatar upload failed:', response);
      }

      await refreshUser();
    } catch (error) {
      console.error('Avatar upload failed:', error);

      showNotification({
        title: 'Error',
        message: 'Failed to upload avatar',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  // Handler for modal image upload
  const handleModalImageReplace = ({ img }: { url: string; alt: string; img?: File }) => {
    if (img) {
      setAvatar(img);
      handleAvatarUpload(img);
      setImageModalOpen(false);
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
                  onChange={(file) => {
                    if (file) {
                      setAvatar(file);
                      handleAvatarUpload(file);
                    }
                  }}
                  accept="image/png,image/jpeg"
                >
                  {({ onClick }) => (
                    <Button
                      disabled
                      variant="light"
                      size="xs"
                      leftSection={<IconUpload size={16} />}
                      onClick={onClick}
                      tabIndex={0}
                    >
                      Upload Picture
                    </Button>
                  )}
                </FileButton>
                <Button
                  variant="outline"
                  size="xs"
                  color="fuchsia"
                  onClick={() => setImageModalOpen(true)}
                >
                  <IconCameraBolt size={18} />Image Modal
                </Button>
                <ImageModal
                  imageModalOpen={imageModalOpen}
                  handleCloseModal={() => setImageModalOpen(false)}
                  imageUrl={user?.avatar?.url || ''}
                  imageAlt={user?.displayName || user?.username || ''}
                  maxWidth={760}
                  mode="replace"
                  onReplace={handleModalImageReplace}
                />
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
