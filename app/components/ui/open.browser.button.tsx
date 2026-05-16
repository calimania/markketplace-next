'use client';

import { Button } from '@mantine/core';
import { IconExternalLink } from '@tabler/icons-react';
import { useEmbeddedMode } from '@/app/hooks/useEmbeddedMode';
import { getNonEmbedHref } from '@/app/utils/embed.query';
import { markketColors } from '@/markket/colors.config';

export default function OpenBrowserButton() {
  const embedded = useEmbeddedMode();

  if (!embedded) return null;

  return (
    <Button
      size="xs"
      radius="xl"
      leftSection={<IconExternalLink size={14} />}
      onClick={() => {
        if (typeof window === 'undefined') return;
        const cleanHref = getNonEmbedHref(window.location.href);
        window.open(cleanHref, '_blank', 'noopener,noreferrer');
      }}
      style={{
        position: 'fixed',
        right: 12,
        bottom: 12,
        zIndex: 1200,
        background: markketColors.neutral.charcoal,
        color: '#fff',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.25)',
      }}
    >
      Open in browser
    </Button>
  );
}
