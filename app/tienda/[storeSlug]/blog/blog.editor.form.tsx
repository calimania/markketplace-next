'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Button, Group, Stack, Text, TextInput } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useRouter } from 'next/navigation';
import { IconUpload } from '@tabler/icons-react';
import { tiendaClient } from '@/markket/api.tienda';
import { tiptapToStrapiBlocks } from '@/markket/richtext.transform';
import ContentEditor from '@/app/components/ui/form.input.tiptap';
import { useStore } from '../store.provider';
import type { RichTextValue } from '@/markket/richtext';

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
  };
}

function mergeStudioImages(current: StudioImage[], incoming: StudioImage[]) {
  const map = new Map<string, StudioImage>();
  [...current, ...incoming].forEach((img) => {
    const key = `${img.documentId || img.id || img.url}`;
    map.set(key, img);
  });
  return Array.from(map.values());
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

  blocks.push({
    type: 'image',
    image: {
      url: media.url,
      name: media.name || fallbackAlt,
      alternativeText: media.alternativeText || fallbackAlt,
      width: media.width || 0,
      height: media.height || 0,
      formats: media.formats as any,
    },
    children: [{ type: 'text', text: '' }],
  });

  return blocks;
}



export default function BlogEditorForm({ storeSlug, mode, itemDocumentId, initial }: BlogEditorFormProps) {
  const router = useRouter();
  const store = useStore();

  const [title, setTitle] = useState(initial?.title || '');
  const [slug, setSlug] = useState(initial?.slug || '');
  const [content, setContent] = useState<RichTextValue>(initial?.content ?? '');
  const [seoTitle, setSeoTitle] = useState(initial?.seoTitle || '');
  const [seoDescription, setSeoDescription] = useState(initial?.seoDescription || '');
  const [seoSocialImage, setSeoSocialImage] = useState<StudioImage | null>(initial?.seoSocialImage || null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [slugTouched, setSlugTouched] = useState(Boolean(initial?.slug));
  const [isDirty, setIsDirty] = useState(false);
  const [studioImages, setStudioImages] = useState<StudioImage[]>(() => extractImagesFromContent(initial?.content ?? ''));
  const [isUploadingStudioImage, setIsUploadingStudioImage] = useState(false);
  const [isUploadingSeoImage, setIsUploadingSeoImage] = useState(false);
  const savedSnapshotRef = useRef({ title, slug, seoTitle, seoDescription, content });

  const storeRef = useMemo(
    () => store.documentId || store.slug || storeSlug,
    [store.documentId, store.slug, storeSlug],
  );

  // Track dirty state
  useEffect(() => {
    const isDifferent =
      title !== savedSnapshotRef.current.title ||
      slug !== savedSnapshotRef.current.slug ||
      seoTitle !== savedSnapshotRef.current.seoTitle ||
      seoDescription !== savedSnapshotRef.current.seoDescription ||
      JSON.stringify(content) !== JSON.stringify(savedSnapshotRef.current.content);
    setIsDirty(isDifferent);
  }, [title, slug, seoTitle, seoDescription, content]);

  // Auto-derive slug from title until manually touched
  useEffect(() => {
    if (!slugTouched) {
      setSlug(slugify(title));
    }
  }, [title, slugTouched]);

  useEffect(() => {
    const imagesFromContent = extractImagesFromContent(content);
    if (imagesFromContent.length === 0) return;
    setStudioImages((current) => mergeStudioImages(current, imagesFromContent));
  }, [content]);

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
      setContent((current) => appendImageBlock(current, uploaded, uploaded.alternativeText || title || 'Article image'));

      notifications.show({
        title: 'Image uploaded',
        message: 'Added to Article Media Studio and inserted into content.',
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
    setContent((current) => appendImageBlock(current, image, image.alternativeText || title || 'Article image'));
    notifications.show({
      title: 'Inserted image',
      message: 'Image inserted at the end of article content.',
      color: 'blue',
      autoClose: 1600,
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
          contentType: 'article',
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
        message: 'Social image attached to this article.',
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

  const handleSubmit = async () => {
    const token = readAuthToken();

    if (!token) {
      notifications.show({
        title: 'Session expired',
        message: 'Please sign in again.',
        color: 'red',
      });
      return;
    }

    if (!title.trim()) {
      notifications.show({
        title: 'Title required',
        message: 'Add a title before saving.',
        color: 'orange',
      });
      return;
    }

    const nextSlug = slugify(slug || title);
    if (!nextSlug) {
      notifications.show({
        title: 'Slug required',
        message: 'A valid slug is required.',
        color: 'orange',
      });
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

    try {
      setIsSubmitting(true);

      console.log('[BlogEditorForm] sending', mode === 'new' ? 'POST' : 'PUT', {
        storeRef,
        itemDocumentId,
        payloadKeys: Object.keys(payload),
      });

      const response = mode === 'new'
        ? await tiendaClient.createContent(storeRef, 'article', payload, { token })
        : await tiendaClient.updateContent(storeRef, 'article', itemDocumentId || '', payload, { token });

      console.log('[BlogEditorForm] response', response);

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

      savedSnapshotRef.current = { title, slug: nextSlug, seoTitle, seoDescription, content };
      setIsDirty(false);

      notifications.show({
        title: 'Saved',
        message: `Article "${title}" saved successfully.`,
        color: 'green',
        autoClose: 3000,
      });

      const destination = mode === 'new'
        ? `/tienda/${storeSlug}/blog/${responseDocumentId}?created=1`
        : `/tienda/${storeSlug}/blog/${responseDocumentId}`;

      router.replace(destination);
      router.refresh();
    } catch (error) {
      console.error('[BlogEditorForm] save failed', error);
      notifications.show({
        title: 'Save failed',
        message: error instanceof Error ? error.message : 'Could not save article. Check console for details.',
        color: 'red',
        autoClose: 8000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Stack gap="sm">
      <TextInput
        label="Title"
        value={title}
        onChange={(event) => setTitle(event.currentTarget.value)}
        placeholder="Article title"
        required
      />

      <TextInput
        label="Slug"
        value={slug}
        onChange={(event) => {
          setSlugTouched(true);
          setSlug(event.currentTarget.value);
        }}
        placeholder="article-slug"
        required
      />

      <ContentEditor
        value={content}
        onChange={setContent}
        label="Content"
        format="blocks"
        minHeight={400}
        placeholder="Write your article content..."
      />

      <Text size="xs" c="dimmed">
        Image management moved to the preview page for this article to keep editing focused on text.
      </Text>

      <TextInput
        label="SEO Title"
        value={seoTitle}
        onChange={(event) => setSeoTitle(event.currentTarget.value)}
        placeholder="SEO title (optional)"
        description={`${60 - (seoTitle || title || '').length} characters remaining`}
      />

      <Text size="xs" c="dimmed">
        Cover and social image uploads are handled in the article preview Image Manager.
      </Text>

      <TextInput
        label="SEO Description"
        value={seoDescription}
        onChange={(event) => setSeoDescription(event.currentTarget.value)}
        placeholder="SEO description (optional)"
        description={`${160 - (seoDescription || '').length} characters remaining`}
      />

      <Group justify="space-between">
        <Group>
          <Button component="a" variant="subtle" href={`/tienda/${storeSlug}/blog`}>
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
