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
    seoSocialImage?: StudioImage | null;
  };
};

type StudioImage = {
  id?: string | number;
  documentId?: string;
  url: string;
  name?: string;
  alternativeText?: string;
  width?: number;
  height?: number;
  formats?: Record<string, unknown>;
  hash?: string;
  ext?: string;
  mime?: string;
  size?: number;
  provider?: string;
  createdAt?: string;
  updatedAt?: string;
  caption?: string;
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

function pickMediaUrl(media: Partial<StudioImage> | undefined) {
  if (!media) return '';
  const formats = media.formats as Record<string, any> | undefined;
  return formats?.medium?.url || formats?.small?.url || formats?.thumbnail?.url || media.url || '';
}

function normalizeStudioImage(value: any): StudioImage | null {
  if (!value || typeof value !== 'object') return null;
  const url = pickMediaUrl(value);
  if (!url) return null;

  return {
    id: value.id,
    documentId: value.documentId,
    url: value.url || url,
    name: value.name,
    alternativeText: value.alternativeText,
    width: value.width,
    height: value.height,
    formats: value.formats,
    hash: value.hash,
    ext: value.ext,
    mime: value.mime,
    size: value.size,
    provider: value.provider,
    createdAt: value.createdAt,
    updatedAt: value.updatedAt,
    caption: value.caption,
  };
}

function mergeStudioImages(current: StudioImage[], incoming: StudioImage[]) {
  const map = new Map<string, StudioImage>();
  [...current, ...incoming].forEach((img) => {
    const key = `${img.documentId || img.id || img.url}`;
    map.set(key, img);
  });
  return Array.from(map.values()).sort((a, b) => {
    const aTime = a.createdAt ? Date.parse(a.createdAt) : 0;
    const bTime = b.createdAt ? Date.parse(b.createdAt) : 0;
    return bTime - aTime;
  });
}

function extractImagesFromContent(value: RichTextValue): StudioImage[] {
  if (!Array.isArray(value)) return [];

  const images: StudioImage[] = [];
  value.forEach((block: any) => {
    if (block?.type === 'image') {
      const normalized = normalizeStudioImage(block.image || block);
      if (normalized) images.push(normalized);
    }
  });
  return images;
}

function appendImageBlock(content: RichTextValue, media: StudioImage, fallbackAlt = 'Image'): RichTextValue {
  const blocks = Array.isArray(content) ? [...content] : [];
  const imageName = media.name || fallbackAlt;
  const imageAlt = media.alternativeText || fallbackAlt;
  const imageWidth = typeof media.width === 'number' ? media.width : 0;
  const imageHeight = typeof media.height === 'number' ? media.height : 0;
  const imageFormats = media.formats || {};

  blocks.push({
    type: 'image',
    image: {
      url: media.url,
      name: imageName,
      alternativeText: imageAlt,
      width: imageWidth,
      height: imageHeight,
      formats: imageFormats as any,
      hash: media.hash || '',
      ext: media.ext || '',
      mime: media.mime || '',
      size: typeof media.size === 'number' ? media.size : 0,
      provider: media.provider || 'local',
      createdAt: media.createdAt || new Date().toISOString(),
      updatedAt: media.updatedAt || new Date().toISOString(),
    },
    children: [{ type: 'text', text: '' }],
  });

  return blocks;
}

export default function PageEditorForm({ storeSlug, mode, itemDocumentId, initial }: PageEditorFormProps) {
  const router = useRouter();
  const store = useStore();

  const [title, setTitle] = useState(initial?.title || '');
  const [slug, setSlug] = useState(initial?.slug || '');
  const [content, setContent] = useState<RichTextValue>(initial?.content ?? '');
  const [seoTitle, setSeoTitle] = useState(initial?.seoTitle || '');
  const [seoDescription, setSeoDescription] = useState(initial?.seoDescription || '');
  const [seoSocialImage, setSeoSocialImage] = useState<StudioImage | null>(initial?.seoSocialImage || null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [slugTouched, setSlugTouched] = useState(Boolean(initial?.slug));
  const [studioImages, setStudioImages] = useState<StudioImage[]>(() => extractImagesFromContent(initial?.content ?? ''));
  const [isUploadingStudioImage, setIsUploadingStudioImage] = useState(false);
  const [isUploadingSeoImage, setIsUploadingSeoImage] = useState(false);

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

  useEffect(() => {
    const imagesFromContent = extractImagesFromContent(content);
    if (imagesFromContent.length === 0) return;
    setStudioImages((current) => mergeStudioImages(current, imagesFromContent));
  }, [content]);

  useEffect(() => {
    if (!seoSocialImage) return;
    setStudioImages((current) => mergeStudioImages(current, [seoSocialImage]));
  }, [seoSocialImage]);

  const handleUploadToStudio = async (file: File | null) => {
    if (!file) return;

    const token = readAuthToken();

    if (!token) {
      notifications.show({ title: 'Session expired', message: 'Please sign in again to upload images.', color: 'red' });
      return;
    }

    try {
      setIsUploadingStudioImage(true);

      const upload = await tiendaClient.uploadStoreMedia(storeRef, {
        token,
        files: [file],
        alternativeText: title?.trim() || file.name,
      });

      if (!upload?.ok) {
        throw new Error(upload?.message || upload?.text || 'Upload failed');
      }

      const uploaded = normalizeStudioImage(upload?.data?.[0]);
      if (!uploaded) {
        throw new Error('Upload succeeded but no image URL returned');
      }

      setStudioImages((current) => mergeStudioImages(current, [uploaded]));
      setContent((current) => appendImageBlock(current, uploaded, uploaded.alternativeText || title || 'Page image'));

      notifications.show({
        title: 'Image uploaded',
        message: 'Added to Page Media Studio and inserted into content.',
        color: 'green',
      });
    } catch (error) {
      notifications.show({
        title: 'Upload failed',
        message: error instanceof Error ? error.message : 'Please try again.',
        color: 'red',
      });
    } finally {
      setIsUploadingStudioImage(false);
    }
  };

  const handleInsertFromStudio = (image: StudioImage) => {
    setContent((current) => appendImageBlock(current, image, image.alternativeText || title || 'Page image'));
    notifications.show({
      title: 'Inserted image',
      message: 'Image inserted at the end of page content.',
      color: 'blue',
      autoClose: 1600,
    });
  };

  const handleUseAsSeoPreview = (image: StudioImage) => {
    setSeoSocialImage(image);
    notifications.show({
      title: 'SEO preview updated',
      message: 'This image is now used as the SEO preview image in the editor.',
      color: 'grape',
      autoClose: 1800,
    });
  };

  const handleUploadSeoSocialImage = async (file: File | null) => {
    if (!file || !itemDocumentId) return;

    const token = readAuthToken();

    if (!token) {
      notifications.show({ title: 'Session expired', message: 'Please sign in again to upload images.', color: 'red' });
      return;
    }

    try {
      setIsUploadingSeoImage(true);
      const upload = await tiendaClient.uploadStoreMedia(storeRef, {
        token,
        files: [file],
        alternativeText: seoTitle || title || file.name,
        attach: {
          contentType: 'page',
          itemId: itemDocumentId,
          field: 'SEO.socialImage',
          mode: 'replace',
        },
      });

      if (!upload?.ok) {
        throw new Error(upload?.message || upload?.text || 'Upload failed');
      }

      const uploaded = normalizeStudioImage(upload?.data?.[0]);
      if (!uploaded) {
        throw new Error('Upload succeeded but no image URL returned');
      }

      setSeoSocialImage(uploaded);
      setStudioImages((current) => mergeStudioImages(current, [uploaded]));

      notifications.show({
        title: 'SEO image updated',
        message: 'Social image attached to this page.',
        color: 'green',
      });
    } catch (error) {
      notifications.show({
        title: 'Upload failed',
        message: error instanceof Error ? error.message : 'Please try again.',
        color: 'red',
      });
    } finally {
      setIsUploadingSeoImage(false);
    }
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
    router.push(`/tienda/${storeSlug}/pages`);
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
  const displayedSeoImage = seoSocialImage || studioImages[0] || null;

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
          description={`/${slug || '…'}`}
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
