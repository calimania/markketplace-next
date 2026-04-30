'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Button,
  Container,
  Group,
  Paper,
  Skeleton,
  Stack,
  Text,
  TextInput,
  Textarea,
  Title,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IconArrowLeft, IconBuildingStore, IconSparkles } from '@tabler/icons-react';
import Link from 'next/link';
import TinyBreadcrumbs from '@/app/components/ui/tiny.breadcrumbs';
import { useAuth } from '@/app/providers/auth.provider';
import { markketClient } from '@/markket/api';

type CreateStoreForm = {
  title: string;
  slug: string;
  description: string;
};

function slugifyStoreTitle(title: string) {
  const base = title
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  if (!base) {
    return 'store-space';
  }

  if (base.length >= 5) {
    return base;
  }

  return `${base}-shop`;
}

function normalizeSlugInput(value: string) {
  const normalized = value
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-+|-+$/g, '');

  if (!normalized) return '';
  return normalized;
}

export default function TiendaNewPage() {
  const router = useRouter();
  const { confirmed, isLoading, fetchStores } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSlugTouched, setIsSlugTouched] = useState(false);

  const form = useForm<CreateStoreForm>({
    initialValues: {
      title: '',
      slug: '',
      description: '',
    },
    validate: {
      title: (value) => (value.trim().length < 3 ? 'Title should be at least 3 characters.' : null),
      slug: (value) => {
        const normalized = normalizeSlugInput(value);
        if (!normalized) return 'Slug is required.';
        if (normalized.length < 5) return 'Slug must be at least 5 characters.';
        if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(normalized)) {
          return 'Slug can only contain lowercase letters, numbers, and dashes.';
        }
        return null;
      },
      description: (value) => (value.trim().length < 12 ? 'Add a short description so the store has a clear starting point.' : null),
    },
  });

  useEffect(() => {
    if (isSlugTouched) return;
    const suggested = slugifyStoreTitle(form.values.title);
    if (form.values.slug !== suggested) {
      form.setFieldValue('slug', suggested);
    }
  }, [form.values.title, form.values.slug, form, isSlugTouched]);

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (!confirmed()) {
      router.replace('/auth');
    }
  }, [confirmed, isLoading, router]);

  const handleSubmit = async (values: CreateStoreForm) => {
    setIsSubmitting(true);

    const title = values.title.trim();
    const description = values.description.trim();
    const slug = normalizeSlugInput(values.slug || slugifyStoreTitle(title));
    const metaDescription = description.replace(/\s+/g, ' ').slice(0, 160);

    try {
      const client = new markketClient();
      const response = await client.post('/api/tienda/stores', {
        body: {
          title,
          slug,
          Description: description,
          URLS: [],
          SEO: {
            metaTitle: title,
            metaDescription,
            metaKeywords: title,
          },
        },
      });

      const created = response?.data;
      const createdId = created?.id || created?.documentId;
      const createdSlug =
        created?.slug ||
        created?.attributes?.slug ||
        created?.data?.slug ||
        created?.data?.attributes?.slug;
      const hasCreatedStore = Boolean(createdId || createdSlug);

      if (response?.__ok === false || (response?.__httpStatus && response.__httpStatus >= 400)) {
        throw new Error(response?.details?.message || response?.error || `Could not create store (HTTP ${response?.__httpStatus || 'error'}).`);
      }

      if (!hasCreatedStore && response?.error) {
        throw new Error(response?.details?.message || response?.error || 'Could not create store.');
      }

      const nextSlug = createdSlug || slug;

      if (process.env.NODE_ENV === 'development') {
        console.info('store.create.success', {
          requestedSlug: slug,
          returnedSlug: createdSlug,
          documentId: created?.documentId,
          id: created?.id,
          redirectTo: `/tienda/${nextSlug}`,
        });
      }

      fetchStores({ force: true }).catch((error) => {
        console.warn('store.create.fetchStores.failed', error);
      });

      notifications.show({
        title: 'Store created',
        message: 'Your store shell is ready. Now you can add the rest of the details.',
        color: 'green',
      });

      router.replace(`/tienda/${nextSlug}?created=1`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not create store.';
      notifications.show({
        title: 'Create store failed',
        message,
        color: 'red',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Container size="sm" py="xl">
        <Stack gap="md">
          <Skeleton height={18} width={140} radius="sm" />
          <Paper withBorder p="xl" radius="lg">
            <Stack gap="md">
              <Skeleton height={28} width="55%" radius="sm" />
              <Skeleton height={16} width="80%" radius="sm" />
              <Skeleton height={36} radius="sm" />
              <Skeleton height={120} radius="sm" />
              <Group justify="space-between">
                <Skeleton height={36} width={100} radius="sm" />
                <Skeleton height={36} width={150} radius="sm" />
              </Group>
            </Stack>
          </Paper>
        </Stack>
      </Container>
    );
  }

  return (
    <Container size="sm" py="xl">
      <Stack gap="md">
        <TinyBreadcrumbs
          items={[
            { label: 'Me', href: '/me' },
            { label: 'Tienda', href: '/tienda' },
            { label: 'New Store' },
          ]}
        />

        <Paper withBorder p="xl" radius="lg">
          <Stack gap="lg">
            <div>
              <Group gap="xs" mb="xs">
                <IconBuildingStore size={24} />
                <Title order={1}>Create Store</Title>
              </Group>
              <Text c="dimmed">
                Start with the minimum: title and description. We will use the title for SEO and send you straight into your new store overview so it is obvious the store was created.
              </Text>
            </div>

            <form onSubmit={form.onSubmit(handleSubmit)}>
              <Stack gap="md">
                <TextInput
                  label="Store title"
                  placeholder="Casa Caliman"
                  description="This also seeds SEO.metaTitle and the first slug."
                  disabled={isSubmitting}
                  {...form.getInputProps('title')}
                />

                <TextInput
                  label="Slug"
                  placeholder="casa-caliman"
                  description={
                    form.values.slug ? (
                      <span style={{ fontFamily: 'monospace' }}>
                        markket.place/<strong>{form.values.slug}</strong>
                        <span style={{ color: 'var(--mantine-color-dimmed)', margin: '0 6px' }}>·</span>
                        /tienda/{form.values.slug}
                      </span>
                    ) : 'At least 5 chars. Lowercase letters, numbers, and dashes.'
                  }
                  disabled={isSubmitting}
                  value={form.values.slug}
                  onChange={(event) => {
                    setIsSlugTouched(true);
                    form.setFieldValue('slug', normalizeSlugInput(event.currentTarget.value));
                  }}
                  onBlur={() => {
                    const normalized = normalizeSlugInput(form.values.slug);
                    form.setFieldValue('slug', normalized);
                  }}
                  error={form.errors.slug}
                />

                <Textarea
                  label="Short description"
                  placeholder="A studio, shop, or collective with a clear point of view..."
                  description="This becomes the starting store description and SEO.metaDescription."
                  minRows={5}
                  autosize
                  disabled={isSubmitting}
                  {...form.getInputProps('description')}
                />

                <Paper radius="md" p="md" bg="gray.0">
                  <Stack gap={4}>
                    <Group gap="xs">
                      <IconSparkles size={16} />
                      <Text fw={600} size="sm">What happens next</Text>
                    </Group>
                    <Text size="sm" c="dimmed">We will create your store and take you straight to it, so you can review it and keep customizing right away.</Text>
                  </Stack>
                </Paper>

                <Group justify="space-between">
                  <Button
                    component={Link}
                    href="/me"
                    variant="default"
                    leftSection={<IconArrowLeft size={16} />}
                    disabled={isSubmitting}
                  >
                    Back
                  </Button>
                  <Button type="submit" loading={isSubmitting} leftSection={<IconBuildingStore size={16} />}>
                    Create Store
                  </Button>
                </Group>
              </Stack>
            </form>
          </Stack>
        </Paper>
      </Stack>
    </Container>
  );
}
