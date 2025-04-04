'use client';

import { type Store } from '@/markket/store.d';
import {
  Paper,
  Group,
  Stack,
  Text,
  Badge,
  Avatar,
  Button,
  ActionIcon,
  Tooltip,
} from '@mantine/core';
import {
  IconExternalLink,
  IconCopy,
  IconCheck,
  IconWorld,
  IconCalendarTime,
} from '@tabler/icons-react';
import Link from 'next/link';
import { useState } from 'react';

type StoreHeaderProps = {
  store: Store;
}

export default function StoreHeader({ store }: StoreHeaderProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(`${window.location.origin}/store/${store.slug}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Paper
      withBorder
      radius="md"
      p="md"
      mb="xl"
      className="bg-gradient-to-r from-blue-50 to-purple-50"
    >
      <Group justify="space-between" wrap="nowrap">
        <Group wrap="nowrap" gap="xl">
          <Avatar
            src={store?.Logo?.url || store?.Favicon?.url}
            size={64}
            radius="md"
            className="ring-2 ring-blue-100 shadow-lg"
          />
          <Stack gap={2} className="sm:flex-1">
            <Group gap="xs">
              <Text fw={700} size="xl">
                {store?.title}
              </Text>
              <Badge
                color="green"
                radius="sm"
                variant="light"
                size="sm"
              >
                Active
              </Badge>
            </Group>
            <Group gap="xs">
              <IconWorld size={16} className="text-gray-500" />
              <Text size="sm" c="dimmed" className="flex items-center gap-2">
                {store?.slug}
                <Tooltip
                  label={copied ? "Copied!" : "Copy store URL"}
                  position="right"
                >
                  <ActionIcon
                    variant="subtle"
                    color={copied ? "teal" : "gray"}
                    onClick={handleCopyUrl}
                  >
                    {copied ? <IconCheck size={16} /> : <IconCopy size={16} />}
                  </ActionIcon>
                </Tooltip>
              </Text>
            </Group>
            <Group gap="lg">
              <Text size="sm" c="dimmed" className="flex items-center gap-1">
                <IconCalendarTime size={16} />
                Created {new Date(store?.createdAt).toLocaleDateString()}
              </Text>
              {store?.URLS?.length > 0 && (
                <Badge
                  color="blue"
                  radius="sm"
                  variant="dot"
                >
                  {store.URLS.length} URLs
                </Badge>
              )}
            </Group>
          </Stack>
        </Group>

        <Group className="sm:hidden">
          <Button
            component={Link}
            href={`/store/${store?.slug}`}
            target="_blank"
            variant="light"
            rightSection={<IconExternalLink size={16} />}
          >
            View Store
          </Button>
        </Group>
      </Group>
    </Paper>
  );
}