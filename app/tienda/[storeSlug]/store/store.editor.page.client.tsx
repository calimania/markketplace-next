'use client';

import { useEffect, useMemo, useState } from 'react';
import { Badge, Group, Paper, Skeleton, Stack, Text, Title } from '@mantine/core';
import { useAuth } from '@/app/providers/auth.provider';
import { strapiClient } from '@/markket/api.strapi';
import type { Store } from '@/markket/store';
import StoreEditorSkeleton from './store.editor.skeleton';
import { richTextToHtml } from '@/markket/richtext.utils';
import TinyBreadcrumbs from '@/app/components/ui/tiny.breadcrumbs';

type StoreEditorClientPageProps = {
  storeSlug: string;
};

function StoreEditorLoadingScaffold() {
  return (
    <Stack gap="md">
      <TinyBreadcrumbs
        items={[
          { label: 'Tienda', href: '/tienda' },
          { label: '......' },
          { label: 'Store' },
        ]}
      />

      <Group justify="space-between" align="flex-start">
        <div>
          <Skeleton height={34} width={260} radius="md" mb={8} />
          <Text c="dimmed" mt={2}>
            <span className="accent-blue">/tienda/[store]/store ::: loading :::</span>
          </Text>
          <Text size="xs" c="dimmed" mt={4}>[ ] [ ] [ ] [ ] [ ] [ ]</Text>
        </div>
        <Badge variant="light" color="cyan">Tendero...</Badge>
      </Group>

      <Group>
        <Skeleton height={36} width={168} radius="md" />
        <Skeleton height={36} width={182} radius="md" />
        <Skeleton height={36} width={108} radius="md" />
      </Group>

      <Paper withBorder radius="md" p="md">
        <Stack gap="sm">
          <Skeleton height={16} width="28%" radius="sm" />
          <Skeleton height={12} width="62%" radius="sm" />
          <Skeleton height={40} radius="md" />
        </Stack>
      </Paper>

      <Paper withBorder radius="md" p="md">
        <Stack gap="sm">
          <Skeleton height={18} width="36%" radius="sm" />
          <Skeleton height={12} width="74%" radius="sm" />
          <Skeleton height={40} radius="md" />
          <Skeleton height={40} radius="md" />
          <Skeleton height={140} radius="md" />
        </Stack>
      </Paper>
    </Stack>
  );
}

export default function StoreEditorClientPage({ storeSlug }: StoreEditorClientPageProps) {
  const { confirmed, stores, fetchStores, isLoading } = useAuth();
  const [store, setStore] = useState<Store | null>(null);
  const [storeLoading, setStoreLoading] = useState(true);
  const [minSkeletonElapsed, setMinSkeletonElapsed] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [draftTitle, setDraftTitle] = useState('');
  const [draftDescription, setDraftDescription] = useState('');

  const isConfirmed = confirmed();
  const ownerStore = useMemo(() => stores.find((candidate) => candidate.slug === storeSlug), [stores, storeSlug]);
  const canAuthorize = !isLoading && isConfirmed;
  const isAuthorized = !!ownerStore;
  const ownershipLoading = isConfirmed && stores.length === 0;

  useEffect(() => {
    const timer = setTimeout(() => setMinSkeletonElapsed(true), 650);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!canAuthorize) return;
    if (stores.length > 0) return;
    fetchStores();
  }, [canAuthorize, stores.length, fetchStores]);

  useEffect(() => {
    let active = true;
    const run = async () => {
      if (!canAuthorize) {
        return;
      }

      if (!isAuthorized) {
        if (active) {
          setStore(null);
          setStoreLoading(false);
        }
        return;
      }

      if (active) {
        setStoreLoading(true);
      }

      try {
        const response = await strapiClient.getStore(storeSlug);
        if (!active) return;

        const nextStore = response?.data?.[0] as Store | undefined;
        setStore(nextStore || null);
      } finally {
        if (active) {
          setStoreLoading(false);
        }
      }
    };

    run();

    return () => {
      active = false;
    };
  }, [canAuthorize, isAuthorized, storeSlug]);

  useEffect(() => {
    if (!store) return;
    setDraftTitle(store.title || '');
    setDraftDescription(richTextToHtml(store.Description));
  }, [store]);

  const handleDiscard = () => {
    if (!store) return;
    setDraftTitle(store.title || '');
    setDraftDescription(richTextToHtml(store.Description));
    setSaveError(null);
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!store) return;

    const title = draftTitle.trim();
    if (!title) {
      setSaveError('Title is required.');
      return;
    }

    const authString = localStorage.getItem('markket.auth');
    const auth = authString ? JSON.parse(authString) : {};
    const jwt = auth?.jwt as string | undefined;

    if (!jwt) {
      setSaveError('Your session expired. Please sign in again.');
      return;
    }

    setIsSaving(true);
    setSaveError(null);

    try {
      const payload = {
        title,
        Description: draftDescription,
      };

      const updated = await strapiClient.update('stores', String(store.documentId || store.id), {
        headers: { Authorization: `Bearer ${jwt}` },
        data: payload,
      });

      const next = (updated?.data || {}) as Partial<Store>;
      setStore((current) => {
        if (!current) return current;
        return {
          ...current,
          ...next,
          ...payload,
        };
      });
      setIsEditing(false);
    } catch (error) {
      console.error('store.editor.save.error', error);
      setSaveError('Unable to save changes right now.');
    } finally {
      setIsSaving(false);
    }
  };

  const shouldShowLoadingScaffold =
    !minSkeletonElapsed ||
    isLoading ||
    ownershipLoading ||
    (isAuthorized && storeLoading);

  if (shouldShowLoadingScaffold) {
    return <StoreEditorLoadingScaffold />;
  }

  if (!isConfirmed || !isAuthorized) {
    return (
      <Stack gap="md">
        <Paper withBorder radius="md" p="md">
          <Stack gap="xs">
            <Badge variant="light" color="gray" w="fit-content">404</Badge>
            <Title order={2}>Not Found</Title>
            <Text c="dimmed" size="sm">This editor route is unavailable.</Text>
          </Stack>
        </Paper>
      </Stack>
    );
  }

  if (!store) {
    return (
      <Stack gap="md">
        <Paper withBorder radius="md" p="md">
          <Stack gap="xs">
            <Badge variant="light" color="gray" w="fit-content">404</Badge>
            <Title order={2}>Not Found</Title>
            <Text c="dimmed" size="sm">Store not found.</Text>
          </Stack>
        </Paper>
      </Stack>
    );
  }

  return (
    <StoreEditorSkeleton
      store={store}
      isEditing={isEditing}
      isSaving={isSaving}
      saveError={saveError}
      draftTitle={draftTitle}
      draftDescription={draftDescription}
      onStartEditing={() => {
        setSaveError(null);
        setIsEditing(true);
      }}
      onCancelEditing={handleDiscard}
      onSave={handleSave}
      onTitleChange={setDraftTitle}
      onDescriptionChange={setDraftDescription}
    />
  );
}
