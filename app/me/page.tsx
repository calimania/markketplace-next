'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Container,
  Title,
  Text,
  SimpleGrid,
  Paper,
  Group,
  Button,
  Badge,
  Stack,
  Avatar,
  TextInput,
  Textarea,
  Divider,
} from '@mantine/core';
import { IconBuildingStore, IconPlus, IconUserCircle, IconCamera, IconPencil } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { useAuth } from '@/app/providers/auth.provider';
import { markketClient, strapiClient } from '@/markket/api';

export default function MeHomePage() {
  const router = useRouter();
  const { confirmed, stores, fetchStores, isLoading, user, refreshUser } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  useEffect(() => {
    setDisplayName(user?.displayName || user?.username || '');
    setBio(user?.bio || '');
  }, [user?.displayName, user?.username, user?.bio]);

  useEffect(() => {
    if (!confirmed()) {
      router.replace('/auth');
      return;
    }

    fetchStores();
  }, [confirmed, fetchStores, router]);

  const onSaveQuickProfile = async () => {
    if (!user?.id) return;

    setIsSaving(true);
    try {
      const markket = new markketClient();
      const response = await markket.put('/api/markket/user', {
        body: {
          id: user.id,
          username: user.username,
          email: user.email,
          displayName,
          bio,
        },
      });

      if (response?.error) {
        throw new Error(response?.data || response.error);
      }

      await refreshUser();
      setIsEditingProfile(false);
      notifications.show({
        title: 'Saved',
        message: 'Profile updated.',
        color: 'green',
      });
    } catch (error) {
      console.error('Profile save failed:', error);
      const message = error instanceof Error ? error.message : 'Could not save profile.';
      notifications.show({
        title: 'Error',
        message,
        color: 'red',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const onUploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user?.id) return;

    setIsUploading(true);
    try {
      const response = await strapiClient.uploadAvatar(file, { id: user.id });

      if (response?.ok || response?.status === 201) {
        await refreshUser();
        notifications.show({
          title: 'Avatar updated',
          message: 'Your profile picture was uploaded.',
          color: 'green',
        });
      } else {
        notifications.show({
          title: 'Upload failed',
          message: 'Could not upload avatar.',
          color: 'red',
        });
      }
    } catch (error) {
      console.error('Avatar upload failed:', error);
      const message = error instanceof Error ? error.message : 'Could not upload avatar.';
      notifications.show({
        title: 'Upload failed',
        message,
        color: 'red',
      });
    } finally {
      setIsUploading(false);
      event.target.value = '';
    }
  };

  return (
    <Container size="lg" py="xl">
      <Group justify="space-between" align="end" mb="lg">
        <Stack gap={2}>
          <Group gap="xs">
            <IconUserCircle size={28} />
            <Title order={1}>Me</Title>
          </Group>
          <Text c="dimmed">Quick profile edits and fast access to your stores.<br /><span className="accent-hint">Everything you manage lives here.</span></Text>
        </Stack>

        <Group>
          <Button variant="default" component={Link} href="/me/account">
            Account Tabs
          </Button>
        </Group>
      </Group>

      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
        <Paper withBorder p="lg" radius="md">
          <Group justify="space-between" align="flex-start" mb="md">
            <div>
              <Title order={3}>Profile</Title>
              <Text mt="xs" c="dimmed">
                {isEditingProfile ? 'Editing mode. Save when done.' : 'Tap edit to update name, bio, and avatar.'}
              </Text>
            </div>
            <div style={{ position: 'relative' }}>
              <Avatar src={user?.avatar?.url} size={72} radius="xl">
                {(user?.displayName || user?.username || 'M').charAt(0).toUpperCase()}
              </Avatar>
              {isEditingProfile && (
                <label
                  htmlFor="me-avatar-upload"
                  style={{
                    position: 'absolute',
                    right: -6,
                    bottom: -6,
                    width: 28,
                    height: 28,
                    borderRadius: '999px',
                    background: '#0ea5e9',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: isUploading ? 'wait' : 'pointer',
                  }}
                >
                  <IconCamera size={14} />
                </label>
              )}
              <input
                id="me-avatar-upload"
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={onUploadAvatar}
                disabled={isUploading || !isEditingProfile}
                style={{ display: 'none' }}
              />
            </div>
          </Group>

          {!isEditingProfile ? (
            <Stack gap="sm">
              <div>
                <Text size="sm" c="dimmed">Display name</Text>
                <Text fw={600}>{displayName || 'No display name yet'}</Text>
              </div>
              <div>
                <Text size="sm" c="dimmed">Email</Text>
                <Text fw={600}>{user?.email || '-'}</Text>
              </div>
              <div>
                <Text size="sm" c="dimmed">Bio</Text>
                <Text>{bio || 'No bio yet. Add a short intro.'}</Text>
              </div>
              <Group justify="flex-end">
                <Button leftSection={<IconPencil size={15} />} onClick={() => setIsEditingProfile(true)}>
                  Edit Profile
                </Button>
              </Group>
            </Stack>
          ) : (
            <Stack>
              <TextInput
                label="Email"
                value={user?.email || ''}
                readOnly
              />
              <TextInput
                label="Display name"
                value={displayName}
                onChange={(event) => setDisplayName(event.currentTarget.value)}
              />
              <Textarea
                label="Bio"
                minRows={3}
                value={bio}
                onChange={(event) => setBio(event.currentTarget.value)}
              />
              <Group justify="flex-end">
                <Button variant="default" onClick={() => setIsEditingProfile(false)}>
                  Cancel
                </Button>
                <Button onClick={onSaveQuickProfile} loading={isSaving}>
                  Save Profile
                </Button>
              </Group>
            </Stack>
          )}
        </Paper>

        <Paper withBorder p="lg" radius="md" style={{ position: 'relative', minHeight: 360 }}>
          <Button
            component={Link}
            href="/me/store/new"
            leftSection={<IconPlus size={16} />}
            style={{ position: 'absolute', right: 16, top: 16 }}
          >
            Create Store
          </Button>

          <Group justify="space-between" align="end" mb="sm" style={{ paddingRight: 124 }}>
            <div>
              <Title order={3}>
                <span className="accent-yellow">Your</span> Stores
              </Title>
              <Text mt="xs" c="dimmed">Click to manage. Create store to add more.</Text>
            </div>
            <Badge variant="light">{stores.length}</Badge>
          </Group>

          <Divider mb="sm" />

          <Stack>
            {isLoading && <Text c="dimmed">Loading stores...</Text>}
            {!isLoading && stores.length === 0 && (
              <Text c="dimmed">No stores yet. Hit Create Store to launch your first one.</Text>
            )}
            {!isLoading && stores.slice(0, 2).map((store) => (
              <Paper key={store.documentId} withBorder p="sm" radius="sm">
                <Group justify="space-between" align="center">
                  <div>
                    <Text fw={700}>{store.title}</Text>
                    <Text size="sm" c="dimmed">/{store.slug}</Text>
                  </div>
                  <Button
                    size="xs"
                    component={Link}
                    href={`/tienda/${store.slug}`}
                  >
                    Open
                  </Button>
                </Group>
              </Paper>
            ))}

            <Button
              variant="default"
              component={Link}
              href="/tienda"
              leftSection={<IconBuildingStore size={16} />}
            >
              See All Stores
            </Button>
          </Stack>
        </Paper>
      </SimpleGrid>
    </Container>
  );
}
