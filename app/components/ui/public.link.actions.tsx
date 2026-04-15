'use client';

import { useMemo, useState } from 'react';
import { ActionIcon, Button, Group, TextInput, Tooltip } from '@mantine/core';
import { IconCheck, IconCopy, IconExternalLink } from '@tabler/icons-react';

type PublicLinkActionsProps = {
  path: string;
  openLabel?: string;
};

export default function PublicLinkActions({
  path,
  openLabel = 'Open public page',
}: PublicLinkActionsProps) {
  const [copied, setCopied] = useState(false);

  const absoluteUrl = useMemo(() => {
    if (typeof window === 'undefined') return path;

    try {
      return new URL(path, window.location.origin).toString();
    } catch {
      return path;
    }
  }, [path]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(absoluteUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <Group gap="xs" wrap="wrap" align="center">
      <Button
        component="a"
        href={path}
        target="_blank"
        rel="noopener noreferrer"
        size="xs"
        variant="light"
        rightSection={<IconExternalLink size={14} />}
      >
        {openLabel}
      </Button>
      <TextInput
        value={absoluteUrl}
        readOnly
        size="xs"
        style={{ flex: 1, minWidth: 220 }}
      />
      <Tooltip label={copied ? 'Copied' : 'Copy link'}>
        <ActionIcon
          variant={copied ? 'filled' : 'light'}
          color={copied ? 'teal' : 'gray'}
          size="lg"
          onClick={handleCopy}
          aria-label="Copy public URL"
        >
          {copied ? <IconCheck size={16} /> : <IconCopy size={16} />}
        </ActionIcon>
      </Tooltip>
    </Group>
  );
}
