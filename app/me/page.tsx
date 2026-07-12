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
  Pagination,
  Loader,
  Center,
} from '@mantine/core';
import { IconBuildingStore, IconPlus, IconCamera, IconPencil, IconSparkles, IconChevronRight, IconEye, IconEyeOff, IconSearch } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { useAuth } from '@/app/providers/auth.provider';
import { markketClient, strapiClient, tiendaClient } from '@/markket/api';
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

type InboxThreadSummary = {
  id?: number | string;
  documentId?: string;
  threadKey?: string;
  subject?: string;
  email?: string;
  from?: string;
  latestMessageAt?: string;
  createdAt?: string;
  updatedAt?: string;
  message?: string;
  body?: string;
  store?: string;
  storeSlug?: string;
  storeTitle?: string;
};

type InboxStoreSummary = {
  id?: number | string;
  documentId?: string;
  label?: string;
  name?: string;
  title?: string;
  slug?: string;
  store?: string;
  unreadThreads?: number;
  totalThreads?: number;
  count?: number;
};

type InboxSummaryResponse = {
  ok?: boolean;
  data?: {
    summary?: {
      unreadThreads?: number;
      totalThreads?: number;
      activeStores?: number;
    };
    stores?: InboxStoreSummary[];
    storesFiltered?: InboxStoreSummary[];
    recentThreads?: InboxThreadSummary[];
    threads?: {
      data?: InboxThreadSummary[];
      pagination?: {
        page?: number;
        pageSize?: number;
        total?: number;
        pages?: number;
      };
      search?: string;
    };
  };
  error?: unknown;
  message?: unknown;
};

function readAuthToken() {
  if (typeof window === 'undefined') return '';

  try {
    const raw = localStorage.getItem('markket.auth');
    const parsed = raw ? JSON.parse(raw) : null;
    return parsed?.jwt || '';
  } catch {
    return '';
  }
}

function normalizeInboxText(value: string | null | undefined) {
  return String(value || '').replace(/\s+/g, ' ').trim();
}

function labelFromUnknown(value: unknown) {
  if (typeof value === 'string') {
    return normalizeInboxText(value);
  }

  if (typeof value === 'number') {
    return String(value);
  }

  if (!value || typeof value !== 'object') {
    return '';
  }

  const record = value as Record<string, unknown>;
  const nestedCandidates = [
    record.label,
    record.title,
    record.name,
    record.slug,
    record.subject,
    record.threadKey,
    record.email,
    record.documentId,
    record.id,
  ];

  for (const candidate of nestedCandidates) {
    const resolved = labelFromUnknown(candidate);
    if (resolved) {
      return resolved;
    }
  }

  return '';
}

function getInboxSummaryError(response: InboxSummaryResponse) {
  if (typeof response?.error === 'string' && response.error.trim()) return response.error;
  if (typeof response?.message === 'string' && response.message.trim()) return response.message;
  return 'Could not load inbox summary.';
}

function resolveInboxThreadTitle(thread: InboxThreadSummary) {
  return labelFromUnknown(thread.subject)
    || labelFromUnknown(thread.threadKey)
    || labelFromUnknown(thread.storeTitle)
    || labelFromUnknown(thread.store)
    || labelFromUnknown(thread.id)
    || 'Untitled thread';
}

function resolveInboxThreadEmail(thread: InboxThreadSummary) {
  return labelFromUnknown(thread.email)
    || labelFromUnknown(thread.from)
    || 'No email';
}

function resolveInboxThreadPreview(thread: InboxThreadSummary) {
  return labelFromUnknown(thread.message)
    || labelFromUnknown(thread.body)
    || 'No preview available';
}

function resolveInboxThreadDate(thread: InboxThreadSummary) {
  const value = thread.latestMessageAt || thread.updatedAt || thread.createdAt;
  if (!value) return '-';

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '-' : date.toLocaleDateString();
}

