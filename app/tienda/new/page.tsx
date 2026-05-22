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

const TITLE_MIN = 3;
const TITLE_MAX = 80;
const SLUG_MIN = 5;
const DESCRIPTION_MIN = 24;
const DESCRIPTION_MAX = 280;

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
    .replace(/[^a-z0-9]+/g, '-')
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
    validateInputOnBlur: true,
    initialValues: {
      title: '',
      slug: '',
      description: '',
    },
    validate: {
      title: (value) => {
        const trimmed = value.trim();
        if (trimmed.length < TITLE_MIN) return `Title must be at least ${TITLE_MIN} characters.`;
        if (trimmed.length > TITLE_MAX) return `Title must be ${TITLE_MAX} characters or less`;
        return null;
      },
      slug: (value) => {
        const normalized = normalizeSlugInput(value);
        if (!normalized) return 'Slug is required.';
        if (normalized.length < SLUG_MIN) return `Slug must be at least ${SLUG_MIN} characters.`;
        if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(normalized)) {
          return 'Slug can only contain lowercase letters, numbers, and dashes.';
        }
        return null;
      },
      description: (value) => {
        const trimmed = value.trim();
        if (trimmed.length < DESCRIPTION_MIN) {
          return `Add at least ${DESCRIPTION_MIN} characters so your store has a clear starting description.`;
        }
        if (trimmed.length > DESCRIPTION_MAX) {
          return `Keep the description under ${DESCRIPTION_MAX} characters for clarity.`;
        }
        return null;
      },
    },
  });

  const trimmedTitleLength = form.values.title.trim().length;
  const trimmedDescriptionLength = form.values.description.trim().length;
  const canSubmit =
    !isSubmitting
    && trimmedTitleLength >= TITLE_MIN
    && trimmedTitleLength <= TITLE_MAX
    && form.values.slug.length >= SLUG_MIN
    && trimmedDescriptionLength >= DESCRIPTION_MIN
    && trimmedDescriptionLength <= DESCRIPTION_MAX;

  useEffect(() => {
    if (isSlugTouched) return;
    const suggested = slugifyStoreTitle(form.values.title);
    if (form.values.slug !== suggested) {
      form.setFieldValue('slug', suggested);
    }
  }, [form.values.title, form.values.slug, isSlugTouched]);

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (!confirmed()) {
      router.replace('/auth/magic?next=/tienda/new');
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

      console.info('store.create.success', {
        requestedSlug: slug,
        returnedSlug: createdSlug,
        documentId: created?.documentId,
        id: created?.id,
      });

      fetchStores({ force: true }).catch((error) => {
        console.warn('store.create.fetchStores.failed', error);
      });

      notifications.show({
        title: 'Launched!',
        message: 'Continue by adding images and pages',
        color: 'green',
      });

      router.replace(`/tienda/${nextSlug}?created=1`);

    } catch (error) {
      const message = error instanceof Error ? error.message : 'Launch error';
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

  if (!confirmed()) {
    return null;
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
                <Title order={1}>Launch</Title>
              </Group>
              <Text c="dimmed">
                Identity
              </Text>
            </div>

            <form onSubmit={form.onSubmit(handleSubmit)}>
              <Stack gap="md">
                <TextInput
                  label="Store title"
                  placeholder="Mr Manager"
                  description={`${trimmedTitleLength}/${TITLE_MAX} characters`}
                  disabled={isSubmitting}
                  withAsterisk
                  maxLength={TITLE_MAX}
                  {...form.getInputProps('title')}
                />

                <TextInput
                  label="Slug"
                  placeholder="mr-manager"
                  description={
                    form.values.slug ? (
                      <span style={{ fontFamily: 'monospace' }}>
                        https://markket.place/<strong>{form.values.slug}</strong>
                      </span>
                    ) : `At least ${SLUG_MIN} chars. Lowercase letters, numbers, and dashes only.`
                  }
                  disabled={isSubmitting}
                  value={form.values.slug}
                  onChange={(event) => {
                    setIsSlugTouched(true);
                    form.setFieldValue('slug', event.currentTarget.value.toLowerCase());
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
                  description={`${trimmedDescriptionLength}/${DESCRIPTION_MAX} characters. `}
                  minRows={5}
                  autosize
                  withAsterisk
                  maxLength={DESCRIPTION_MAX}
                  disabled={isSubmitting}
                  {...form.getInputProps('description')}
                />

                <Paper radius="md" p="md" bg="gray.0">
                  <Stack gap={4}>
                    <Group gap="xs">
                      <IconSparkles size={16} />
                      <Text fw={600} size="sm">Getting ready</Text>
                    </Group>
                    <Text size="sm" c="dimmed">Your new site can be found at markket.place/{form.values.slug} </Text>
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
                  <Button type="submit" loading={isSubmitting} disabled={!canSubmit} leftSection={<IconBuildingStore size={16} />}>
                    Launch
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
