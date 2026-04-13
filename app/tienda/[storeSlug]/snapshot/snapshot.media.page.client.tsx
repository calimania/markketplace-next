'use client';

import { useMemo, useState } from 'react';
import { Badge, Button, Group, Paper, Stack, Text, Title } from '@mantine/core';
import { IconArrowLeft, IconPhoto, IconSparkles } from '@tabler/icons-react';
import TinyBreadcrumbs from '@/app/components/ui/tiny.breadcrumbs';
import StoreMedia from '@/app/components/ui/store.media';
import { useAuth } from '@/app/providers/auth.provider';
import { useStore } from '../store.provider';
import type { Store, Media } from '@/markket/store';
import { markketClient, strapiClient } from '@/markket/api';

type StoreSnapshotMediaClientPageProps = {
  storeSlug: string;
};

export default function StoreSnapshotMediaClientPage({ storeSlug }: StoreSnapshotMediaClientPageProps) {
  const contextStore = useStore();
  const { confirmed, stores } = useAuth();
  const [store, setStore] = useState<Store>(contextStore);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const client = new markketClient();

  const isAuthorized = useMemo(() => {
    if (!confirmed()) return false;
    return stores.some((candidate) => candidate.slug === storeSlug || candidate.documentId === store.documentId);
  }, [confirmed, stores, storeSlug, store.documentId]);

  const handleMediaUpdate = (media: Media, field: string, id: number | string) => {
    if (`${store.id}` !== `${id}`) return;

    if (field === 'Slides') {
      const currentSlides = Array.isArray(store.Slides) ? store.Slides : [];
      const exists = currentSlides.some((slide) => `${slide.id}` === `${media.id}` || `${slide.documentId}` === `${media.documentId}`);
      setStore({
        ...store,
        Slides: exists ? currentSlides : [...currentSlides, media],
      });
      return;
    }

    if (field.startsWith('SEO.')) {
      const key = field.split('.')[1] as keyof Store['SEO'];
      setStore({
        ...store,
        SEO: {
          ...store.SEO,
          [key]: media,
        },
      });
      return;
    }

    setStore({
      ...store,
      [field]: media,
    } as Store);
  };

  const refreshStore = async () => {
    try {
      setIsRefreshing(true);
      const response = await strapiClient.getStore(storeSlug);
      const nextStore = response?.data?.[0] as Store | undefined;
      if (nextStore) {
        setStore(nextStore);
      }
    } catch (error) {
      console.warn('snapshot.media.refresh.failed', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const saveSlides = async (slides: Media[]) => {
    const targetId = store.documentId || store.id;
    if (!targetId) throw new Error('Missing store identifier');

    const payload = {
      store: {
        ...store,
        title: store.title || '',
        Description: store.Description || store.description || '',
        slug: store.slug || storeSlug,
        URLS: store.URLS || [],
        SEO: {
          ...(store.SEO || {}),
          socialImage: store.SEO?.socialImage,
        },
        Favicon: store.Favicon,
        Cover: store.Cover,
        Slides: slides,
        Logo: store.Logo,
      },
    };

    const updated = await client.put(`/api/markket/store?id=${targetId}`, {
      body: payload,
    });

    if (updated?.error) {
      throw new Error(updated?.details?.message || updated?.error || 'Failed to save slides');
    }

    setStore((current) => ({ ...current, Slides: slides }));
  };

  if (!isAuthorized) {
    return (
      <Stack gap="md">
        <Paper withBorder radius="md" p="md">
          <Stack gap="xs">
            <Badge variant="light" color="gray" w="fit-content">404</Badge>
            <Title order={2}>Not Found</Title>
            <Text c="dimmed" size="sm">This media route is unavailable.</Text>
          </Stack>
        </Paper>
      </Stack>
    );
  }

  return (
    <Stack gap="md">
      <TinyBreadcrumbs
        items={[
          { label: 'Tienda', href: '/tienda' },
          { label: storeSlug, href: `/tienda/${storeSlug}` },
          { label: 'Media Studio' },
        ]}
      />

      <Paper withBorder radius="md" p="md">
        <Group justify="space-between" align="center">
          <div>
            <Group gap="xs" align="center">
              <IconPhoto size={18} />
              <Title order={2}>Media Studio</Title>
            </Group>
            <Text c="dimmed" size="sm" mt={4}>
              Manage logo, favicon, cover, and slides for {store.title || store.slug}.
            </Text>
          </div>
          <Group gap="xs">
            {isRefreshing && <Badge variant="light" color="grape">Syncing...</Badge>}
            <Badge variant="light" color="yellow" leftSection={<IconSparkles size={12} />}>
              Store Snapshot
            </Badge>
            <Button component="a" href={`/tienda/${storeSlug}`} variant="default" leftSection={<IconArrowLeft size={14} />}>
              Back
            </Button>
          </Group>
        </Group>
      </Paper>

      <StoreMedia
        store={store}
        onUpdate={handleMediaUpdate}
        onRefresh={refreshStore}
        onSaveSlides={saveSlides}
      />
    </Stack>
  );
}
