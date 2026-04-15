'use client';

import { useEffect, useRef, useState } from 'react';
import { Button, Group, Stack, Text, TextInput } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useRouter } from 'next/navigation';
import { tiendaClient } from '@/markket/api.tienda';
import ContentEditor from '@/app/components/ui/form.input.tiptap';
import type { Event } from '@/markket/event.d';

type EventEditorFormProps = {
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
    startDate?: string;
    endDate?: string;
    thumbnailUrl?: string;
    socialImageUrl?: string;
    slides?: Event['Slides'];
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

function toDatetimeLocalInput(value?: string) {
  const parsed = value ? new Date(value) : new Date();
  if (Number.isNaN(parsed.getTime())) {
    const fallback = new Date();
    return `${fallback.getFullYear()}-${String(fallback.getMonth() + 1).padStart(2, '0')}-${String(fallback.getDate()).padStart(2, '0')}T${String(fallback.getHours()).padStart(2, '0')}:${String(fallback.getMinutes()).padStart(2, '0')}`;
  }

  return `${parsed.getFullYear()}-${String(parsed.getMonth() + 1).padStart(2, '0')}-${String(parsed.getDate()).padStart(2, '0')}T${String(parsed.getHours()).padStart(2, '0')}:${String(parsed.getMinutes()).padStart(2, '0')}`;
}

function toIsoString(value: string) {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? '' : parsed.toISOString();
}

export default function EventEditorForm({ storeSlug, mode, itemDocumentId, initial }: EventEditorFormProps) {
  const router = useRouter();

  const [name, setName] = useState(initial?.name || '');
  const [slug, setSlug] = useState(initial?.slug || '');
  const [description, setDescription] = useState(initial?.description || '');
  const [seoTitle, setSeoTitle] = useState(initial?.seoTitle || '');
  const [seoDescription, setSeoDescription] = useState(initial?.seoDescription || '');
  const [sourceUrl, setSourceUrl] = useState(initial?.sourceUrl || '');
  const [startDateInput, setStartDateInput] = useState(toDatetimeLocalInput(initial?.startDate));
  const [endDateInput, setEndDateInput] = useState(toDatetimeLocalInput(initial?.endDate || new Date(Date.now() + 3600000).toISOString()));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [slugTouched, setSlugTouched] = useState(Boolean(initial?.slug));
  const savedSnapshotRef = useRef({ name, slug, description, seoTitle, seoDescription, sourceUrl, startDateInput, endDateInput });
  const [isDirty, setIsDirty] = useState(false);
  const storeRef = storeSlug;

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
      || sourceUrl !== snap.sourceUrl
      || startDateInput !== snap.startDateInput
      || endDateInput !== snap.endDateInput,
    );
  }, [name, slug, description, seoTitle, seoDescription, sourceUrl, startDateInput, endDateInput]);

  const handleSubmit = async () => {
    const token = readAuthToken();

    if (!token) {
      notifications.show({ title: 'Session expired', message: 'Please sign in again.', color: 'red' });
      return;
    }

    if (!name.trim()) {
      notifications.show({ title: 'Name required', message: 'Add an event name before saving.', color: 'orange' });
      return;
    }

    const nextSlug = slugify(slug || name);
    if (!nextSlug) {
      notifications.show({ title: 'Slug required', message: 'A valid slug is required.', color: 'orange' });
      return;
    }

    const startDate = toIsoString(startDateInput);
    const endDate = toIsoString(endDateInput);

    if (!startDate || !endDate) {
      notifications.show({ title: 'Date required', message: 'Please provide valid start and end dates.', color: 'orange' });
      return;
    }

    if (new Date(endDate).getTime() <= new Date(startDate).getTime()) {
      notifications.show({ title: 'Invalid range', message: 'End date must be after start date.', color: 'orange' });
      return;
    }

    const payload = {
      Name: name.trim(),
      slug: nextSlug,
      Description: description,
      startDate,
      endDate,
      SEO: {
        metaTitle: (seoTitle || name).trim().slice(0, 60),
        metaDescription: (seoDescription || '').trim().slice(0, 160),
        metaUrl: sourceUrl.trim() || undefined,
      },
    };

    try {
      setIsSubmitting(true);

      const response = mode === 'new'
        ? await tiendaClient.createContent(storeRef, 'event', payload, { token })
        : await tiendaClient.updateContent(storeRef, 'event', itemDocumentId || '', payload, { token });

      if (!response || (response?.status && response.status >= 400)) {
        throw new Error(response?.message || `Server error: ${response?.status || 'unknown'}`);
      }

      savedSnapshotRef.current = { name, slug: nextSlug, description, seoTitle, seoDescription, sourceUrl, startDateInput, endDateInput };
      setIsDirty(false);

      notifications.show({
        title: 'Saved',
        message: `Event "${name}" saved successfully.`,
        color: 'green',
        autoClose: 3000,
      });

      const responseDocumentId = response?.data?.documentId || itemDocumentId || nextSlug;
      router.push(`/tienda/${storeSlug}/events/${responseDocumentId}`);
      router.refresh();
    } catch (error) {
      notifications.show({
        title: 'Save failed',
        message: error instanceof Error ? error.message : 'Could not save event.',
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
        placeholder="Event name"
        required
      />

      <TextInput
        label="Slug"
        value={slug}
        onChange={(e) => {
          setSlugTouched(true);
          setSlug(e.currentTarget.value);
        }}
        placeholder="event-slug"
        required
      />

      <Group grow>
        <TextInput
          label="Start Date & Time"
          type="datetime-local"
          value={startDateInput}
          onChange={(e) => setStartDateInput(e.currentTarget.value)}
          required
        />
        <TextInput
          label="End Date & Time"
          type="datetime-local"
          value={endDateInput}
          onChange={(e) => setEndDateInput(e.currentTarget.value)}
          required
        />
      </Group>

      <ContentEditor
        value={description}
        onChange={(value) => setDescription(typeof value === 'string' ? value : '')}
        label="Description"
        format="markdown"
        minHeight={320}
        placeholder="Write event description..."
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
        label="Source URL (External RSVP)"
        value={sourceUrl}
        onChange={(e) => setSourceUrl(e.currentTarget.value)}
        placeholder="https://example.com/rsvp"
        description="Used as the external RSVP link on the event page."
      />

      <Text size="xs" c="dimmed">
        Tip: Text edits happen here. Manage images and special media fields from the event preview page.
      </Text>

      <Group justify="space-between">
        <Button component="a" variant="subtle" href={`/tienda/${storeSlug}/events`}>
          Cancel
        </Button>

        <Button onClick={handleSubmit} loading={isSubmitting} disabled={!isDirty && mode === 'edit'}>
          {mode === 'new' ? 'Create Event' : 'Save Changes'}
        </Button>
      </Group>
    </Stack>
  );
}
