'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Button, CloseButton, Group, Stack, Text, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { useRouter } from 'next/navigation';
import { tiendaClient } from '@/markket/api.tienda';
import ContentEditor from '@/app/components/ui/form.input.tiptap';
import { useStore } from '../store.provider';
import {
  isValidOptionalHttpUrl,
  isValidTiendaSlug,
  readTiendaAuthToken,
  slugifyTiendaValue,
} from '@/markket/helpers.tienda';

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
    thumbnailDocumentId?: string;
    tagIds?: number[];
    slideDocumentIds?: number[];
    initialSEO?: Record<string, unknown>;
  };
};

type ProductFormValues = {
  name: string;
  slug: string;
  description: string;
  seoTitle: string;
  seoDescription: string;
  sourceUrl: string;
};

export default function ProductEditorForm({ storeSlug, mode, itemDocumentId, initial }: ProductEditorFormProps) {
  const router = useRouter();

  const form = useForm<ProductFormValues>({
    validateInputOnBlur: true,
    initialValues: {
      name: initial?.name || '',
      slug: initial?.slug || '',
      description: initial?.description || '',
      seoTitle: initial?.seoTitle || '',
      seoDescription: initial?.seoDescription || '',
      sourceUrl: initial?.sourceUrl || '',
    },
    validate: {
      name: (value) => (value.trim() ? null : 'Name is required.'),
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
      sourceUrl: (value) => {
        return isValidOptionalHttpUrl(value) ? null : 'Use a valid URL starting with http:// or https://';
      },
    },
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [slugTouched, setSlugTouched] = useState(Boolean(initial?.slug));
  const savedSnapshotRef = useRef<ProductFormValues>({ ...form.values });
  const [isDirty, setIsDirty] = useState(false);

  const store = useStore();
  const storeRef = useMemo(
    () => store.documentId || store.slug || storeSlug,
    [store.documentId, store.slug, storeSlug],
  );

  useEffect(() => {
    if (slugTouched) return;
    const nextSlug = slugifyTiendaValue(form.values.name);
    if (form.values.slug !== nextSlug) {
      form.setFieldValue('slug', nextSlug);
    }
  }, [form.values.name, form.values.slug, slugTouched]);

  useEffect(() => {
    const snap = savedSnapshotRef.current;
    setIsDirty(
      form.values.name !== snap.name
      || form.values.slug !== snap.slug
      || form.values.description !== snap.description
      || form.values.seoTitle !== snap.seoTitle
      || form.values.seoDescription !== snap.seoDescription
      || form.values.sourceUrl !== snap.sourceUrl,
    );
  }, [
    form.values.name,
    form.values.slug,
    form.values.description,
    form.values.seoTitle,
    form.values.seoDescription,
    form.values.sourceUrl,
  ]);

  const handleSubmit = async () => {
    const token = readTiendaAuthToken();

    if (!token) {
      notifications.show({ title: 'Session expired', message: 'Please sign in again.', color: 'red' });
      return;
    }

    const validation = form.validate();
    if (validation.hasErrors) {
      notifications.show({ title: 'Please review the form', message: 'Some fields need attention before saving.', color: 'orange' });
      return;
    }

    const nextSlug = slugifyTiendaValue(form.values.slug || form.values.name);
    if (!nextSlug) {
      notifications.show({ title: 'Slug required', message: 'A valid slug is required.', color: 'orange' });
      return;
    }

    const payload: Record<string, unknown> = {
      Name: form.values.name.trim(),
      slug: nextSlug,
      Description: form.values.description,
      // Thumbnail is managed via the Image Manager on the preview page, not here
      SEO: {
        ...(initial?.initialSEO
          ? Object.fromEntries(Object.entries(initial.initialSEO).filter(([k]) => k !== 'socialImage' && k !== 'id' && k !== 'documentId'))
          : {}),
        metaTitle: (form.values.seoTitle || form.values.name).trim().slice(0, 60),
        metaDescription: (form.values.seoDescription || '').trim().slice(0, 160),
        metaUrl: form.values.sourceUrl.trim() || undefined,
        ...(initial?.seoSocialImageId
          ? { socialImage: { id: initial.seoSocialImageId } }
          : {}),
      },
    };

    if (initial?.tagIds && initial.tagIds.length > 0) {
      payload.Tag = initial.tagIds.map((id) => ({ id }));
    }
    if (initial?.slideDocumentIds && initial.slideDocumentIds.length > 0) {
      payload.Slides = initial.slideDocumentIds.map((id) => ({ id }));
    }

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

      savedSnapshotRef.current = {
        ...form.values,
        slug: nextSlug,
      };
      setIsDirty(false);

      notifications.show({
        title: 'Saved',
        message: `Product "${form.values.name}" saved successfully.`,
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
    <Stack gap="md" className="tienda-editor-form">
      <TextInput
        label="Name"
        value={form.values.name}
        onChange={(e) => form.setFieldValue('name', e.currentTarget.value)}
        placeholder="Product name"
        required
        error={form.errors.name}
        rightSection={form.values.name ? <CloseButton size="sm" onClick={() => form.setFieldValue('name', '')} aria-label="Clear name" /> : null}
      />

      <TextInput
        label="Slug"
        value={form.values.slug}
        onChange={(e) => {
          setSlugTouched(true);
          form.setFieldValue('slug', e.currentTarget.value);
        }}
        placeholder="product-slug"
        required
        error={form.errors.slug}
        description={
          form.values.slug ? (
            <span style={{ fontFamily: 'monospace' }}>
              /{storeSlug}/products/<strong>{form.values.slug}</strong>
            </span>
          ) : undefined
        }
      />

      <ContentEditor
        value={form.values.description}
        onChange={(value) => form.setFieldValue('description', typeof value === 'string' ? value : '')}
        label="Description"
        format="markdown"
        minHeight={320}
        placeholder="Write product description..."
      />

      <TextInput
        label="SEO Title"
        value={form.values.seoTitle}
        onChange={(e) => form.setFieldValue('seoTitle', e.currentTarget.value)}
        placeholder="SEO title (optional)"
        error={form.errors.seoTitle}
        rightSection={form.values.seoTitle ? <CloseButton size="sm" onClick={() => form.setFieldValue('seoTitle', '')} aria-label="Clear SEO title" /> : null}
      />

      <TextInput
        label="SEO Description"
        value={form.values.seoDescription}
        onChange={(e) => form.setFieldValue('seoDescription', e.currentTarget.value)}
        placeholder="SEO description (optional)"
        error={form.errors.seoDescription}
        rightSection={form.values.seoDescription ? <CloseButton size="sm" onClick={() => form.setFieldValue('seoDescription', '')} aria-label="Clear SEO description" /> : null}
      />

      <TextInput
        label="External Purchase URL"
        value={form.values.sourceUrl}
        onChange={(e) => form.setFieldValue('sourceUrl', e.currentTarget.value)}
        placeholder="https://example.com/buy"
        description="Optional URL for external checkout or marketplace listing."
        error={form.errors.sourceUrl}
        rightSection={form.values.sourceUrl ? <CloseButton size="sm" onClick={() => form.setFieldValue('sourceUrl', '')} aria-label="Clear URL" /> : null}
      />

      <Group justify="space-between" className="tienda-form-actions">
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
