'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Accordion, Badge, Button, Group, Stack, Text, TextInput, Textarea,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { useRouter } from 'next/navigation';
import { IconSearch, IconAlertTriangle } from '@tabler/icons-react';
import { tiendaClient } from '@/markket/api.tienda';
import { tiptapToStrapiBlocks } from '@/markket/richtext.transform';
import ContentEditor from '@/app/components/ui/form.input.tiptap';
import { useStore } from '../store.provider';
import type { RichTextValue } from '@/markket/richtext';
import { isValidTiendaSlug, readTiendaAuthToken, slugifyTiendaValue } from '@/markket/helpers.tienda';

type PageEditorFormProps = {
  storeSlug: string;
  mode: 'new' | 'edit';
  itemDocumentId?: string;
  initial?: {
    title?: string;
    slug?: string;
    content?: RichTextValue;
    seoTitle?: string;
    seoDescription?: string;
    seoSocialImageId?: number;
    seoSocialImageDocumentId?: string;
    albumDocumentIds?: string[];
    initialSEO?: Record<string, unknown>;
  };
};

type PageFormValues = {
  title: string;
  slug: string;
  content: RichTextValue;
  seoTitle: string;
  seoDescription: string;
};

export default function PageEditorForm({ storeSlug, mode, itemDocumentId, initial }: PageEditorFormProps) {
  const router = useRouter();
  const store = useStore();

  const form = useForm<PageFormValues>({
    validateInputOnBlur: true,
    initialValues: {
      title: initial?.title || '',
      slug: initial?.slug || '',
      content: initial?.content ?? '',
      seoTitle: initial?.seoTitle || '',
      seoDescription: initial?.seoDescription || '',
    },
    validate: {
      title: (value) => (value.trim() ? null : 'Title is required.'),
      slug: (value) => {
        const normalized = slugifyTiendaValue(value);
        if (!normalized) return 'Slug is required.';
        if (!isValidTiendaSlug(normalized)) {
          return 'Slug can only contain lowercase letters, numbers, and dashes.';
        }
        return null;
      },
      seoTitle: (value) => (value.trim().length > 60 ? 'SEO title should be 60 characters or less.' : null),
      seoDescription: (value) => (value.trim().length > 160 ? 'SEO description should be 160 characters or less.' : null),
    },
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [slugTouched, setSlugTouched] = useState(Boolean(initial?.slug));

  // Dirty state: track if there are unsaved changes
  const [isDirty, setIsDirty] = useState(false);
  const savedSnapshotRef = useRef<PageFormValues>({ ...form.values });

  const storeRef = useMemo(
    () => store.documentId || store.slug || storeSlug,
    [store.documentId, store.slug, storeSlug],
  );

  // Auto-derive slug from title until manually touched
  useEffect(() => {
    if (slugTouched) return;
    const nextSlug = slugifyTiendaValue(form.values.title);
    if (form.values.slug !== nextSlug) {
      form.setFieldValue('slug', nextSlug);
    }
  }, [form.values.title, form.values.slug, slugTouched]);

  // Mark dirty whenever any field changes after initial load
  useEffect(() => {
    const snap = savedSnapshotRef.current;
    const dirtyTitle = form.values.title !== snap.title;
    const dirtySlug = form.values.slug !== snap.slug;
    const dirtySeoTitle = form.values.seoTitle !== snap.seoTitle;
    const dirtySeoDesc = form.values.seoDescription !== snap.seoDescription;
    const dirtyContent = JSON.stringify(form.values.content) !== JSON.stringify(snap.content);

    const nextDirty = dirtyTitle || dirtySlug || dirtySeoTitle || dirtySeoDesc || dirtyContent;
    setIsDirty(nextDirty);
    if (nextDirty && isSaved) {
      setIsSaved(false);
    }
  }, [
    form.values.title,
    form.values.slug,
    form.values.seoTitle,
    form.values.seoDescription,
    form.values.content,
    isSaved,
  ]);

  // Track content changes (no-op now, dirty is handled by effect above)
  const handleContentChange = (value: RichTextValue) => {
    form.setFieldValue('content', value);
  };

  // Warn on hard navigation while dirty
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [isDirty]);

  const handleCancel = () => {
    if (isDirty && !confirm('You have unsaved changes. Leave anyway?')) return;
    router.push(mode === 'edit' && itemDocumentId ? `/tienda/${storeSlug}/pages/${itemDocumentId}` : `/tienda/${storeSlug}/pages`);
  };

  const handleSubmit = async () => {
    const token = readTiendaAuthToken();

    if (!token) {
      notifications.show({
        title: 'Session expired',
        message: 'Please sign in again to save.',
        color: 'red',
        autoClose: 5000,
      });
      return;
    }

    const validation = form.validate();
    if (validation.hasErrors) {
      notifications.show({ title: 'Please review the form', message: 'Some fields need attention before saving.', color: 'orange' });
      return;
    }

    const nextSlug = slugifyTiendaValue(form.values.slug || form.values.title);
    if (!nextSlug) {
      notifications.show({ title: 'Slug required', message: 'A valid slug is required.', color: 'orange' });
      return;
    }

    const payload: Record<string, unknown> = {
      Title: form.values.title.trim(),
      slug: nextSlug,
      Content: tiptapToStrapiBlocks(form.values.content),
      SEO: {
        ...(initial?.initialSEO
          ? Object.fromEntries(Object.entries(initial.initialSEO).filter(([k]) => k !== 'socialImage' && k !== 'id' && k !== 'documentId'))
          : {}),
        metaTitle: (form.values.seoTitle || form.values.title).trim().slice(0, 60),
        metaDescription: (form.values.seoDescription || '').trim().slice(0, 160),
        ...(initial?.seoSocialImageId
          ? { socialImage: { id: initial.seoSocialImageId } }
          : {}),
      },
    };

    if (initial?.albumDocumentIds && initial.albumDocumentIds.length > 0) {
      payload.albums = initial.albumDocumentIds.map((documentId) => ({ documentId }));
    }

    try {
      setIsSubmitting(true);

      const response = mode === 'new'
        ? await tiendaClient.createContent(storeRef, 'page', payload, { token })
        : await tiendaClient.updateContent(storeRef, 'page', itemDocumentId || '', payload, { token });

      if (!response || (response?.status && response.status >= 400)) {
        throw new Error(response?.message || `Server error: ${response?.status || 'unknown'}`);
      }

      // Some upstream update flows return 200/204 with an empty body.
      // Verify persisted content to avoid false-positive "saved" UX.
      let responseDocumentId = response?.data?.documentId || itemDocumentId || nextSlug;

      if (mode === 'edit' && !response?.data) {
        const verification = await tiendaClient.getContent(storeRef, 'page', responseDocumentId, {
          token,
          query: { status: 'all' },
        });

        if (!verification || (verification?.status && verification.status >= 400) || !verification?.data) {
          throw new Error('Save response was empty and verification failed. Please try saving again.');
        }

        const verifiedPage = verification.data as { documentId?: string; Title?: string; slug?: string };
        if (
          (verifiedPage?.Title && verifiedPage.Title !== payload.Title)
          || (verifiedPage?.slug && verifiedPage.slug !== payload.slug)
        ) {
          throw new Error('Save did not persist latest changes yet. Please try again.');
        }

        responseDocumentId = verifiedPage.documentId || responseDocumentId;
      }

      savedSnapshotRef.current = {
        ...form.values,
        slug: nextSlug,
      };
      setIsDirty(false);
      setIsSaved(true);

      notifications.show({
        title: 'Saved',
        message: `Page "${form.values.title}" saved successfully.`,
        color: 'green',
        autoClose: 3000,
      });

      const destination = mode === 'new'
        ? `/tienda/${storeSlug}/pages/${responseDocumentId}?created=1`
        : `/tienda/${storeSlug}/pages/${responseDocumentId}`;

      router.replace(destination);
      router.refresh();
    } catch (error) {
      notifications.show({
        title: 'Save failed',
        message: error instanceof Error ? error.message : 'Could not save page.',
        color: 'red',
        autoClose: 8000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const descRemaining = 160 - (form.values.seoDescription || '').length;
  const titleRemaining = 60 - (form.values.seoTitle || form.values.title || '').length;

  return (
    <Stack gap="md" className="tienda-editor-form">
      <TextInput
        label="Title"
        value={form.values.title}
        onChange={(e) => { form.setFieldValue('title', e.currentTarget.value); }}
        placeholder="Page title"
        required
        error={form.errors.title}
      />
      <TextInput
        label="Slug"
        value={form.values.slug}
        onChange={(e) => {
          setSlugTouched(true);
          form.setFieldValue('slug', e.currentTarget.value);
        }}
        placeholder="page-slug"
        required
        error={form.errors.slug}
        description={
          form.values.slug ? (
            <span style={{ fontFamily: 'monospace' }}>
              /{storeSlug}/<strong>{form.values.slug}</strong>
            </span>
          ) : undefined
        }
      />

      {/* Rich text */}
      <ContentEditor
        label="Content"
        value={form.values.content}
        onChange={handleContentChange}
        format="blocks"
        placeholder="Start writing your page…"
        minHeight={320}
      />


      {/* SEO accordion */}
      <Accordion variant="contained" radius="md">
        <Accordion.Item value="seo">
          <Accordion.Control icon={<IconSearch size={16} />}>
            <Group gap="xs">
              <Text size="sm" fw={500}>SEO & Metadata</Text>
              {(titleRemaining < 0 || descRemaining < 0) && (
                <Badge color="orange" size="xs" variant="light">Over limit</Badge>
              )}
            </Group>
          </Accordion.Control>
          <Accordion.Panel>
            <Stack gap="sm">
              <Text size="xs" c="dimmed">
                Social/Cover images are managed in the preview page Image Manager.
              </Text>

              <TextInput
                label="Meta Title"
                value={form.values.seoTitle}
                onChange={(e) => form.setFieldValue('seoTitle', e.currentTarget.value)}
                placeholder={form.values.title || 'SEO title'}
                description={`${Math.max(0, titleRemaining)} chars remaining (60 max)`}
                error={form.errors.seoTitle || (titleRemaining < 0 ? 'Over 60 character limit' : undefined)}
              />
              <Textarea
                label="Meta Description"
                value={form.values.seoDescription}
                onChange={(e) => form.setFieldValue('seoDescription', e.currentTarget.value)}
                placeholder="Brief description for search engines…"
                minRows={3}
                autosize
                description={`${Math.max(0, descRemaining)} chars remaining (160 max)`}
                error={form.errors.seoDescription || (descRemaining < 0 ? 'Over 160 character limit' : undefined)}
              />
            </Stack>
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion>

      {/* Action bar */}
      <Group justify="space-between" mt="xs">
        <Group gap="xs">
          {isDirty && !isSaved && (
            <Badge
              color="orange"
              variant="light"
              size="sm"
              leftSection={<IconAlertTriangle size={12} />}
            >
              Unsaved changes
            </Badge>
          )}
          {isSaved && (
            <Badge color="green" variant="light" size="sm">Saved</Badge>
          )}
        </Group>

        <Group gap="xs">
          <Button variant="subtle" onClick={handleCancel} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} loading={isSubmitting} disabled={!isDirty && mode === 'edit'}>
            {mode === 'new' ? 'Create Page' : 'Save Changes'}
          </Button>
        </Group>
      </Group>
    </Stack>
  );
}
