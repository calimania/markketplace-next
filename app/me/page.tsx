'use client';

import { useEffect, useRef, useState } from 'react';
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
  Skeleton,
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
  const [profileLoaded, setProfileLoaded] = useState(false);
  const storesRetryCountRef = useRef(0);
  const previewStores = stores.slice(0, 2);

  useEffect(() => {
    if (isLoading) return;
    const name = user?.displayName || user?.username || '';
    const userBio = user?.bio || '';
    setDisplayName(name);
    setBio(userBio);
    setProfileLoaded(true);
    // auto-open edit mode for new users with no profile info
    if (!name && !userBio) {
      setIsEditingProfile(true);
    }
  }, [user?.displayName, user?.username, user?.bio, isLoading]);

  useEffect(() => {
    if (!confirmed()) {
      router.replace('/auth');
      return;
    }

    fetchStores({ force: true });
  }, [confirmed, fetchStores, router]);

  useEffect(() => {
    if (!confirmed() || isLoading) return;
    if (stores.length > 0) {
      storesRetryCountRef.current = 0;
      return;
    }

    if (storesRetryCountRef.current >= 2) return;

    const timer = window.setTimeout(() => {
      storesRetryCountRef.current += 1;
      fetchStores({ force: true });
    }, 1200);

    return () => window.clearTimeout(timer);
  }, [confirmed, fetchStores, isLoading, stores.length]);

  const onSaveQuickProfile = async () => {
    if (!user?.id) return;

    const normalizedDisplayName = displayName.trim();
    const normalizedBio = bio.trim();

    setIsSaving(true);
    try {
      const markket = new markketClient();
      const response = await markket.put('/api/markket/user', {
        body: {
          id: user.id,
          username: user.username,
          email: user.email,
          displayName: normalizedDisplayName,
          bio: normalizedBio,
        },
      });

      if (response?.error) {
        throw new Error(response?.data || response.error);
      }

      await refreshUser();
      setDisplayName(normalizedDisplayName);
      setBio(normalizedBio);
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
    <Container size="lg" py={{ base: 'md', md: 'xl' }} className="me-surface">
      <Group justify="space-between" align="end" mb="xl">
        <Stack gap={2}>
          <Group gap="xs">
            <IconUserCircle size={28} />
            <Title order={1}>Me</Title>
          </Group>
          <Text c="dimmed">Quick profile edits and fast access to your stores.<br /><span className="accent-blue-note">Everything you manage lives here.</span></Text>
        </Stack>

        <Group>
          <Button variant="default" component={Link} href="/me/account" radius="xl">
            Account Tabs
          </Button>
        </Group>
      </Group>

      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
        <Paper withBorder p="lg" radius="md" className="me-card me-card-enter">
          {(isLoading || !profileLoaded) ? (
            <Stack gap="md">
              <Group justify="space-between" align="flex-start">
                <Stack gap="xs" style={{ flex: 1 }}>
                  <Skeleton height={22} width={80} radius="sm" />
                  <Skeleton height={16} width={200} radius="sm" />
                </Stack>
                <Skeleton height={72} width={72} radius="xl" />
              </Group>
              <Skeleton height={16} width={120} radius="sm" />
              <Skeleton height={20} width={180} radius="sm" />
              <Skeleton height={16} width={100} radius="sm" />
              <Skeleton height={20} width={160} radius="sm" />
              <Skeleton height={16} width={80} radius="sm" />
              <Skeleton height={40} width={160} radius="sm" />
            </Stack>
          ) : (
            <>
          <Group justify="space-between" align="flex-start" mb="md">
            <div>
              <Title order={3}>Profile</Title>
              <Text mt="xs" c="dimmed">
                      {isEditingProfile
                        ? (!displayName ? 'Welcome! Fill in your name and a short bio to get started.' : 'Editing mode. Save when done.')
                        : 'Tap edit to update name, bio, and avatar.'}
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
                <Button
                  leftSection={<IconPencil size={15} />}
                  onClick={() => setIsEditingProfile(true)}
                  radius="xl"
                >
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
                        {(!(!displayName && !bio)) && (
                          <Button variant="default" onClick={() => setIsEditingProfile(false)} radius="xl">
                            Cancel
                          </Button>
                        )}
                <Button onClick={onSaveQuickProfile} loading={isSaving} radius="xl">
                  Save Profile
                </Button>
              </Group>
            </Stack>
          )}
            </>
          )}
        </Paper>

        <Paper withBorder p="lg" radius="md" className="me-card me-card-enter" style={{ minHeight: 360 }}>
          <Group justify="space-between" align="flex-start" mb="sm" wrap="nowrap">
            <Stack gap={2} style={{ minWidth: 0 }}>
              <Group gap="xs" align="center" wrap="wrap">
                <Title order={3}>
                  <span className="accent-blue">Your</span> Stores
                </Title>
                <Badge variant="light" className="me-store-count">{stores.length}</Badge>
              </Group>
              <Text mt="xs" c="dimmed">Click to manage. Create store to add more.</Text>
            </Stack>

            <Button
              component={Link}
              href="/me/store/new"
              leftSection={<IconPlus size={16} />}
              radius="xl"
            >
              Create Store
            </Button>
          </Group>

          <Divider mb="sm" />

          <Stack>
            {isLoading && (
              <Stack gap="xs" className="me-loading-enter">
                <Skeleton height={58} radius="md" />
                <Skeleton height={58} radius="md" />
                <Text size="sm" c="dimmed">Loading stores...</Text>
              </Stack>
            )}
            {!isLoading && stores.length === 0 && (
              <Text c="dimmed">No stores yet. Hit Create Store to launch your first one.</Text>
            )}
            {!isLoading && previewStores.map((store, index) => {
              const storeKey = `${store.documentId || store.slug || store.id || 'store'}-${index}`;

              return (
                <Paper key={storeKey} withBorder p="sm" radius="sm" className="me-store-card">
                  <Group justify="space-between" align="center">
                    <div>
                      <Text fw={700}>{store.title}</Text>
                      <Text size="sm" c="dimmed">/{store.slug}</Text>
                    </div>
                    <Button
                      size="xs"
                      component={Link}
                      href={`/tienda/${store.slug}`}
                      radius="xl"
                    >
                      Open
                    </Button>
                  </Group>
                </Paper>
              );
            })}

            <Button
              variant="default"
              component={Link}
              href="/tienda"
              leftSection={<IconBuildingStore size={16} />}
              radius="xl"
            >
              See All Stores
            </Button>
          </Stack>
        </Paper>
      </SimpleGrid>
    </Container>
  );
}
