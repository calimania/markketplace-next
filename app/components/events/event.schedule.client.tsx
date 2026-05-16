'use client';

import { Badge, Paper, Stack, Text } from '@mantine/core';
import { markketColors } from '@/markket/colors.config';

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
  const normalizedBrowserTimeZone = browserTimeZone.toLowerCase();
  const browserLooksGenericUtc = normalizedBrowserTimeZone === 'utc' || normalizedBrowserTimeZone === 'etc/utc';
  const fallbackTimeZone = !browserLooksGenericUtc && isValidTimeZone(browserTimeZone)
    ? browserTimeZone
    : 'America/New_York';
  const resolvedTimeZone = isValidTimeZone(timezone)
    ? timezone!
    : fallbackTimeZone;

  const startsAt = formatDateTime(startDate, resolvedTimeZone);
  const endsAt = formatDateTime(endDate, resolvedTimeZone);
  const tzShort = getTimeZoneName(resolvedTimeZone);
  const timezoneLabel = tzShort ? `${resolvedTimeZone} (${tzShort})` : resolvedTimeZone;
  const usingBrowserFallback = !isValidTimeZone(timezone);

  return (
    <Paper
      withBorder
      radius="lg"
      p="md"
      mt="md"
      style={{ borderColor: `${markketColors.sections.events.main}33`, background: '#fff' }}
    >
      <Stack gap={8}>
        <Badge
          variant="light"
          radius="sm"
          style={{
            width: 'fit-content',
            background: markketColors.sections.events.light,
            color: markketColors.sections.events.main,
          }}
        >
          Schedule
        </Badge>
        <Text size="sm" fw={600} c={markketColors.neutral.charcoal}>Starts: {startsAt}</Text>
        <Text size="sm" c={markketColors.neutral.darkGray}>Ends: {endsAt}</Text>
        <Text size="xs" c="dimmed" mt={2}>
          Timezone: {timezoneLabel}{usingBrowserFallback ? ' (from your browser)' : ''}
        </Text>
      </Stack>
    </Paper>
  );
}
