'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Button, CloseButton, Group, Stack, Text, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { useRouter } from 'next/navigation';
import { tiendaClient } from '@/markket/api.tienda';
import { tiptapToStrapiBlocks } from '@/markket/richtext.transform';
import ContentEditor from '@/app/components/ui/form.input.tiptap';
import { useStore } from '../store.provider';
import type { RichTextValue } from '@/markket/richtext';
import { isValidTiendaSlug, readTiendaAuthToken, slugifyTiendaValue } from '@/markket/helpers.tienda';

type BlogEditorFormProps = {
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
    coverDocumentId?: string;
    tagIds?: number[];
    initialSEO?: Record<string, unknown>;
  };
};

type BlogFormValues = {
  title: string;
  slug: string;
  content: RichTextValue;
  seoTitle: string;
  seoDescription: string;
};

export default function BlogEditorForm({ storeSlug, mode, itemDocumentId, initial }: BlogEditorFormProps) {
  const router = useRouter();
  const store = useStore();

  const form = useForm<BlogFormValues>({
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
  const [slugTouched, setSlugTouched] = useState(Boolean(initial?.slug));
  const [isDirty, setIsDirty] = useState(false);
  const savedSnapshotRef = useRef<BlogFormValues>({ ...form.values });

  const storeRef = useMemo(
    () => store.documentId || store.slug || storeSlug,
    [store.documentId, store.slug, storeSlug],
  );

  // Track dirty state
  useEffect(() => {
    const isDifferent =
      form.values.title !== savedSnapshotRef.current.title ||
      form.values.slug !== savedSnapshotRef.current.slug ||
      form.values.seoTitle !== savedSnapshotRef.current.seoTitle ||
      form.values.seoDescription !== savedSnapshotRef.current.seoDescription ||
      JSON.stringify(form.values.content) !== JSON.stringify(savedSnapshotRef.current.content);
    setIsDirty(isDifferent);
  }, [
    form.values.title,
    form.values.slug,
    form.values.seoTitle,
    form.values.seoDescription,
    form.values.content,
  ]);

  // Auto-derive slug from title until manually touched
  useEffect(() => {
    if (slugTouched) return;
    const nextSlug = slugifyTiendaValue(form.values.title);
    if (form.values.slug !== nextSlug) {
      form.setFieldValue('slug', nextSlug);
    }
  }, [form.values.title, form.values.slug, slugTouched]);

  const handleSubmit = async () => {
    const token = readTiendaAuthToken();

    if (!token) {
      notifications.show({
        title: 'Session expired',
        message: 'Please sign in again.',
        color: 'red',
      });
      return;
    }

    const validation = form.validate();
    if (validation.hasErrors) {
      notifications.show({
        title: 'Please review the form',
        message: 'Some fields need attention before saving.',
        color: 'orange',
      });
      return;
    }

    const nextSlug = slugifyTiendaValue(form.values.slug || form.values.title);
    if (!nextSlug) {
      notifications.show({
        title: 'Slug required',
        message: 'A valid slug is required.',
        color: 'orange',
      });
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

    if (initial?.tagIds && initial.tagIds.length > 0) {
      payload.Tags = initial.tagIds.map((id) => ({ id }));
    }

    try {
      setIsSubmitting(true);

      const response = mode === 'new'
        ? await tiendaClient.createContent(storeRef, 'article', payload, { token })
        : await tiendaClient.updateContent(storeRef, 'article', itemDocumentId || '', payload, { token });

      console.log('[blog save] sent SEO.socialImage:', (payload.SEO as Record<string, unknown>)?.socialImage ?? 'omitted (no id)');
      console.log('[blog save] returned SEO.socialImage:', response?.data?.SEO?.socialImage ?? 'missing in response');

      if (!response || (response?.status && response.status >= 400)) {
        throw new Error(response?.message || `Server error: ${response?.status || 'unknown'}`);
      }

      let responseDocumentId = response?.data?.documentId || itemDocumentId || nextSlug;

      if (mode === 'edit' && !response?.data) {
        const verification = await tiendaClient.getContent(storeRef, 'article', responseDocumentId, {
          token,
          query: { status: 'all' },
        });

        if (!verification || (verification?.status && verification.status >= 400) || !verification?.data) {
          throw new Error('Save response was empty and verification failed. Please try saving again.');
        }

        const verifiedArticle = verification.data as { documentId?: string; Title?: string; slug?: string };
        if (
          (verifiedArticle?.Title && verifiedArticle.Title !== payload.Title)
          || (verifiedArticle?.slug && verifiedArticle.slug !== payload.slug)
        ) {
          throw new Error('Save did not persist latest changes yet. Please try again.');
        }

        responseDocumentId = verifiedArticle.documentId || responseDocumentId;
      }

      savedSnapshotRef.current = {
        ...form.values,
        slug: nextSlug,
      };
      setIsDirty(false);

      notifications.show({
        title: 'Saved',
        message: `Article "${form.values.title}" saved successfully.`,
        color: 'green',
        autoClose: 3000,
      });

      const destination = mode === 'new'
        ? `/tienda/${storeSlug}/blog/${responseDocumentId}?created=1`
        : `/tienda/${storeSlug}/blog/${responseDocumentId}`;

      router.replace(destination);
      router.refresh();
    } catch (error) {
      notifications.show({
        title: 'Save failed',
        message: error instanceof Error ? error.message : 'Could not save article.',
        color: 'red',
        autoClose: 8000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Stack gap="md" className="tienda-editor-form">
      <TextInput
        label="Title"
        value={form.values.title}
        onChange={(event) => form.setFieldValue('title', event.currentTarget.value)}
        placeholder="Article title"
        required
        error={form.errors.title}
        rightSection={form.values.title ? <CloseButton size="sm" onClick={() => form.setFieldValue('title', '')} aria-label="Clear title" /> : null}
      />
      <TextInput
        label="Slug"
        value={form.values.slug}
        onChange={(event) => {
          setSlugTouched(true);
          form.setFieldValue('slug', event.currentTarget.value);
        }}
        placeholder="article-slug"
        required
        error={form.errors.slug}
        description={
          form.values.slug ? (
            <span style={{ fontFamily: 'monospace' }}>
              /{storeSlug}/blog/<strong>{form.values.slug}</strong>
            </span>
          ) : undefined
        }
      />
      <ContentEditor
        value={form.values.content}
        onChange={(value) => form.setFieldValue('content', value)}
        label="Content"
        format="blocks"
        minHeight={400}
        placeholder="Write your article content..."
      />
      <TextInput
        label="SEO Title"
        value={form.values.seoTitle}
        onChange={(event) => form.setFieldValue('seoTitle', event.currentTarget.value)}
        placeholder="SEO title (optional)"
        error={form.errors.seoTitle}
        description={`${60 - (form.values.seoTitle || form.values.title || '').length} characters remaining`}
        rightSection={form.values.seoTitle ? <CloseButton size="sm" onClick={() => form.setFieldValue('seoTitle', '')} aria-label="Clear SEO title" /> : null}
      />

      <Text size="xs" c="dimmed">
        Cover and social image uploads are handled in the article preview Image Manager.
      </Text>

      <TextInput
        label="SEO Description"
        value={form.values.seoDescription}
        onChange={(event) => form.setFieldValue('seoDescription', event.currentTarget.value)}
        placeholder="SEO description (optional)"
        error={form.errors.seoDescription}
        description={`${160 - (form.values.seoDescription || '').length} characters remaining`}
        rightSection={form.values.seoDescription ? <CloseButton size="sm" onClick={() => form.setFieldValue('seoDescription', '')} aria-label="Clear SEO description" /> : null}
      />

      <Group justify="space-between" className="tienda-form-actions">
        <Group>
          <Button component="a" variant="subtle" href={mode === 'edit' && itemDocumentId ? `/tienda/${storeSlug}/blog/${itemDocumentId}` : `/tienda/${storeSlug}/blog`}>
            Cancel
          </Button>
        </Group>

        <Button
          onClick={handleSubmit}
          loading={isSubmitting}
          disabled={!isDirty}
          variant={isDirty ? 'filled' : 'light'}
        >
          {mode === 'new' ? 'Create Article' : 'Save Changes'}
        </Button>
      </Group>
    </Stack>
  );
}
