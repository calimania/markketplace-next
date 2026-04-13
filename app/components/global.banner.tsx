'use client';

import { Group, ActionIcon, Container, Paper, Anchor, Text } from '@mantine/core';
import { IconHome, IconBuildingStore, IconArticle, IconUser } from '@tabler/icons-react';
import Link from 'next/link';
import { useAuth } from '@/app/providers/auth.provider';
import { useEffect, useState } from 'react';
import { useEmbeddedMode } from '@/app/hooks/useEmbeddedMode';
import { markketColors } from '@/markket/colors.config';

interface GlobalBannerProps {
  extraActions?: React.ReactNode;
}

export function GlobalBanner({ extraActions }: GlobalBannerProps) {
  const { maybe } = useAuth();
  const [isMaybe, setIsMaybe] = useState(false);
  const embedded = useEmbeddedMode();

  useEffect(() => {
    const ismaybe = maybe();
    setIsMaybe(ismaybe);
  }, [maybe]);

  if (embedded) {
    return null;
  }

  return (
    <Paper
      className="global-banner"
      py="xs"
      style={{
        borderBottom: `1px solid ${markketColors.neutral.gray}`,
        position: 'sticky',
        top: 0,
        zIndex: 100,
        backgroundColor: 'var(--mantine-color-body)',
      }}
    >
      <Container size="lg">
        <Group justify="space-between" align="center" wrap="nowrap" gap="xs">
          <Group gap="xs" align="center" wrap="nowrap">
            <ActionIcon
              component={Link}
              href="/"
              variant="subtle"
              size="md"
              aria-label="Home"
              radius="md"
            >
              <IconHome size={18} />
            </ActionIcon>

            <Anchor
              component={Link}
              href="/stores"
              underline="never"
              style={{ display: 'flex', alignItems: 'center', gap: 6, color: markketColors.neutral.darkGray, paddingInline: 2 }}
            >
              <IconBuildingStore size={15} />
              <Text size="sm" visibleFrom="sm">Stores</Text>
            </Anchor>

            <Anchor
              component={Link}
              href="/blog"
              underline="never"
              style={{ display: 'flex', alignItems: 'center', gap: 6, color: markketColors.neutral.darkGray, paddingInline: 2 }}
            >
              <IconArticle size={15} />
              <Text size="sm" visibleFrom="sm">Blog</Text>
            </Anchor>
          </Group>

          <Group gap="xs" align="center" wrap="nowrap">
            {extraActions}
            {isMaybe && (
              <ActionIcon
                component={Link}
                href="/me"
                variant="light"
                size="md"
                radius="md"
                aria-label="My workspace"
                style={{ color: markketColors.rosa.main, background: markketColors.rosa.light }}
              >
                <IconUser size={16} />
              </ActionIcon>
            )}
          </Group>
        </Group>
      </Container>
    </Paper>
  );
};
