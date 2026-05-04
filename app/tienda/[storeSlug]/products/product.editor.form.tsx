'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Button, Group, Stack, Text, TextInput } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useRouter } from 'next/navigation';
import { tiendaClient } from '@/markket/api.tienda';
import ContentEditor from '@/app/components/ui/form.input.tiptap';
import { useStore } from '../store.provider';

type ProductEditorFormProps = {
  storeSlug: string;
  mode: 'new' | 'edit';
  itemDocumentId?: string;
  initial?: {
    name?: string;
    slug?: string;
    description?: string;
    seoTitle?: string;
    seoDescription?: string;
    sourceUrl?: string;
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

export default function ProductEditorForm({ storeSlug, mode, itemDocumentId, initial }: ProductEditorFormProps) {
  const router = useRouter();

  const [name, setName] = useState(initial?.name || '');
  const [slug, setSlug] = useState(initial?.slug || '');
  const [description, setDescription] = useState(initial?.description || '');
  const [seoTitle, setSeoTitle] = useState(initial?.seoTitle || '');
  const [seoDescription, setSeoDescription] = useState(initial?.seoDescription || '');
  const [sourceUrl, setSourceUrl] = useState(initial?.sourceUrl || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [slugTouched, setSlugTouched] = useState(Boolean(initial?.slug));
  const savedSnapshotRef = useRef({ name, slug, description, seoTitle, seoDescription, sourceUrl });
  const [isDirty, setIsDirty] = useState(false);

  const store = useStore();
  const storeRef = useMemo(
    () => store.documentId || store.slug || storeSlug,
    [store.documentId, store.slug, storeSlug],
  );

  useEffect(() => {
    if (!slugTouched) {
      setSlug(slugify(name));
    }
  }, [name, slugTouched]);

  useEffect(() => {
    const snap = savedSnapshotRef.current;
    setIsDirty(
      name !== snap.name
      || slug !== snap.slug
      || description !== snap.description
      || seoTitle !== snap.seoTitle
      || seoDescription !== snap.seoDescription
      || sourceUrl !== snap.sourceUrl,
    );
  }, [name, slug, description, seoTitle, seoDescription, sourceUrl]);

  const handleSubmit = async () => {
    const token = readAuthToken();

    if (!token) {
      notifications.show({ title: 'Session expired', message: 'Please sign in again.', color: 'red' });
      return;
    }

    if (!name.trim()) {
      notifications.show({ title: 'Name required', message: 'Add a product name before saving.', color: 'orange' });
      return;
    }

    const nextSlug = slugify(slug || name);
    if (!nextSlug) {
      notifications.show({ title: 'Slug required', message: 'A valid slug is required.', color: 'orange' });
      return;
    }

    const payload = {
      Name: name.trim(),
      slug: nextSlug,
      Description: description,
      SEO: {
        metaTitle: (seoTitle || name).trim().slice(0, 60),
        metaDescription: (seoDescription || '').trim().slice(0, 160),
        metaUrl: sourceUrl.trim() || undefined,
        ...(initial?.seoSocialImageDocumentId
          ? { socialImage: { documentId: initial.seoSocialImageDocumentId } }
          : initial?.seoSocialImageId
            ? { socialImage: initial.seoSocialImageId }
            : {}),
      },
    };

    try {
      setIsSubmitting(true);

      const response = mode === 'new'
        ? await tiendaClient.createContent(storeRef, 'product', payload, { token })
        : await tiendaClient.updateContent(storeRef, 'product', itemDocumentId || '', payload, { token });

      if (!response || (response?.status && response.status >= 400)) {
        throw new Error(response?.message || `Server error: ${response?.status || 'unknown'}`);
      }

      let responseDocumentId = response?.data?.documentId || itemDocumentId || nextSlug;

      if (mode === 'edit' && !response?.data) {
        const verification = await tiendaClient.getContent(storeRef, 'product', responseDocumentId, {
          token,
          query: { status: 'all' },
        });

        if (!verification || (verification?.status && verification.status >= 400) || !verification?.data) {
          throw new Error('Save response was empty and verification failed. Please try saving again.');
        }

        const verifiedProduct = verification.data as { documentId?: string; Name?: string; slug?: string };
        if (
          (verifiedProduct?.Name && verifiedProduct.Name !== payload.Name)
          || (verifiedProduct?.slug && verifiedProduct.slug !== payload.slug)
        ) {
          throw new Error('Save did not persist latest changes yet. Please try again.');
        }

        responseDocumentId = verifiedProduct.documentId || responseDocumentId;
      }

      savedSnapshotRef.current = { name, slug: nextSlug, description, seoTitle, seoDescription, sourceUrl };
      setIsDirty(false);

      notifications.show({
        title: 'Saved',
        message: `Product "${name}" saved successfully.`,
        color: 'green',
        autoClose: 3000,
      });

      const destination = mode === 'new'
        ? `/tienda/${storeSlug}/products/${responseDocumentId}?created=1`
        : `/tienda/${storeSlug}/products/${responseDocumentId}`;

      router.replace(destination);
      router.refresh();
    } catch (error) {
      notifications.show({
        title: 'Save failed',
        message: error instanceof Error ? error.message : 'Could not save product.',
        color: 'red',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Stack gap="sm">
      <TextInput
        label="Name"
        value={name}
        onChange={(e) => setName(e.currentTarget.value)}
        placeholder="Product name"
        required
      />

      <TextInput
        label="Slug"
        value={slug}
        onChange={(e) => {
          setSlugTouched(true);
          setSlug(e.currentTarget.value);
        }}
        placeholder="product-slug"
        required
        description={
          slug ? (
            <span style={{ fontFamily: 'monospace' }}>
              /{storeSlug}/products/<strong>{slug}</strong>
            </span>
          ) : undefined
        }
      />

      <ContentEditor
        value={description}
        onChange={(value) => setDescription(typeof value === 'string' ? value : '')}
        label="Description"
        format="markdown"
        minHeight={320}
        placeholder="Write product description..."
      />

      <TextInput
        label="SEO Title"
        value={seoTitle}
        onChange={(e) => setSeoTitle(e.currentTarget.value)}
        placeholder="SEO title (optional)"
      />

      <TextInput
        label="SEO Description"
        value={seoDescription}
        onChange={(e) => setSeoDescription(e.currentTarget.value)}
        placeholder="SEO description (optional)"
      />

      <TextInput
        label="External Purchase URL"
        value={sourceUrl}
        onChange={(e) => setSourceUrl(e.currentTarget.value)}
        placeholder="https://example.com/buy"
        description="Optional URL for external checkout or marketplace listing."
      />

      <Group justify="space-between">
        <Button component="a" variant="subtle" href={mode === 'edit' && itemDocumentId ? `/tienda/${storeSlug}/products/${itemDocumentId}` : `/tienda/${storeSlug}/products`}>
          Cancel
        </Button>

        <Button onClick={handleSubmit} loading={isSubmitting} disabled={!isDirty && mode === 'edit'}>
          {mode === 'new' ? 'Create Product' : 'Save Changes'}
        </Button>
      </Group>
    </Stack>
  );
}
