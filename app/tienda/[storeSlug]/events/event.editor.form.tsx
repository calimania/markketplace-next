'use client';

import { useEffect, useRef, useState } from 'react';
import { Button, Group, Select, Stack, Text, TextInput } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useRouter } from 'next/navigation';
import { tiendaClient } from '@/markket/api.tienda';
import ContentEditor from '@/app/components/ui/form.input.tiptap';
import { useStore } from '../store.provider';
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
    timezone?: string;
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

function browserTimezone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  } catch {
    return 'UTC';
  }
}

const POPULAR_TIMEZONES = [
  'UTC',
  'America/Bogota',
  'America/Lima',
  'America/Mexico_City',
  'America/Los_Angeles',
  'America/New_York',
  'Europe/London',
  'Europe/Madrid',
  'Europe/Paris',
  'Asia/Tokyo',
  'Australia/Sydney',
];

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

function getDefaultEventRange() {
  const now = new Date();
  const start = new Date(now);
  start.setDate(now.getDate() + 7);
  start.setHours(17, 0, 0, 0);

  const end = new Date(start);
  end.setHours(19, 0, 0, 0);

  return {
    start: start.toISOString(),
    end: end.toISOString(),
  };
}

function isValidIanaTimezone(value: string) {
  try {
    if (!value.trim()) return true;
    new Intl.DateTimeFormat('en-US', { timeZone: value.trim() }).format(new Date());
    return true;
  } catch {
    return false;
  }
}

export default function EventEditorForm({ storeSlug, mode, itemDocumentId, initial }: EventEditorFormProps) {
  const router = useRouter();
  const store = useStore();
  const autoTimezone = browserTimezone();
  const defaultRange = getDefaultEventRange();

  const [name, setName] = useState(initial?.name || '');
  const [slug, setSlug] = useState(initial?.slug || '');
  const [description, setDescription] = useState(initial?.description || '');
  const [seoTitle, setSeoTitle] = useState(initial?.seoTitle || '');
  const [seoDescription, setSeoDescription] = useState(initial?.seoDescription || '');
  const [sourceUrl, setSourceUrl] = useState(initial?.sourceUrl || '');
  const [startDateInput, setStartDateInput] = useState(
    toDatetimeLocalInput(initial?.startDate || (mode === 'new' ? defaultRange.start : undefined)),
  );
  const [endDateInput, setEndDateInput] = useState(
    toDatetimeLocalInput(initial?.endDate || (mode === 'new' ? defaultRange.end : new Date(Date.now() + 3600000).toISOString())),
  );
  const [timezone, setTimezone] = useState(initial?.timezone || autoTimezone);
  const [showTimezoneEditor, setShowTimezoneEditor] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [slugTouched, setSlugTouched] = useState(Boolean(initial?.slug));
  const savedSnapshotRef = useRef({ name, slug, description, seoTitle, seoDescription, sourceUrl, startDateInput, endDateInput, timezone });
  const [isDirty, setIsDirty] = useState(false);
  const storeRef = store.documentId || store.slug || storeSlug;
  const normalizedTimezone = timezone.trim();
  const hasTimezoneError = !isValidIanaTimezone(normalizedTimezone);

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
      || endDateInput !== snap.endDateInput
      || timezone !== snap.timezone,
    );
  }, [name, slug, description, seoTitle, seoDescription, sourceUrl, startDateInput, endDateInput, timezone]);

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

    if (hasTimezoneError) {
      notifications.show({
        title: 'Invalid timezone',
        message: 'Use a valid IANA timezone, for example America/Los_Angeles or Europe/Berlin.',
        color: 'orange',
      });
      return;
    }

    const payload = {
      Name: name.trim(),
      slug: nextSlug,
      Description: description,
      startDate,
      endDate,
      timezone: normalizedTimezone || undefined,
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

      let responseDocumentId = response?.data?.documentId || itemDocumentId || nextSlug;

      if (mode === 'edit' && !response?.data) {
        const verification = await tiendaClient.getContent(storeRef, 'event', responseDocumentId, {
          token,
          query: { status: 'all' },
        });

        if (!verification || (verification?.status && verification.status >= 400) || !verification?.data) {
          throw new Error('Save response was empty and verification failed. Please try saving again.');
        }

        const verifiedEvent = verification.data as { documentId?: string; Name?: string; slug?: string };
        if (
          (verifiedEvent?.Name && verifiedEvent.Name !== payload.Name)
          || (verifiedEvent?.slug && verifiedEvent.slug !== payload.slug)
        ) {
          throw new Error('Save did not persist latest changes yet. Please try again.');
        }

        responseDocumentId = verifiedEvent.documentId || responseDocumentId;
      }

      savedSnapshotRef.current = { name, slug: nextSlug, description, seoTitle, seoDescription, sourceUrl, startDateInput, endDateInput, timezone };
      setIsDirty(false);

      notifications.show({
        title: 'Saved',
        message: `Event "${name}" saved successfully.`,
        color: 'green',
        autoClose: 3000,
      });

      const destination = mode === 'new'
        ? `/tienda/${storeSlug}/events/${responseDocumentId}?created=1`
        : `/tienda/${storeSlug}/events/${responseDocumentId}`;

      router.replace(destination);
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
        description={
          slug ? (
            <span style={{ fontFamily: 'monospace' }}>
              /{storeSlug}/events/<strong>{slug}</strong>
            </span>
          ) : undefined
        }
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
      <Group justify="space-between" align="end">
        <Stack gap={2}>
          <Text size="sm" fw={500}>Timezone</Text>
          <Text size="sm" c="dimmed">Assumed from browser: {autoTimezone}</Text>
        </Stack>
        <Button
          variant="subtle"
          size="xs"
          onClick={() => setShowTimezoneEditor((prev) => !prev)}
        >
          {showTimezoneEditor ? 'Hide timezone options' : 'Edit timezone'}
        </Button>
      </Group>

      {showTimezoneEditor && (
        <>
          <Select
            label="Timezone (Quick Pick)"
            value={POPULAR_TIMEZONES.includes(timezone) ? timezone : null}
            onChange={(value) => {
              if (value) setTimezone(value);
            }}
            data={POPULAR_TIMEZONES.map((zone) => ({ value: zone, label: zone }))}
            placeholder="Choose a common timezone"
            searchable
            clearable
            description="Pick a common timezone, or set any IANA timezone manually below."
          />

          <TextInput
            label="Timezone"
            value={timezone}
            onChange={(e) => setTimezone(e.currentTarget.value)}
            placeholder="America/Los_Angeles"
            description="Use IANA timezone (for example, America/Los_Angeles or Europe/Berlin)."
            error={hasTimezoneError ? 'Invalid timezone. Please use a valid IANA value.' : undefined}
          />
        </>
      )}

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

        <Button onClick={handleSubmit} loading={isSubmitting} disabled={(!isDirty && mode === 'edit') || hasTimezoneError}>
          {mode === 'new' ? 'Create Event' : 'Save Changes'}
        </Button>
      </Group>
    </Stack>
  );
}
