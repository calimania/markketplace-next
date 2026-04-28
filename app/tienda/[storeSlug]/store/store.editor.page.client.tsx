'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Badge, Group, Paper, Skeleton, Stack, Text, Title } from '@mantine/core';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/app/providers/auth.provider';
import { markketClient } from '@/markket/api';
import type { Store } from '@/markket/store';
import type { URLItem } from '@/app/components/ui/form.input.urls';
import StoreEditorSkeleton from './store.editor.skeleton';
import { richTextToHtml } from '@/markket/richtext.utils';
import TinyBreadcrumbs from '@/app/components/ui/tiny.breadcrumbs';

type StoreEditorClientPageProps = {
  storeSlug: string;
};

type StoreDraft = {
  title: string;
  slug: string;
  description: string;
  urls: URLItem[];
  seoTitle: string;
  seoDescription: string;
  updatedAt: string;
};

const buildDraftKey = (store: Store) => `markket.store-draft.${store.documentId || store.slug || store.id}`;

function isStorePublished(store: Store | null) {
  if (!store) return false;

  const status = String((store as Store & { status?: string }).status || '').toLowerCase();
  if (status === 'published') return true;
  if (status === 'draft') return false;

  return Boolean(store.publishedAt);
}

function StoreEditorLoadingScaffold() {
  return (
    <Stack gap="md">
      <TinyBreadcrumbs
        items={[
          { label: 'Me', href: '/me' },
          { label: 'Tienda', href: '/tienda' },
          { label: '......' },
          { label: 'Store' },
        ]}
      />

      <Group justify="space-between" align="flex-start">
        <div>
          <Skeleton height={34} width={260} radius="md" mb={8} />
          <Text c="dimmed" mt={2}>
            <span className="accent-blue">Setting up your store workspace...</span>
          </Text>
          <Text size="xs" c="dimmed" mt={4}>[ ] [ ] [ ] [ ] [ ] [ ]</Text>
        </div>
        <Badge variant="light" color="pink" radius="xl">Store Studio</Badge>
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
  const router = useRouter();
  const searchParams = useSearchParams();
  const { confirmed, stores, fetchStores, isLoading } = useAuth();
  const [store, setStore] = useState<Store | null>(null);
  const [storeLoading, setStoreLoading] = useState(true);
  const [minSkeletonElapsed, setMinSkeletonElapsed] = useState(false);
  const [isEditing, setIsEditing] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [editorNotice, setEditorNotice] = useState<string | null>(null);
  const [draftTitle, setDraftTitle] = useState('');
  const [draftSlug, setDraftSlug] = useState('');
  const [draftDescription, setDraftDescription] = useState('');
  const [draftUrls, setDraftUrls] = useState<URLItem[]>([]);
  const [draftSeoTitle, setDraftSeoTitle] = useState('');
  const [draftSeoDescription, setDraftSeoDescription] = useState('');
  const hasLoadedLocalDraftRef = useRef(false);
  const startInEditMode = ['1', 'true', 'yes'].includes((searchParams.get('edit') || '').toLowerCase());
  const returnTo = searchParams.get('returnTo') || '';

  const isConfirmed = confirmed();
  const ownerStore = useMemo(() => stores.find((candidate) => candidate.slug === storeSlug), [stores, storeSlug]);
  const canAuthorize = !isLoading && isConfirmed;
  const isAuthorized = !!ownerStore || (!!store && stores.some((candidate) => candidate.documentId === store.documentId));
  const ownershipLoading = isConfirmed && stores.length === 0;
  const isPublished = useMemo(() => isStorePublished(store), [store]);

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

      if (active) {
        setStoreLoading(true);
      }

      try {
        const client = new markketClient();
        const response = await client.fetch('/api/markket/store', {
          method: 'GET',
        });
        if (!active) return;

        const storesFromApi = Array.isArray(response?.data) ? response.data as Store[] : [];
        const nextStore = storesFromApi.find((candidate) => candidate.slug === storeSlug) as Store | undefined;
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
  }, [canAuthorize, storeSlug]);

  useEffect(() => {
    if (!store) return;
    setDraftTitle(store.title || '');
    setDraftSlug(store.slug || '');
    setDraftDescription(richTextToHtml(store.Description));
    setDraftUrls(store.URLS || []);
    setDraftSeoTitle(store.SEO?.metaTitle || store.title || '');
    setDraftSeoDescription(store.SEO?.metaDescription || '');
    hasLoadedLocalDraftRef.current = false;
  }, [store]);

  useEffect(() => {
    if (store && !startInEditMode) {
    // keep edit mode on by default; only override if explicitly set to false
    }
  }, [store, startInEditMode]);

  useEffect(() => {
    if (!store || hasLoadedLocalDraftRef.current) return;

    hasLoadedLocalDraftRef.current = true;

    try {
      const key = buildDraftKey(store);
      const raw = localStorage.getItem(key);
      if (!raw) return;

      const parsed = JSON.parse(raw) as Partial<StoreDraft>;
      const recoveredTitle = typeof parsed.title === 'string' ? parsed.title : '';
      const recoveredSlug = typeof parsed.slug === 'string' ? parsed.slug : '';
      const recoveredDescription = typeof parsed.description === 'string' ? parsed.description : '';
      const recoveredUrls = Array.isArray(parsed.urls) ? parsed.urls as URLItem[] : [];
      const recoveredSeoTitle = typeof parsed.seoTitle === 'string' ? parsed.seoTitle : '';
      const recoveredSeoDescription = typeof parsed.seoDescription === 'string' ? parsed.seoDescription : '';

      const hasRecoveredValues = [
        recoveredTitle,
        recoveredSlug,
        recoveredDescription,
        recoveredUrls.length ? 'urls' : '',
        recoveredSeoTitle,
        recoveredSeoDescription,
      ].some((value) => value.length > 0);

      if (!hasRecoveredValues) {
        return;
      }

      setDraftTitle(recoveredTitle || store.title || '');
      setDraftSlug(recoveredSlug || store.slug || '');
      setDraftDescription(recoveredDescription || richTextToHtml(store.Description));
      setDraftUrls(recoveredUrls.length ? recoveredUrls : (store.URLS || []));
      setDraftSeoTitle(recoveredSeoTitle || store.SEO?.metaTitle || store.title || '');
      setDraftSeoDescription(recoveredSeoDescription || store.SEO?.metaDescription || '');
      setIsEditing(true);
      setEditorNotice('Recovered an unsaved draft from this device. Save to keep it or Discard to revert.');
    } catch (error) {
      console.warn('store.editor.draft.restore.failed', error);
    }
  }, [store]);

  const handleDiscard = () => {
    if (!store) return;
    setDraftTitle(store.title || '');
    setDraftSlug(store.slug || '');
    setDraftDescription(richTextToHtml(store.Description));
    setDraftUrls(store.URLS || []);
    setDraftSeoTitle(store.SEO?.metaTitle || store.title || '');
    setDraftSeoDescription(store.SEO?.metaDescription || '');
    setSaveError(null);
    setEditorNotice(null);
    setIsEditing(false);

    try {
      localStorage.removeItem(buildDraftKey(store));
    } catch (error) {
      console.warn('store.editor.draft.remove.failed', error);
    }
  };

  useEffect(() => {
    if (!store || !isEditing) return;

    const normalize = (value: string) => value.trim();
    const baselineTitle = normalize(store.title || '');
    const baselineSlug = normalize(store.slug || '');
    const baselineDescription = normalize(richTextToHtml(store.Description));
    const baselineUrls = JSON.stringify(store.URLS || []);
    const baselineSeoTitle = normalize(store.SEO?.metaTitle || store.title || '');
    const baselineSeoDescription = normalize(store.SEO?.metaDescription || '');

    const nextTitle = normalize(draftTitle);
    const nextSlug = normalize(draftSlug);
    const nextDescription = normalize(draftDescription);
    const nextUrls = JSON.stringify(draftUrls || []);
    const nextSeoTitle = normalize(draftSeoTitle);
    const nextSeoDescription = normalize(draftSeoDescription);

    const hasChanges =
      nextTitle !== baselineTitle ||
      nextSlug !== baselineSlug ||
      nextDescription !== baselineDescription ||
      nextUrls !== baselineUrls ||
      nextSeoTitle !== baselineSeoTitle ||
      nextSeoDescription !== baselineSeoDescription;

    const key = buildDraftKey(store);

    if (!hasChanges) {
      try {
        localStorage.removeItem(key);
      } catch (error) {
        console.warn('store.editor.draft.remove.failed', error);
      }
      return;
    }

    const timeout = window.setTimeout(() => {
      const payload: StoreDraft = {
        title: draftTitle,
        slug: draftSlug,
        description: draftDescription,
        urls: draftUrls,
        seoTitle: draftSeoTitle,
        seoDescription: draftSeoDescription,
        updatedAt: new Date().toISOString(),
      };

      try {
        localStorage.setItem(key, JSON.stringify(payload));
      } catch (error) {
        console.warn('store.editor.draft.save.failed', error);
      }
    }, 450);

    return () => window.clearTimeout(timeout);
  }, [store, isEditing, draftTitle, draftSlug, draftDescription, draftUrls, draftSeoTitle, draftSeoDescription]);

  const handleSave = async () => {
    if (!store) return;

    const title = draftTitle.trim();
    const nextSlug = draftSlug.trim().toLowerCase();
    if (!title) {
      setSaveError('Title is required.');
      return;
    }

    if (!nextSlug) {
      setSaveError('Slug is required.');
      return;
    }

    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(nextSlug) || nextSlug.length < 5) {
      setSaveError('Slug must be at least 5 chars and use only lowercase letters, numbers, and dashes.');
      return;
    }

    setIsSaving(true);
    setSaveError(null);

    try {
      const normalizedUrls: Store['URLS'] = (draftUrls || []).map((item, index) => ({
        ...item,
        id: item.id ?? store.URLS?.[index]?.id ?? index + 1,
      }));

      const payload = {
        store: {
          ...store,
          title,
          Description: draftDescription,
          slug: nextSlug,
          URLS: normalizedUrls,
          SEO: {
            ...store.SEO,
            metaTitle: draftSeoTitle.trim() || title,
            metaDescription: draftSeoDescription.trim(),
          },
          Favicon: store.Favicon,
          Cover: store.Cover,
          Slides: store.Slides,
          Logo: store.Logo,
        },
      };

      const client = new markketClient();
      const updated = await client.put(`/api/markket/store?id=${store.documentId}`, {
        body: payload,
      });

      if (updated?.error) {
        throw new Error(updated?.details?.message || updated?.error || 'Unable to save changes right now.');
      }

      const next = (updated?.data || {}) as Partial<Store>;
      const finalSlug = (next.slug as string) || nextSlug;
      setStore((current) => {
        if (!current) return current;
        return {
          ...current,
          ...next,
          ...payload.store,
          SEO: {
            ...current.SEO,
            ...payload.store.SEO,
            ...(next.SEO || {}),
          },
        };
      });
      setIsEditing(false);
      await fetchStores();

      try {
        localStorage.removeItem(buildDraftKey(store));
      } catch (error) {
        console.warn('store.editor.draft.remove.failed', error);
      }
      setEditorNotice(null);

      if (returnTo) {
        router.replace(returnTo);
        return;
      }

      if (finalSlug !== storeSlug) {
        router.replace(`/tienda/${finalSlug}/store`);
      }
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
      editorNotice={editorNotice}
      draftTitle={draftTitle}
      draftSlug={draftSlug}
      draftDescription={draftDescription}
      draftUrls={draftUrls}
      draftSeoTitle={draftSeoTitle}
      draftSeoDescription={draftSeoDescription}
      isPublished={isPublished}
      onStartEditing={() => {
        setSaveError(null);
        setIsEditing(true);
      }}
      onCancelEditing={handleDiscard}
      onSave={handleSave}
      onTitleChange={setDraftTitle}
      onSlugChange={setDraftSlug}
      onDescriptionChange={setDraftDescription}
      onUrlsChange={setDraftUrls}
      onSeoTitleChange={setDraftSeoTitle}
      onSeoDescriptionChange={setDraftSeoDescription}
    />
  );
}
