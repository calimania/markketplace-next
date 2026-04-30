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
  ThemeIcon,
} from '@mantine/core';
import { IconBuildingStore, IconUserCircle, IconPlus, IconCamera, IconPencil, IconSparkles, IconChevronRight, IconEye, IconEyeOff } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { useAuth } from '@/app/providers/auth.provider';
import { markketClient, strapiClient } from '@/markket/api';

/**
 * Dashboard home for logged in users
 *
 * @returns
 */
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
  const previewStores = [...stores].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).slice(0, 2);

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
    // Wait for auth provider to finish its initial fetch before deciding to redirect.
    if (isLoading) return;

    if (!confirmed()) {
      router.replace('/auth');
      return;
    }

    fetchStores({ force: true });
  }, [confirmed, fetchStores, isLoading, router]);

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
      <Group justify="space-between" align="end" mb="xl" wrap="wrap" gap="sm">
        <Stack gap={6}>
          <Group gap="xs" wrap="wrap">
            <ThemeIcon radius="xl" size={34} variant="light" color="pink">
              <IconUserCircle size={20} />
            </ThemeIcon>
            <Title order={1}>Me</Title>
            <Badge variant="light" radius="xl" color="pink">Workspace</Badge>
          </Group>
          <Text c="dimmed" maw={560}>
            Tienda backend
            <br />
            <span className="accent-blue-note">Content & Settings</span>
          </Text>
        </Stack>

        <Group>
          <Button variant="light" component={Link} href="/me/account" radius="xl" color="pink">
            Account
          </Button>
        </Group>
      </Group>

      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
        <Paper withBorder p="lg" radius="xl" className="me-card me-card-enter" style={{ background: 'linear-gradient(180deg, #fff 0%, #fffafc 100%)' }}>
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
                <Group justify="space-between" align="flex-start" mb="md" wrap="nowrap">
                  <div>
                    <Group gap="xs" mb={4} wrap="wrap">
                      <Title order={3}>Profile</Title>
                      <Badge variant="light" radius="xl" color="grape">You</Badge>
                    </Group>
                    <Text mt="xs" c="dimmed">
                      {isEditingProfile
                        ? (!displayName ? 'Welcome! Fill in your name and a short bio to get started.' : 'Editing mode. Save when done.')
                        : 'Update your name, bio, and avatar.'}
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
                        color="pink"
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

        <Paper withBorder p="lg" radius="xl" className="me-card me-card-enter" style={{ minHeight: 360, background: 'linear-gradient(180deg, #ffffff 0%, #f8fdff 100%)' }}>
          <Group justify="space-between" align="flex-start" mb="sm" wrap="nowrap">
            <Stack gap={2} style={{ minWidth: 0 }}>
              <Group gap="xs" align="center" wrap="wrap">
                <ThemeIcon radius="xl" size={30} variant="light" color="cyan">
                  <IconSparkles size={16} />
                </ThemeIcon>
                <Title order={3}>
                  <span className="accent-blue">Your</span> Stores
                </Title>
                <Badge variant="light" className="me-store-count">{stores.length}</Badge>
              </Group>
              <Text mt="xs" c="dimmed">Preview and edit</Text>
            </Stack>
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
              <>
                <Button
                  component={Link}
                  href="/me/store/new"
                  leftSection={<IconPlus size={16} />}
                  radius="xl"
                  color="pink"
                >
                  Create Your First Store
                </Button>
              <Text c="dimmed">No stores yet. Start one here and shape the public page later.</Text>
              </>
            )}
            {!isLoading && previewStores.map((store, index) => {
              const storeKey = `${store.documentId || store.slug || store.id || 'store'}-${index}`;
              const isPublished = String((store as { status?: string }).status || '').toLowerCase() === 'published'
                || (String((store as { status?: string }).status || '').toLowerCase() !== 'draft' && Boolean(store.publishedAt));

              return (
                <Link
                  key={storeKey}
                  href={`/tienda/${store.slug}`}
                  className="store-tile-link"
                  aria-label={`Open studio for ${store.title || store.slug} (${isPublished ? 'Visible' : 'Hidden'})`}
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
                  <Paper
                    withBorder
                    p="sm"
                    radius="xs"
                    className="me-store-card store-tile-card"
                  >
                    <Group justify="space-between" align="center" wrap="nowrap">
                      <div style={{ minWidth: 0 }}>
                        <Group gap="xs" align="center" wrap="wrap" mb={2}>
                          <Text fw={700}>{store.title}</Text>
                          <Badge
                            variant="light"
                            color={isPublished ? 'green' : 'gray'}
                            title={isPublished ? 'Visible store' : 'Hidden draft store'}
                          >
                            <Group gap={4} wrap="nowrap">
                              {isPublished ? <IconEye size={12} /> : <IconEyeOff size={12} />}
                            </Group>
                          </Badge>
                        </Group>
                        <Text
                          size="sm"
                          c="dimmed"
                          style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, monospace' }}
                        >
                          /{store.slug}
                        </Text>
                      </div>
                      <Group
                        gap={6}
                        wrap="nowrap"
                        className="store-tile-cta"
                        style={{
                          border: '1px solid rgba(0, 188, 212, 0.35)',
                          color: '#00BCD4',
                          background: '#fff',
                          borderRadius: 10,
                          padding: '6px 12px',
                          flexShrink: 0,
                        }}
                        aria-hidden="true"
                      >
                        <Text size="xs" fw={700}>Open</Text>
                        <IconChevronRight size={14} />
                      </Group>
                    </Group>
                  </Paper>
                </Link>
              );
            })}
            {(stores.length > 2) && (
              <Button
                variant="light"
                component={Link}
                href="/tienda"
                leftSection={<IconBuildingStore size={16} />}
                radius="xl"
                color="grape"
              >
                See All Stores
              </Button>
            )}
          </Stack>
        </Paper>
      </SimpleGrid>
    </Container>
  );
}
