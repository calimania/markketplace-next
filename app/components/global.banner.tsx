'use client';

import { Group, ActionIcon, Container, Paper, Anchor, Text } from '@mantine/core';
import { IconHome, IconBuildingStore, IconArticle } from '@tabler/icons-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEmbeddedMode } from '@/app/hooks/useEmbeddedMode';
import { markketColors } from '@/markket/colors.config';
import AccountButton from '@/app/components/ui/account.button';

interface GlobalBannerProps {
  extraActions?: React.ReactNode;
}

export function GlobalBanner({ extraActions }: GlobalBannerProps) {
  const embedded = useEmbeddedMode();
  const pathname = usePathname();

  const storesActive = pathname?.startsWith('/stores');
  const blogActive = pathname?.startsWith('/blog');

  if (embedded) return null;

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
              prefetch={false}
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
              prefetch={false}
              underline="never"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                color: storesActive ? markketColors.rosa.main : markketColors.neutral.darkGray,
                paddingInline: 10,
                paddingBlock: 4,
                borderRadius: 999,
                background: storesActive ? markketColors.rosa.light : 'transparent',
              }}
            >
              <IconBuildingStore size={15} />
              <Text size="sm" visibleFrom="sm">Stores</Text>
            </Anchor>

            <Anchor
              component={Link}
              href="/blog"
              prefetch={false}
              underline="never"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                color: blogActive ? markketColors.sections.blog.main : markketColors.neutral.darkGray,
                paddingInline: 10,
                paddingBlock: 4,
                borderRadius: 999,
                background: blogActive ? markketColors.sections.blog.light : 'transparent',
              }}
            >
              <IconArticle size={15} />
              <Text size="sm" visibleFrom="sm">Blog</Text>
            </Anchor>
          </Group>

          <Group gap="xs" align="center" wrap="nowrap">
            {extraActions}
            <AccountButton />
          </Group>
        </Group>
      </Container>
    </Paper>
  );
};
