import { SEO } from '@/markket';
import {
  Paper,
  Text,
  Group,
  Stack,
  ThemeIcon,
  CopyButton,
  ActionIcon,
  Tooltip,
  rem,
} from '@mantine/core';
import {
  IconSearch,
  IconLink,
  IconCheck,
  IconWorld,
  IconBrandGoogle,
  IconUserCircle,
  IconPhoto,
  IconExclamationCircle,
  IconCalendarOff,
  IconSquareRoundedCheck,
} from '@tabler/icons-react';
import { format } from 'date-fns';

type PreviewSEOProps = {
  SEO: SEO;
  previewUrl?: string;
};

const PreviewSEO = ({ SEO, previewUrl }: PreviewSEOProps) => {
  if (!SEO) return null;

  return (
    <Paper withBorder p="md" radius="md">
      <Stack gap="md">
        <Stack gap="xs">
          <Group gap="xs">
            <ThemeIcon size="sm" variant="light" color="blue">
              <IconBrandGoogle size={12} />
            </ThemeIcon>
            <Text size="xs" c="dimmed">Search Preview</Text>
          </Group>

          <Paper
            p="md"
            bg="gray.0"
            radius="sm"
          >
            <Stack gap="xs">
              <Text
                size="sm"
                c="blue.7"
                style={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                <a href={previewUrl} target='_preview'>
                  {SEO.metaTitle || 'not set'}
                </a>
              </Text>
              <Group gap={4}>
                <IconWorld size={14} style={{ color: 'var(--mantine-color-green-7)' }} />
                <Text size="xs" c="dimmed" truncate>
                  {SEO.metaUrl || 'de.markket.place'}
                </Text>
              </Group>
              <Text size="sm" lineClamp={2} c="dark.6">
                {SEO.metaDescription || ''}
              </Text>
            </Stack>
          </Paper>
        </Stack>

        <Group gap="lg" wrap="nowrap">
          <Group gap="xs">
            <ThemeIcon size={24} variant="light">
              {!SEO.socialImage?.url && (<IconPhoto size={14} />)}
              {SEO.socialImage?.url && (
                <a href={SEO.socialImage.url} target="_blank" rel="noopener noreferrer" className="cursor-pointer">
                  <img
                    src={SEO.socialImage.url}
                    alt="Social Image"
                    style={{ width: rem(28), height: rem(28), objectFit: 'cover' }}
                  />
                </a>
              )}
            </ThemeIcon>
            <Stack gap={0}>
              <Text size="sm" fw={500}>
                <a href={SEO?.socialImage?.url || '#'} target="_blank" rel="noopener noreferrer" className="">
                  Social Image
                </a>
              </Text>
              <Text size="xs" c="dimmed">
                {SEO.socialImage ? 'Set' : 'Not set'}
              </Text>
            </Stack>
          </Group>
          <Group gap="xs">
            <ThemeIcon size={24} variant="light">
              {!SEO.excludeFromSearch && <IconSquareRoundedCheck size={14} />}
              {SEO.excludeFromSearch && <IconExclamationCircle size={14} />}
            </ThemeIcon>
            <Stack gap={0}>
              <Text size="sm" fw={500}>Active</Text>
              <Text size="xs" c="dimmed">
                {(SEO.excludeFromSearch) ? 'No' : 'Yes'}
              </Text>
            </Stack>
          </Group>
          <Group gap="xs">
            <ThemeIcon size={24} variant="light">
              <IconSearch size={14} />
            </ThemeIcon>
            <Stack gap={0}>
              <Text size="sm" fw={500}>Title</Text>
              <Text size="xs" c="dimmed">
                {(SEO.metaTitle)?.length || 0}/60 chars
              </Text>
            </Stack>
          </Group>
          <Group gap="xs">
            <ThemeIcon size={24} variant="light">
              {!SEO.metaDate && <IconCalendarOff size={14} />}
              {SEO.metaDate && <IconExclamationCircle size={14} />}
            </ThemeIcon>
            <Stack gap={0}>
              <Text size="sm" fw={500}>Meta Date</Text>
              <Text size="xs" c="dimmed">
                {(SEO.metaDate && format(new Date(SEO.metaDate), 'MMMM d, yyyy')) || 'Not set'}
              </Text>
            </Stack>
          </Group>
          <Group gap="xs">
            <ThemeIcon size={24} variant="light">
              <IconUserCircle size={14} />
            </ThemeIcon>
            <Stack gap={0}>
              <Text size="sm" fw={500}>Author</Text>
              <Text size="xs" c="dimmed">
                {SEO.metaAuthor || 'Not set'}
              </Text>
            </Stack>
          </Group>

          {SEO.metaUrl && (
            <Group gap="xs" ml="auto">
              <CopyButton value={SEO.metaUrl}>
                {({ copied, copy }) => (
                  <Tooltip label={copied ? 'Copied!' : 'Copy canonical URL'}>
                    <ActionIcon
                      variant="light"
                      color={copied ? 'teal' : 'gray'}
                      onClick={copy}
                    >
                      {copied ? <IconCheck size={16} /> : <IconLink size={16} />}
                    </ActionIcon>
                  </Tooltip>
                )}
              </CopyButton>
            </Group>
          )}
        </Group>
      </Stack>
    </Paper>
  );
};

export default PreviewSEO;
