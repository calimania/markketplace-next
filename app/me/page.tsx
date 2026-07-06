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
  Skeleton,
  ThemeIcon,
} from '@mantine/core';
import { IconBuildingStore, IconPlus, IconCamera, IconPencil, IconSparkles, IconChevronRight, IconEye, IconEyeOff, IconSearch } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { useAuth } from '@/app/providers/auth.provider';
import { markketClient, strapiClient } from '@/markket/api';
import { markketColors } from '@/markket/colors.config';

type StoreStatusShape = {
  status?: string;
  publishedAt?: string | null;
};

function isStorePublished(store: StoreStatusShape) {
  const status = String(store.status || '').toLowerCase();
  if (status === 'published') return true;
  if (status === 'draft') return false;
  return Boolean(store.publishedAt);
}

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
  const [storeSearch, setStoreSearch] = useState('');
  const storeCount = stores.length;
  const publishedCount = stores.filter((store) => isStorePublished(store as StoreStatusShape)).length;
  const previewStores = [...stores]
    .filter((store) => {
      const query = storeSearch.trim().toLowerCase();
      if (!query) return true;
      const title = (store.title || '').toLowerCase();
      const slug = (store.slug || '').toLowerCase();
      return title.includes(query) || slug.includes(query);
    })
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 6);

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
      router.replace('/auth/magic?next=/me');
      return;
    }

    if (stores.length === 0) {
      fetchStores({ force: true }).catch((error) => {
        console.error('Failed to load stores:', error);
      });
    }
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

  if (!isLoading && !confirmed()) {
    return null;
  }

  return (
    <Container size="lg" py={{ base: 'md', md: 'xl' }} className="me-surface tech-vhs-surface">
      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
        <Paper withBorder p="lg" radius="xl" className="me-card me-card-enter">
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
                      <Title order={3}>Identity</Title>
                      <Badge variant="light" radius="xl" color="grape">Me</Badge>
                    </Group>
                    <Text mt="xs" c="dimmed">
                      {isEditingProfile
                        ? (!displayName ? 'Welcome. Add a name and a short intro to set the tone.' : 'Adjust what you want, then save changes.')
                        : 'Name, bio, and photo'}
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
                      <Text fw={600}>{displayName || 'Add a display name'}</Text>
                    </div>
                    <div>
                      <Text size="sm" c="dimmed">Email</Text>
                      <Text fw={600}>{user?.email || '-'}</Text>
                    </div>
                    <div>
                      <Text size="sm" c="dimmed">Bio</Text>
                      <Text>{bio || 'No bio yet. Add a short hello.'}</Text>
                    </div>
                    <Group justify="flex-end">
                      <Button
                        leftSection={<IconPencil size={15} />}
                        onClick={() => setIsEditingProfile(true)}
                        radius="xl"
                        color="pink"
                      >
                        Edit details
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
                          Save changes
                      </Button>
                    </Group>
                  </Stack>
                )}
            </>
          )}
        </Paper>

        <Paper withBorder p="lg" radius="xl" className="me-card me-card-enter" style={{ minHeight: 360 }}>
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
            </Stack>
          </Group>

          <TextInput
            size="sm"
            placeholder="Search your stores"
            value={storeSearch}
            onChange={(event) => setStoreSearch(event.currentTarget.value)}
            leftSection={<IconSearch size={12} />}
            mb="sm"
          />

          <Divider mb="sm" />

          <Stack>
            {isLoading && (
              <Stack gap="xs" className="me-loading-enter">
                <Skeleton height={58} radius="md" />
                <Skeleton height={58} radius="md" />
                <Text size="sm" c="dimmed">Loading stores...</Text>
              </Stack>
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
                  aria-label={`Enter store ${store.title || store.slug} (${isPublished ? 'Visible' : 'Hidden'})`}
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
                        <Text size="xs" fw={700}>Enter</Text>
                        <IconChevronRight size={14} />
                      </Group>
                    </Group>
                  </Paper>
                </Link>
              );
            })}
            {!isLoading && stores.length > 0 && previewStores.length === 0 && (
              <Text size="sm" c="dimmed">No stores match "{storeSearch.trim()}".</Text>
            )}
            {!isLoading && stores.length < 2 && (
              <>
                <Button
                  component={Link}
                  href="/me/store/new"
                  leftSection={<IconPlus size={16} />}
                  radius="xl"
                  color="pink"
                >
                  Create
                  {stores.length === 0 ? ' Your First ' : ' Another '}
                  Store
                </Button>
              </>
            )}
            {(stores.length >= 2) && (
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
