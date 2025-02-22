'use client';

import { Group, ActionIcon, Container, Paper } from '@mantine/core';
import { IconHome } from '@tabler/icons-react';
import Link from 'next/link';
import { useAuth } from '../providers/auth';

interface GlobalBannerProps {
  extraActions?: React.ReactNode;
}

export function GlobalBanner({ extraActions }: GlobalBannerProps) {
  const { user } = useAuth();

  return (
    <Paper
      py="xs"
      style={{
        borderBottom: '1px solid var(--mantine-color-gray-2)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        backgroundColor: 'var(--mantine-color-body)'
      }}
    >
      <Container size="lg">
        <Group justify="space-between">
          <Group>
            <Link href={user?.id ? '/dashboard' : '/'}>
              <ActionIcon
                variant="subtle"
                size="md"
                aria-label="Home"
              >
                <IconHome size={18} />
              </ActionIcon>
            </Link>
          </Group>
          {extraActions && (
            <Group gap="xs">
              {extraActions}
            </Group>
          )}
        </Group>
      </Container>
    </Paper>
  );
};
