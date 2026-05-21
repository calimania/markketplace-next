'use client';

import { useEffect, useRef, useState } from 'react';
import { Button, CloseButton, Group, Select, Stack, Text, TextInput } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useRouter } from 'next/navigation';
import { tiendaClient } from '@/markket/api.tienda';
import ContentEditor from '@/app/components/ui/form.input.tiptap';
import { useStore } from '../store.provider';
import type { Event } from '@/markket/event.d';

type EventLocationInput = {
  name: string;
  email: string;
  street: string;
  street_2: string;
  city: string;
  state: string;
  country: string;
  zipcode: string;
};

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
    locations?: Event['locations'];
    thumbnailUrl?: string;
    socialImageUrl?: string;
    slides?: Event['Slides'];
    seoSocialImageId?: number;
    seoSocialImageDocumentId?: string;
    thumbnailDocumentId?: string;
    tagIds?: number[];
    slideDocumentIds?: string[];
    initialSEO?: Record<string, unknown>;
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
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/New_York';
  } catch {
    return 'America/New_York';
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

function getDateTimePartsInTimezone(date: Date, timeZone: string) {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  const parts = formatter.formatToParts(date);
  const find = (type: Intl.DateTimeFormatPartTypes) => parts.find((part) => part.type === type)?.value;

  const year = Number(find('year'));
  const month = Number(find('month'));
  const day = Number(find('day'));
  const hour = Number(find('hour'));
  const minute = Number(find('minute'));
  const second = Number(find('second'));

  if ([year, month, day, hour, minute, second].some((value) => Number.isNaN(value))) {
    return null;
  }

  return { year, month, day, hour, minute, second };
}

function timezoneOffsetMs(date: Date, timeZone: string) {
  const parts = getDateTimePartsInTimezone(date, timeZone);
  if (!parts) return 0;

  const utcFromTimezoneView = Date.UTC(
    parts.year,
    parts.month - 1,
    parts.day,
    parts.hour,
    parts.minute,
    parts.second,
  );

  return utcFromTimezoneView - date.getTime();
}

function parseDatetimeLocal(value: string) {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/);
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const hour = Number(match[4]);
  const minute = Number(match[5]);

  if ([year, month, day, hour, minute].some((part) => Number.isNaN(part))) {
    return null;
  }

  return { year, month, day, hour, minute };
}

function toDatetimeLocalInput(value?: string, timezone?: string) {
  if (value && timezone && isValidIanaTimezone(timezone)) {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) {
      const parts = getDateTimePartsInTimezone(parsed, timezone);
      if (parts) {
        return `${parts.year}-${String(parts.month).padStart(2, '0')}-${String(parts.day).padStart(2, '0')}T${String(parts.hour).padStart(2, '0')}:${String(parts.minute).padStart(2, '0')}`;
      }
    }
  }

  const parsed = value ? new Date(value) : new Date();
  if (Number.isNaN(parsed.getTime())) {
    const fallback = new Date();
    return `${fallback.getFullYear()}-${String(fallback.getMonth() + 1).padStart(2, '0')}-${String(fallback.getDate()).padStart(2, '0')}T${String(fallback.getHours()).padStart(2, '0')}:${String(fallback.getMinutes()).padStart(2, '0')}`;
  }

  return `${parsed.getFullYear()}-${String(parsed.getMonth() + 1).padStart(2, '0')}-${String(parsed.getDate()).padStart(2, '0')}T${String(parsed.getHours()).padStart(2, '0')}:${String(parsed.getMinutes()).padStart(2, '0')}`;
}

