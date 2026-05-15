'use client';

import { Text } from '@mantine/core';

type EventScheduleProps = {
  startDate?: string;
  endDate?: string;
  timezone?: string;
};

function isValidTimeZone(value?: string) {
  if (!value) return false;
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: value }).format(new Date());
    return true;
  } catch {
    return false;
  }
}

function getTimeZoneName(value: string) {
  try {
    const parts = new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      timeZone: value,
      timeZoneName: 'short',
    }).formatToParts(new Date());
    return parts.find((part) => part.type === 'timeZoneName')?.value;
  } catch {
    return undefined;
  }
}

function formatDateTime(value: string | undefined, timeZone: string) {
  if (!value) return 'Not set';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZone,
    timeZoneName: 'short',
  }).format(parsed);
}

export default function EventSchedule({ startDate, endDate, timezone }: EventScheduleProps) {
  const browserTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/New_York';
  const resolvedTimeZone = isValidTimeZone(timezone)
    ? timezone!
    : (isValidTimeZone(browserTimeZone) ? browserTimeZone : 'America/New_York');

  const startsAt = formatDateTime(startDate, resolvedTimeZone);
  const endsAt = formatDateTime(endDate, resolvedTimeZone);
  const tzShort = getTimeZoneName(resolvedTimeZone);
  const timezoneLabel = tzShort ? `${resolvedTimeZone} (${tzShort})` : resolvedTimeZone;
  const usingBrowserFallback = !isValidTimeZone(timezone);

  return (
    <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
      <p className="text-sm font-semibold text-gray-900">Schedule</p>
      <p className="text-sm text-gray-700">Starts: {startsAt}</p>
      <p className="text-sm text-gray-700">Ends: {endsAt}</p>
      <Text size="xs" c="dimmed" mt={6}>
        Timezone: {timezoneLabel}{usingBrowserFallback ? ' (from your browser)' : ''}
      </Text>
    </div>
  );
}
