'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Accordion, Badge, Button, Group, Stack, Text, TextInput, Textarea,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useRouter } from 'next/navigation';
import { IconSearch, IconAlertTriangle } from '@tabler/icons-react';
import { tiendaClient } from '@/markket/api.tienda';
import { tiptapToStrapiBlocks } from '@/markket/richtext.transform';
import ContentEditor from '@/app/components/ui/form.input.tiptap';
import { useStore } from '../store.provider';
import type { RichTextValue } from '@/markket/richtext';

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
  };
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

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export default function PageEditorForm({ storeSlug, mode, itemDocumentId, initial }: PageEditorFormProps) {
  const router = useRouter();
  const store = useStore();

  const [title, setTitle] = useState(initial?.title || '');
  const [slug, setSlug] = useState(initial?.slug || '');
  const [content, setContent] = useState<RichTextValue>(initial?.content ?? '');
  const [seoTitle, setSeoTitle] = useState(initial?.seoTitle || '');
  const [seoDescription, setSeoDescription] = useState(initial?.seoDescription || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [slugTouched, setSlugTouched] = useState(Boolean(initial?.slug));

  // Dirty state: track if there are unsaved changes
  const [isDirty, setIsDirty] = useState(false);
  const savedSnapshotRef = useRef({ title, slug, seoTitle, seoDescription, content });

  const storeRef = useMemo(
    () => store.documentId || store.slug || storeSlug,
    [store.documentId, store.slug, storeSlug],
  );

  // Auto-derive slug from title until manually touched
  useEffect(() => {
    if (!slugTouched) {
      setSlug(slugify(title));
    }
  }, [title, slugTouched]);

  // Mark dirty whenever any field changes after initial load
  useEffect(() => {
    const snap = savedSnapshotRef.current;
    const dirtyTitle = title !== snap.title;
    const dirtySlug = slug !== snap.slug;
    const dirtySeoTitle = seoTitle !== snap.seoTitle;
    const dirtySeoDesc = seoDescription !== snap.seoDescription;
    const dirtyContent = JSON.stringify(content) !== JSON.stringify(snap.content);

    setIsDirty(dirtyTitle || dirtySlug || dirtySeoTitle || dirtySeoDesc || dirtyContent);
  }, [title, slug, seoTitle, seoDescription, content]);

  // Track content changes (no-op now, dirty is handled by effect above)
  const handleContentChange = (value: RichTextValue) => {
    console.log('[PageEditorForm] content changed', { valueType: typeof value, isArray: Array.isArray(value), length: Array.isArray(value) ? value.length : String(value).length });
    setContent(value);
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
    const token = readAuthToken();

    console.log('[PageEditorForm] handleSubmit fired', { mode, storeRef, itemDocumentId, hasToken: !!token });

    if (!token) {
      notifications.show({
        title: 'Session expired',
        message: 'Please sign in again to save.',
        color: 'red',
        autoClose: 5000,
      });
      return;
    }

    if (!title.trim()) {
      notifications.show({ title: 'Title required', message: 'Add a title before saving.', color: 'orange' });
      return;
    }

    const nextSlug = slugify(slug || title);
    if (!nextSlug) {
      notifications.show({ title: 'Slug required', message: 'A valid slug is required.', color: 'orange' });
      return;
    }

    const payload = {
      Title: title.trim(),
      slug: nextSlug,
      Content: tiptapToStrapiBlocks(content),
      SEO: {
        metaTitle: (seoTitle || title).trim().slice(0, 60),
        metaDescription: (seoDescription || '').trim().slice(0, 160),
        ...(initial?.seoSocialImageDocumentId
          ? { socialImage: { documentId: initial.seoSocialImageDocumentId } }
          : initial?.seoSocialImageId
            ? { socialImage: initial.seoSocialImageId }
            : {}),
      },
    };

    console.log('[PageEditorForm] payload about to send', {
      Title: payload.Title,
      slug: payload.slug,
      contentType: typeof payload.Content,
      contentLength: Array.isArray(payload.Content) ? payload.Content.length : String(payload.Content).length,
      contentSample: Array.isArray(payload.Content) ? payload.Content.slice(0, 1) : payload.Content,
      SEO: payload.SEO
    });

    try {
      setIsSubmitting(true);

      console.log('[PageEditorForm] sending', mode === 'new' ? 'POST' : 'PUT', { storeRef, itemDocumentId, payloadKeys: Object.keys(payload) });

      const response = mode === 'new'
        ? await tiendaClient.createContent(storeRef, 'page', payload, { token })
        : await tiendaClient.updateContent(storeRef, 'page', itemDocumentId || '', payload, { token });

      console.log('[PageEditorForm] response', response);

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

      savedSnapshotRef.current = { title, slug: nextSlug, seoTitle, seoDescription, content };
      setIsDirty(false);
      setIsSaved(true);

      notifications.show({
        title: 'Saved',
        message: `Page "${title}" saved successfully.`,
        color: 'green',
        autoClose: 3000,
      });

      const destination = mode === 'new'
        ? `/tienda/${storeSlug}/pages/${responseDocumentId}?created=1`
        : `/tienda/${storeSlug}/pages/${responseDocumentId}`;

      router.replace(destination);
      router.refresh();
    } catch (error) {
      console.error('[PageEditorForm] save failed', error);
      notifications.show({
        title: 'Save failed',
        message: error instanceof Error ? error.message : 'Could not save page. Check console for details.',
        color: 'red',
        autoClose: 8000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const descRemaining = 160 - (seoDescription || '').length;
  const titleRemaining = 60 - (seoTitle || title || '').length;

  return (
    <Stack gap="md">
      {/* Title + slug row */}
      <Group align="flex-end" grow>
        <TextInput
          label="Title"
          value={title}
          onChange={(e) => { setTitle(e.currentTarget.value); }}
          placeholder="Page title"
          required
          style={{ flex: 2 }}
        />
        <TextInput
          label="Slug"
          value={slug}
          onChange={(e) => {
            setSlugTouched(true);
            setSlug(e.currentTarget.value);
          }}
          placeholder="page-slug"
          required
          description={
            slug ? (
              <span style={{ fontFamily: 'monospace' }}>
                /{storeSlug}/<strong>{slug}</strong>
              </span>
            ) : undefined
          }
          style={{ flex: 1 }}
        />
      </Group>

      {/* Rich text */}
      <ContentEditor
        label="Content"
        value={content}
        onChange={handleContentChange}
        format="blocks"
        placeholder="Start writing your page…"
        minHeight={320}
      />

      <Text size="xs" c="dimmed">
        Image management moved to the preview page for this entry to keep editing focused on text.
      </Text>

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
                value={seoTitle}
                onChange={(e) => setSeoTitle(e.currentTarget.value)}
                placeholder={title || 'SEO title'}
                description={`${Math.max(0, titleRemaining)} chars remaining (60 max)`}
                error={titleRemaining < 0 ? 'Over 60 character limit' : undefined}
              />
              <Textarea
                label="Meta Description"
                value={seoDescription}
                onChange={(e) => setSeoDescription(e.currentTarget.value)}
                placeholder="Brief description for search engines…"
                minRows={3}
                autosize
                description={`${Math.max(0, descRemaining)} chars remaining (160 max)`}
                error={descRemaining < 0 ? 'Over 160 character limit' : undefined}
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