function resolveInboxThreadKey(thread: InboxThreadSummary) {
  const source = labelFromUnknown(thread.threadKey) || labelFromUnknown(thread.documentId) || labelFromUnknown(thread.id);
  if (!source) return '';

  const segments = source.split('/').filter(Boolean);
  return normalizeInboxText(segments[segments.length - 1] || source);
}

function resolveInboxThreadHref(thread: InboxThreadSummary) {
  const storeSlug = labelFromUnknown(thread.storeSlug);
  const threadKey = resolveInboxThreadKey(thread);

  if (!storeSlug || !threadKey) {
    return '';
  }

  return `/tienda/${encodeURIComponent(storeSlug)}/crm/inbox/${encodeURIComponent(threadKey)}`;
}

function resolveInboxStoreLabel(store: InboxStoreSummary, index: number) {
  return labelFromUnknown(store.label)
    || labelFromUnknown(store.title)
    || labelFromUnknown(store.name)
    || labelFromUnknown(store.store)
    || labelFromUnknown(store.slug)
    || `Store ${index + 1}`;
}

function resolveInboxStoreCount(store: InboxStoreSummary) {
  return Number(store.unreadThreads ?? store.totalThreads ?? store.count ?? 0);
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
  const [inboxTab, setInboxTab] = useState<'inbox' | 'orders'>('inbox');
  const [inboxSummary, setInboxSummary] = useState<InboxSummaryResponse | null>(null);
  const [inboxLoading, setInboxLoading] = useState(false);
  const [inboxError, setInboxError] = useState('');
  const [inboxSearchInput, setInboxSearchInput] = useState('');
  const [inboxSearch, setInboxSearch] = useState('');
  const [inboxPage, setInboxPage] = useState(1);
  const inboxPageSize = 20;
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

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setInboxSearch(normalizeInboxText(inboxSearchInput));
      setInboxPage(1);
    }, 300);

    return () => window.clearTimeout(timer);
  }, [inboxSearchInput]);

  useEffect(() => {
    if (isLoading) return;
    if (!confirmed()) return;

    const token = readAuthToken();
    if (!token) {
      setInboxError('Sign in again to view inbox threads.');
      setInboxSummary(null);
      return;
    }

    let active = true;

    const loadInboxSummary = async () => {
      setInboxLoading(true);
      setInboxError('');

      try {
        const response = (await tiendaClient.fetchInboxSummary({
          token,
          page: inboxPage,
          pageSize: inboxPageSize,
          search: inboxSearch,
        })) as InboxSummaryResponse;

        if (!active) return;

        if (response?.ok === false) {
          throw new Error(getInboxSummaryError(response));
        }

        setInboxSummary(response);
      } catch (error) {
        if (!active) return;

        console.error('Inbox summary load failed:', error);
        setInboxSummary(null);
        setInboxError(error instanceof Error ? error.message : 'Could not load inbox summary.');
      } finally {
        if (active) {
          setInboxLoading(false);
        }
      }
    };

    void loadInboxSummary();

    return () => {
      active = false;
    };
  }, [confirmed, inboxPage, inboxPageSize, inboxSearch, isLoading]);

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

      <Paper withBorder p="md" radius="xl" className="me-card me-card-enter" mt="xl">
        <Stack gap="sm">
          <Group justify="space-between" align="flex-start" gap="sm" wrap="wrap">
            <Stack gap={2} style={{ minWidth: 0 }}>
              <Group gap={8} wrap="wrap">
                <Title order={3}>Inbox</Title>
                <Badge size="sm" variant="light" color="orange">
                  {Number(inboxSummary?.data?.summary?.unreadThreads ?? 0)} unread
                </Badge>
                <Badge size="sm" variant="light" color="gray">
                  {Number(inboxSummary?.data?.threads?.pagination?.total ?? 0)} total
                </Badge>
              </Group>
              <Text c="dimmed" size="sm">
                A quick read on everything coming in across all stores.
              </Text>
            </Stack>

            <Group gap={6} wrap="wrap">
              <Badge variant="light" color="grape">
                {Number(inboxSummary?.data?.summary?.activeStores ?? inboxSummary?.data?.storesFiltered?.length ?? 0)} stores
              </Badge>
              <Badge variant="light" color="cyan">
                page {Number(inboxSummary?.data?.threads?.pagination?.page ?? inboxPage)}
              </Badge>
            </Group>
          </Group>

          <TextInput
            value={inboxSearchInput}
            onChange={(event) => setInboxSearchInput(event.currentTarget.value)}
            placeholder="Search inbox"
            leftSection={<IconSearch size={14} />}
          />

          {inboxError ? (
            <Paper withBorder radius="lg" p="sm">
              <Text size="sm" c="red">{inboxError}</Text>
            </Paper>
          ) : null}

          {inboxLoading ? (
            <Paper withBorder radius="lg" p="md">
              <Center py="lg">
                <Loader size="sm" />
              </Center>
            </Paper>
          ) : (
            <Stack gap="xs">
              {(inboxSummary?.data?.threads?.data || []).map((thread, index) => {
                const key = resolveInboxThreadKey(thread) || thread.documentId || thread.id || index;
                const storeLabel = labelFromUnknown(thread.storeTitle)
                  || labelFromUnknown(thread.storeSlug)
                  || labelFromUnknown(thread.store)
                  || 'All stores';
                const threadHref = resolveInboxThreadHref(thread);

                return (
                  <Paper key={String(key)} withBorder radius="lg" p="sm" style={{ background: 'rgba(255,255,255,0.78)' }}>
                    <Stack gap={4}>
                      <Group justify="space-between" align="center" gap="xs" wrap="nowrap">
                        <Text fw={700} size="sm" lineClamp={1}>{resolveInboxThreadTitle(thread)}</Text>
                        <Text size="xs" c="dimmed">{resolveInboxThreadDate(thread)}</Text>
                      </Group>
                      <Group gap={6} wrap="wrap">
                        <Badge size="xs" variant="light" color="gray">{resolveInboxThreadEmail(thread)}</Badge>
                        <Badge size="xs" variant="light" color="teal">{storeLabel}</Badge>
                        {threadHref ? (
                          <Badge component={Link} href={threadHref} size="xs" variant="light" color="orange">
                            Open thread
                          </Badge>
                        ) : null}
                      </Group>
                      <Text size="sm" c="dimmed" lineClamp={2}>{resolveInboxThreadPreview(thread)}</Text>
                    </Stack>
                  </Paper>
                );
              })}

              {!(inboxSummary?.data?.threads?.data || []).length && (
                  <Text size="sm" c="dimmed">
                    No inbox yet.
                  </Text>
              )}
            </Stack>
          )}

          {!!(inboxSummary?.data?.threads?.pagination?.pages || 0) && Number(inboxSummary?.data?.threads?.pagination?.pages ?? 0) > 1 ? (
            <Group justify="space-between" align="center" wrap="wrap">
              <Text size="sm" c="dimmed">
                {Number(inboxSummary?.data?.threads?.pagination?.total ?? 0)} threads total
              </Text>
              <Pagination
                value={Number(inboxSummary?.data?.threads?.pagination?.page ?? inboxPage)}
                onChange={setInboxPage}
                total={Number(inboxSummary?.data?.threads?.pagination?.pages ?? 1)}
                size="sm"
              />
            </Group>
          ) : null}

          {(inboxSummary?.data?.threads?.data || []).length > 0 ? (
            <Paper withBorder radius="lg" p="sm" bg={markketColors.sections.about.light}>
              <Group justify="space-between" align="center" gap="sm" wrap="wrap">
                <Text size="sm" fw={600}>Stores in view</Text>
                <Group gap={6} wrap="wrap">
                  {(inboxSummary?.data?.storesFiltered || []).slice(0, 6).map((store, index) => (
                    <Badge key={`${resolveInboxStoreLabel(store, index)}-${index}`} size="xs" variant="light" color="teal">
                      {resolveInboxStoreLabel(store, index)}
                    </Badge>
                  ))}
                </Group>
              </Group>
            </Paper>
          ) : null}
        </Stack>
      </Paper>
    </Container>
  );
}
