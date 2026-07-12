'use client';

import { useEffect, useMemo, useState } from 'react';
import { Button, Collapse, CloseButton, Group, Select, Stack, Text, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { useRouter } from 'next/navigation';
import { tiendaClient } from '@/markket/api.tienda';
import ContentEditor from '@/app/components/ui/form.input.tiptap';
import { useStore } from '../store.provider';
import type { Event } from '@/markket/event.d';
import { IconBrowser } from '@tabler/icons-react';
import { richTextToHtml } from '@/markket/richtext.utils';

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

type EventFormValues = {
  name: string;
  slug: string;
  description: string;
  seoTitle: string;
  seoDescription: string;
  sourceUrl: string;
  startDateInput: string;
  endDateInput: string;
  timezone: string;
  location: EventLocationInput;
};

type EventEditorFormProps = {
  storeSlug: string;
  mode: 'new' | 'edit';
  itemDocumentId?: string;
  initial?: {
    name?: string;
    slug?: string;
    description?: unknown;
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
    slideDocumentIds?: number[];
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

function toDatetimeLocalInputOptional(value?: string, timezone?: string) {
  if (!value) return '';
  return toDatetimeLocalInput(value, timezone);
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

function shiftDatetimeLocalByMinutes(value: string, minutes: number, timezone?: string) {
  const iso = toIsoString(value, timezone);
  if (!iso) return '';

  const shifted = new Date(iso);
  shifted.setMinutes(shifted.getMinutes() + minutes);
  return toDatetimeLocalInput(shifted.toISOString(), timezone);
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

function isValidHttpUrl(value: string) {
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

function normalizeEventDescription(value: unknown): string {
  if (typeof value === 'string') {
    return value;
  }

  if (!value) {
    return '';
  }

  return richTextToHtml(value as never);
}

export default function EventEditorForm({ storeSlug, mode, itemDocumentId, initial }: EventEditorFormProps) {
  const router = useRouter();
  const store = useStore();
  const autoTimezone = browserTimezone();
  const initialTimezoneValue = normalizeTimezone(initial?.timezone) || autoTimezone;
  const defaultRange = getDefaultEventRange(initialTimezoneValue);

  const form = useForm<EventFormValues>({
    validateInputOnBlur: true,
    initialValues: {
      name: initial?.name || '',
      slug: initial?.slug || '',
      description: normalizeEventDescription(initial?.description),
      seoTitle: initial?.seoTitle || '',
      seoDescription: initial?.seoDescription || '',
      sourceUrl: initial?.sourceUrl || '',
      startDateInput: toDatetimeLocalInput(initial?.startDate || (mode === 'new' ? defaultRange.start : undefined), initialTimezoneValue),
      endDateInput: toDatetimeLocalInputOptional(
        initial?.endDate || (mode === 'new' ? defaultRange.end : undefined),
        initialTimezoneValue,
      ),
      timezone: initialTimezoneValue,
      location: firstLocation(initial?.locations),
    },
    validate: {
      name: (value) => {
        if (!value.trim()) return 'Event name is required.';
        if (value.trim().length > 120) return 'Event name must be 120 characters or less.';
        return null;
      },
      slug: (value) => {
        const trimmed = value.trim();
        if (!trimmed) return 'Slug is required.';
        if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(trimmed)) {
          return 'Use lowercase letters, numbers, and single dashes only.';
        }
        return null;
      },
      startDateInput: (value) => {
        if (!value) return 'Start date is required.';
        if (!parseDatetimeLocal(value)) return 'Enter a valid start date and time.';
        return null;
      },
      endDateInput: (value) => {
        if (!value) return null;
        if (!parseDatetimeLocal(value)) return 'Enter a valid end date and time.';
        return null;
      },
      timezone: (value) => {
        if (!normalizeTimezone(value)) return 'Timezone is required.';
        if (!isValidIanaTimezone(value)) return 'Use a valid IANA timezone.';
        return null;
      },
      sourceUrl: (value) => {
        const trimmed = value.trim();
        if (!trimmed) return null;
        return isValidHttpUrl(trimmed) ? null : 'Use a valid URL starting with http:// or https://';
      },
      seoTitle: (value) => (value.trim().length > 60 ? 'SEO title should be 60 characters or less.' : null),
      seoDescription: (value) => (value.trim().length > 160 ? 'SEO description should be 160 characters or less.' : null),
      location: {
        email: (value) => {
          const trimmed = (value || '').trim();
          if (!trimmed) return null;
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed) ? null : 'Enter a valid email address.';
        },
      },
    },
  });

  const [showTimezoneEditor, setShowTimezoneEditor] = useState(false);
  const [showLocation, setShowLocation] = useState(hasLocationValue(form.values.location));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [slugTouched, setSlugTouched] = useState(Boolean(initial?.slug));
  const storeRef = store.documentId || store.slug || storeSlug;
  const normalizedTimezone = normalizeTimezone(form.values.timezone);
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
  const startIsoPreview = toIsoString(form.values.startDateInput, timezoneForPayload);
  const endIsoPreview = toIsoString(form.values.endDateInput, timezoneForPayload);
  const endDateRangeError =
    startIsoPreview
      && endIsoPreview
      && new Date(endIsoPreview).getTime() <= new Date(startIsoPreview).getTime()
      ? 'End date must be after start date.'
      : null;

  useEffect(() => {
    if (slugTouched) return;

    const nextSlug = slugify(form.values.name);
    if (form.values.slug !== nextSlug) {
      form.setFieldValue('slug', nextSlug);
    }
  }, [form.values.name, form.values.slug, slugTouched]);

  useEffect(() => {
    if (!form.values.startDateInput) return;
    if (!form.values.endDateInput) return;

    const startIso = toIsoString(form.values.startDateInput, timezoneForPayload);
    const endIso = toIsoString(form.values.endDateInput, timezoneForPayload);
    if (!startIso || !endIso) return;

    if (new Date(endIso).getTime() <= new Date(startIso).getTime()) {
      const suggestedEnd = shiftDatetimeLocalByMinutes(form.values.startDateInput, 120, timezoneForPayload);
      if (suggestedEnd && suggestedEnd !== form.values.endDateInput) {
        form.setFieldValue('endDateInput', suggestedEnd);
      }
    }
  }, [form.values.endDateInput, form.values.startDateInput, timezoneForPayload]);

  const handleSubmit = async () => {
    const token = readAuthToken();

    if (!token) {
      notifications.show({ title: 'Session expired', message: 'Please sign in again.', color: 'red' });
      return;
    }

    const validation = form.validate();
    if (validation.hasErrors) {
      notifications.show({ title: 'Please review the form', message: 'Some fields need attention before saving.', color: 'orange' });
      return;
    }

    const nextSlug = slugify(form.values.slug || form.values.name);
    if (!nextSlug) {
      notifications.show({ title: 'Slug required', message: 'A valid slug is required.', color: 'orange' });
      return;
    }

    const startDate = toIsoString(form.values.startDateInput, timezoneForPayload);
    const endDate = toIsoString(form.values.endDateInput, timezoneForPayload);

    if (!startDate) {
      notifications.show({ title: 'Start date required', message: 'Please provide a valid start date.', color: 'orange' });
      return;
    }

    if (endDate && new Date(endDate).getTime() <= new Date(startDate).getTime()) {
      form.setFieldError('endDateInput', 'End date must be after start date.');
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
      slug: nextSlug,
      Name: form.values.name.trim(),
      Description: form.values.description,
      startDate,
      endDate: endDate || undefined,
      timezone: timezoneForPayload,
      locations: hasLocationValue(form.values.location)
        ? [{
          name: form.values.location.name.trim() || undefined,
          email: form.values.location.email.trim() || undefined,
          street: form.values.location.street.trim() || undefined,
          street_2: form.values.location.street_2.trim() || undefined,
          city: form.values.location.city.trim() || undefined,
          state: form.values.location.state.trim() || undefined,
          country: form.values.location.country.trim() || undefined,
          zipcode: form.values.location.zipcode.trim() || undefined,
        }]
        : [],
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

      form.setFieldValue('slug', nextSlug);
      form.resetDirty();

      notifications.show({
        title: 'Saved',
        message: `Event "${form.values.name}" saved successfully.`,
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
        {...form.getInputProps('name')}
        placeholder="Event name"
        required
        rightSection={form.values.name ? <CloseButton size="sm" onClick={() => form.setFieldValue('name', '')} aria-label="Clear name" /> : null}
      />

      <TextInput
        label="Slug"
        value={form.values.slug}
        onChange={(e) => {
          setSlugTouched(true);
          form.setFieldValue('slug', e.currentTarget.value);
        }}
        placeholder="event-slug"
        required
        description={
          form.values.slug ? (
            <span style={{ fontFamily: 'monospace' }}>
              /{storeSlug}/events/<strong>{form.values.slug}</strong>
            </span>
          ) : undefined
        }
      />

      <div className="form-cols">
        <TextInput
          label="Start Date & Time"
          type="datetime-local"
          {...form.getInputProps('startDateInput')}
          required
        />
        <TextInput
          label="End Date & Time"
          type="datetime-local"
          {...form.getInputProps('endDateInput')}
          min={form.values.startDateInput || undefined}
          error={form.errors.endDateInput || endDateRangeError}
        />
      </div>
      <Group justify="space-between" align="end">
        <Stack gap={2}>
          <Text size="sm" fw={500}>Timezone</Text>
          <Text size="sm" c="dimmed">{autoTimezone}</Text>
        </Stack>
        <Button
          variant="subtle"
          size="xs"
          onClick={() => setShowTimezoneEditor((prev) => !prev)}
        >
          {showTimezoneEditor ? 'Hide ' : 'Edit'}
        </Button>
      </Group>

      {looksLegacyUtc && (
        <Group justify="space-between" align="center" style={{ padding: '8px 10px', border: '1px solid #ffd8a8', borderRadius: 8, background: '#fff9db' }}>
          <Text size="sm" c="orange.9">
            This event is currently set to UTC. If this should follow your local timezone, switch to {browserTimezoneValue}.
          </Text>
          <Button size="xs" color="orange" variant="light" onClick={() => form.setFieldValue('timezone', browserTimezoneValue)}>
            Use {browserTimezoneValue}
          </Button>
        </Group>
      )}

      {!looksLegacyUtc && hasTimezoneMismatch && (
        <Group justify="space-between" align="center" style={{ padding: '8px 10px', border: '1px solid #cfe8ff', borderRadius: 8, background: '#eef7ff' }}>
          <Text size="sm" c="blue.9">
            Display timezone differs from your browser ({browserTimezoneValue}). This is OK if intentional.
          </Text>
          <Button size="xs" color="blue" variant="light" onClick={() => form.setFieldValue('timezone', browserTimezoneValue)}>
            Match browser
          </Button>
        </Group>
      )}

      {showTimezoneEditor && (
        <>
          <Select
            label="Timezone (Quick Pick)"
            value={POPULAR_TIMEZONES.includes(form.values.timezone) ? form.values.timezone : null}
            onChange={(value) => {
              if (value) form.setFieldValue('timezone', value);
            }}
            data={POPULAR_TIMEZONES.map((zone) => ({ value: zone, label: zone }))}
            placeholder="Choose a common timezone"
            searchable
            clearable
            description="Pick a common timezone, or set any IANA timezone manually below."
          />

          <TextInput
            label="Timezone"
            {...form.getInputProps('timezone')}
            placeholder="America/Los_Angeles"
            description="Use IANA timezone (for example, America/Los_Angeles or Europe/Berlin)."
            error={hasTimezoneError ? 'Invalid timezone. Please use a valid IANA value.' : undefined}
          />
        </>
      )}

      <Stack gap="xs">
        <Group justify="space-between" align="center">
          <Text fw={600}>Location</Text>
          <Button variant="subtle" size="xs" onClick={() => setShowLocation((prev) => !prev)}>
            {showLocation
              ? 'Hide'
              : hasLocationValue(form.values.location)
                ? [form.values.location.name, form.values.location.city, form.values.location.country].filter(Boolean).join(', ') || 'Edit'
                : 'Add location'}
          </Button>
        </Group>
        <Collapse expanded={showLocation}>
          <Stack gap="xs">
            <Text size="sm" c="dimmed">Add the main location guests should use for this event.</Text>
        <div className="form-cols">
          <TextInput
            label="Venue Name"
                value={form.values.location.name}
                onChange={(e) => form.setFieldValue('location.name', e.currentTarget.value)}
            placeholder="Studio Norte"
          />
          <TextInput
            label="Contact Email"
            type="email"
                value={form.values.location.email}
                onChange={(e) => form.setFieldValue('location.email', e.currentTarget.value)}
            placeholder="events@example.com"
          />
        </div>
        <TextInput
          label="Street"
              value={form.values.location.street}
              onChange={(e) => form.setFieldValue('location.street', e.currentTarget.value)}
          placeholder="123 Main St"
        />
        <TextInput
          label="Street 2"
              value={form.values.location.street_2}
              onChange={(e) => form.setFieldValue('location.street_2', e.currentTarget.value)}
          placeholder="Suite 400"
        />
        <div className="form-cols">
          <TextInput
            label="City"
                value={form.values.location.city}
                onChange={(e) => form.setFieldValue('location.city', e.currentTarget.value)}
            placeholder="New York"
          />
          <TextInput
            label="State"
                value={form.values.location.state}
                onChange={(e) => form.setFieldValue('location.state', e.currentTarget.value)}
            placeholder="NY"
          />
        </div>
        <div className="form-cols">
          <TextInput
            label="Country"
                value={form.values.location.country}
                onChange={(e) => form.setFieldValue('location.country', e.currentTarget.value)}
            placeholder="USA"
          />
          <TextInput
            label="Zipcode"
                value={form.values.location.zipcode}
                onChange={(e) => form.setFieldValue('location.zipcode', e.currentTarget.value)}
            placeholder="10001"
          />
        </div>
          </Stack>
        </Collapse>
      </Stack>

      <ContentEditor
        value={form.values.description}
        onChange={(value) => form.setFieldValue('description', typeof value === 'string' ? value : '')}
        label="Description"
        format="html"
        minHeight={320}
        placeholder="Write event description..."
      />

      <TextInput
        label="SEO Title"
        {...form.getInputProps('seoTitle')}
        placeholder="SEO title (optional)"
        description={`${form.values.seoTitle.trim().length}/60 characters`}
        rightSection={form.values.seoTitle ? <CloseButton size="sm" onClick={() => form.setFieldValue('seoTitle', '')} aria-label="Clear SEO title" /> : null}
      />

      <TextInput
        label="SEO Description"
        {...form.getInputProps('seoDescription')}
        placeholder="SEO description (optional)"
        description={`${form.values.seoDescription.trim().length}/160 characters`}
        rightSection={form.values.seoDescription ? <CloseButton size="sm" onClick={() => form.setFieldValue('seoDescription', '')} aria-label="Clear SEO description" /> : null}
      />

      <TextInput
        label="Source URL (External RSVP)"
        {...form.getInputProps('sourceUrl')}
        placeholder="https://example.com/rsvp"
        description="Used as the external RSVP link on the event page."
        rightSection={form.values.sourceUrl ? <CloseButton size="sm" onClick={() => form.setFieldValue('sourceUrl', '')} aria-label="Clear URL" /> : null}
      />

      <Text size="xs" c="dimmed">
        Tip: Text edits happen here. Manage images and special media fields from the event preview page.
      </Text>


      <Group justify="space-between" className="tienda-form-actions">
        <Button component="a" variant="subtle" href={mode === 'edit' && itemDocumentId ? `/tienda/${storeSlug}/events/${itemDocumentId}` : `/tienda/${storeSlug}/events`}>
          Cancel
        </Button>

        <Button onClick={handleSubmit} loading={isSubmitting} disabled={(!form.isDirty() && mode === 'edit') || hasTimezoneError || Boolean(endDateRangeError)}>
          {mode === 'new' ? 'Create Event' : 'Save Changes'}
        </Button>
      </Group>
    </Stack>
  );
}