function toIsoString(value: string, timezone?: string) {
  const localParts = parseDatetimeLocal(value);
  if (!localParts) return '';

  if (timezone && isValidIanaTimezone(timezone)) {
    const utcGuess = new Date(Date.UTC(
      localParts.year,
      localParts.month - 1,
      localParts.day,
      localParts.hour,
      localParts.minute,
      0,
      0,
    ));

    const offset = timezoneOffsetMs(utcGuess, timezone);
    return new Date(utcGuess.getTime() - offset).toISOString();
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? '' : parsed.toISOString();
}

function getDefaultEventRange(timezone?: string) {
  const now = new Date();
  const timezoneToUse = timezone && isValidIanaTimezone(timezone) ? timezone : undefined;

  if (timezoneToUse) {
    const nowParts = getDateTimePartsInTimezone(now, timezoneToUse);
    if (nowParts) {
      const nextWeekUtc = new Date(Date.UTC(nowParts.year, nowParts.month - 1, nowParts.day + 7, 17, 0, 0, 0));
      const nextWeekParts = getDateTimePartsInTimezone(nextWeekUtc, timezoneToUse);

      if (nextWeekParts) {
        const startLocal = `${nextWeekParts.year}-${String(nextWeekParts.month).padStart(2, '0')}-${String(nextWeekParts.day).padStart(2, '0')}T17:00`;
        const endLocal = `${nextWeekParts.year}-${String(nextWeekParts.month).padStart(2, '0')}-${String(nextWeekParts.day).padStart(2, '0')}T19:00`;

        return {
          start: toIsoString(startLocal, timezoneToUse),
          end: toIsoString(endLocal, timezoneToUse),
        };
      }
    }
  }

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

function normalizeTimezone(value?: string) {
  return (value || '').trim();
}

function firstLocation(locations?: Event['locations']): EventLocationInput {
  const first = Array.isArray(locations) && locations.length > 0 ? locations[0] : null;
  return {
    name: first?.name || '',
    email: first?.email || '',
    street: first?.street || '',
    street_2: first?.street_2 || '',
    city: first?.city || '',
    state: first?.state || '',
    country: first?.country || '',
    zipcode: first?.zipcode || '',
  };
}

function hasLocationValue(location: EventLocationInput) {
  return Object.values(location).some((value) => (value || '').trim().length > 0);
}

export default function EventEditorForm({ storeSlug, mode, itemDocumentId, initial }: EventEditorFormProps) {
  const router = useRouter();
  const store = useStore();
  const autoTimezone = browserTimezone();
  const initialTimezoneValue = normalizeTimezone(initial?.timezone) || autoTimezone;
  const defaultRange = getDefaultEventRange(initialTimezoneValue);

  const [name, setName] = useState(initial?.name || '');
  const [slug, setSlug] = useState(initial?.slug || '');
  const [description, setDescription] = useState(initial?.description || '');
  const [seoTitle, setSeoTitle] = useState(initial?.seoTitle || '');
  const [seoDescription, setSeoDescription] = useState(initial?.seoDescription || '');
  const [sourceUrl, setSourceUrl] = useState(initial?.sourceUrl || '');
  const [startDateInput, setStartDateInput] = useState(
    toDatetimeLocalInput(initial?.startDate || (mode === 'new' ? defaultRange.start : undefined), initialTimezoneValue),
  );
  const [endDateInput, setEndDateInput] = useState(
    toDatetimeLocalInput(initial?.endDate || (mode === 'new' ? defaultRange.end : new Date(Date.now() + 3600000).toISOString()), initialTimezoneValue),
  );
  const [timezone, setTimezone] = useState(initialTimezoneValue);
  const [location, setLocation] = useState<EventLocationInput>(() => firstLocation(initial?.locations));
  const [showTimezoneEditor, setShowTimezoneEditor] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [slugTouched, setSlugTouched] = useState(Boolean(initial?.slug));
  const savedSnapshotRef = useRef({ name, slug, description, seoTitle, seoDescription, sourceUrl, startDateInput, endDateInput, timezone, location });
  const [isDirty, setIsDirty] = useState(false);
  const storeRef = store.documentId || store.slug || storeSlug;
  const normalizedTimezone = normalizeTimezone(timezone);
  const timezoneForPayload = normalizedTimezone || 'America/New_York';
  const initialTimezone = normalizeTimezone(initial?.timezone);
  const browserTimezoneValue = normalizeTimezone(autoTimezone);
  const hasTimezoneError = !isValidIanaTimezone(normalizedTimezone);
  const hasTimezoneMismatch = Boolean(
    normalizedTimezone
    && browserTimezoneValue
    && normalizedTimezone !== browserTimezoneValue,
  );
  const looksLegacyUtc = normalizedTimezone === 'UTC' && browserTimezoneValue && browserTimezoneValue !== 'UTC';

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
      || timezone !== snap.timezone
      || JSON.stringify(location) !== JSON.stringify(snap.location),
    );
  }, [name, slug, description, seoTitle, seoDescription, sourceUrl, startDateInput, endDateInput, timezone, location]);

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

    const startDate = toIsoString(startDateInput, timezoneForPayload);
    const endDate = toIsoString(endDateInput, timezoneForPayload);

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

    const payload: Record<string, unknown> = {
      Name: name.trim(),
      slug: nextSlug,
      Description: description,
      startDate,
      endDate,
      timezone: timezoneForPayload,
      locations: hasLocationValue(location)
        ? [{
          name: location.name.trim() || undefined,
          email: location.email.trim() || undefined,
          street: location.street.trim() || undefined,
          street_2: location.street_2.trim() || undefined,
          city: location.city.trim() || undefined,
          state: location.state.trim() || undefined,
          country: location.country.trim() || undefined,
          zipcode: location.zipcode.trim() || undefined,
        }]
        : [],
      // Thumbnail is managed via the Image Manager on the preview page, not here
      SEO: {
        ...(initial?.initialSEO
          ? Object.fromEntries(Object.entries(initial.initialSEO).filter(([k]) => k !== 'socialImage'))
          : {}),
        metaTitle: (seoTitle || name).trim().slice(0, 60),
        metaDescription: (seoDescription || '').trim().slice(0, 160),
        metaUrl: sourceUrl.trim() || undefined,
        ...(initial?.seoSocialImageId
          ? { socialImage: { id: initial.seoSocialImageId } }
          : {}),
      },
    };

    if (initial?.tagIds && initial.tagIds.length > 0) {
      payload.Tag = initial.tagIds.map((id) => ({ id }));
    }
    if (initial?.slideDocumentIds && initial.slideDocumentIds.length > 0) {
      payload.Slides = initial.slideDocumentIds.map((documentId) => ({ documentId }));
    }

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

      savedSnapshotRef.current = { name, slug: nextSlug, description, seoTitle, seoDescription, sourceUrl, startDateInput, endDateInput, timezone, location };
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
    <Stack gap="md" className="tienda-editor-form">
      <TextInput
        label="Name"
        value={name}
        onChange={(e) => setName(e.currentTarget.value)}
        placeholder="Event name"
        required
        rightSection={name ? <CloseButton size="sm" onClick={() => setName('')} aria-label="Clear name" /> : null}
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

      <div className="form-cols">
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
      </div>
      <Group justify="space-between" align="end">
        <Stack gap={2}>
          <Text size="sm" fw={500}>Timezone</Text>
          <Text size="sm" c="dimmed">Assumed from browser: {autoTimezone}</Text>
          <Text size="xs" c="dimmed">Stored timezone: {normalizedTimezone || 'Not set'}</Text>
          {mode === 'edit' && initialTimezone && (
            <Text size="xs" c="dimmed">Originally saved: {initialTimezone}</Text>
          )}
        </Stack>
        <Button
          variant="subtle"
          size="xs"
          onClick={() => setShowTimezoneEditor((prev) => !prev)}
        >
          {showTimezoneEditor ? 'Hide timezone options' : 'Edit timezone'}
        </Button>
      </Group>

      {looksLegacyUtc && (
        <Group justify="space-between" align="center" style={{ padding: '8px 10px', border: '1px solid #ffd8a8', borderRadius: 8, background: '#fff9db' }}>
          <Text size="sm" c="orange.9">
            This event is currently set to UTC. If this should follow your local timezone, switch to {browserTimezoneValue}.
          </Text>
          <Button size="xs" color="orange" variant="light" onClick={() => setTimezone(browserTimezoneValue)}>
            Use {browserTimezoneValue}
          </Button>
        </Group>
      )}

      {!looksLegacyUtc && hasTimezoneMismatch && (
        <Group justify="space-between" align="center" style={{ padding: '8px 10px', border: '1px solid #cfe8ff', borderRadius: 8, background: '#eef7ff' }}>
          <Text size="sm" c="blue.9">
            Display timezone differs from your browser ({browserTimezoneValue}). This is OK if intentional.
          </Text>
          <Button size="xs" color="blue" variant="light" onClick={() => setTimezone(browserTimezoneValue)}>
            Match browser
          </Button>
        </Group>
      )}

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

      <Stack gap="xs">
        <Text fw={600}>Location</Text>
        <Text size="sm" c="dimmed">Add the main location guests should use for this event.</Text>
        <div className="form-cols">
          <TextInput
            label="Venue Name"
            value={location.name}
            onChange={(e) => setLocation((prev) => ({ ...prev, name: e.currentTarget.value }))}
            placeholder="Studio Norte"
          />
          <TextInput
            label="Contact Email"
            type="email"
            value={location.email}
            onChange={(e) => setLocation((prev) => ({ ...prev, email: e.currentTarget.value }))}
            placeholder="events@example.com"
          />
        </div>
        <TextInput
          label="Street"
          value={location.street}
          onChange={(e) => setLocation((prev) => ({ ...prev, street: e.currentTarget.value }))}
          placeholder="123 Main St"
        />
        <TextInput
          label="Street 2"
          value={location.street_2}
          onChange={(e) => setLocation((prev) => ({ ...prev, street_2: e.currentTarget.value }))}
          placeholder="Suite 400"
        />
        <div className="form-cols">
          <TextInput
            label="City"
            value={location.city}
            onChange={(e) => setLocation((prev) => ({ ...prev, city: e.currentTarget.value }))}
            placeholder="New York"
          />
          <TextInput
            label="State"
            value={location.state}
            onChange={(e) => setLocation((prev) => ({ ...prev, state: e.currentTarget.value }))}
            placeholder="NY"
          />
        </div>
        <div className="form-cols">
          <TextInput
            label="Country"
            value={location.country}
            onChange={(e) => setLocation((prev) => ({ ...prev, country: e.currentTarget.value }))}
            placeholder="USA"
          />
          <TextInput
            label="Zipcode"
            value={location.zipcode}
            onChange={(e) => setLocation((prev) => ({ ...prev, zipcode: e.currentTarget.value }))}
            placeholder="10001"
          />
        </div>
      </Stack>

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
        rightSection={seoTitle ? <CloseButton size="sm" onClick={() => setSeoTitle('')} aria-label="Clear SEO title" /> : null}
      />

      <TextInput
        label="SEO Description"
        value={seoDescription}
        onChange={(e) => setSeoDescription(e.currentTarget.value)}
        placeholder="SEO description (optional)"
        rightSection={seoDescription ? <CloseButton size="sm" onClick={() => setSeoDescription('')} aria-label="Clear SEO description" /> : null}
      />

      <TextInput
        label="Source URL (External RSVP)"
        value={sourceUrl}
        onChange={(e) => setSourceUrl(e.currentTarget.value)}
        placeholder="https://example.com/rsvp"
        description="Used as the external RSVP link on the event page."
        rightSection={sourceUrl ? <CloseButton size="sm" onClick={() => setSourceUrl('')} aria-label="Clear URL" /> : null}
      />

      <Text size="xs" c="dimmed">
        Tip: Text edits happen here. Manage images and special media fields from the event preview page.
      </Text>


      <Group justify="space-between" className="tienda-form-actions">
        <Button component="a" variant="subtle" href={mode === 'edit' && itemDocumentId ? `/tienda/${storeSlug}/events/${itemDocumentId}` : `/tienda/${storeSlug}/events`}>
          Cancel
        </Button>

        <Button onClick={handleSubmit} loading={isSubmitting} disabled={(!isDirty && mode === 'edit') || hasTimezoneError}>
          {mode === 'new' ? 'Create Event' : 'Save Changes'}
        </Button>
      </Group>
    </Stack>
  );
}
