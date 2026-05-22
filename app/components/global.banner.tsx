'use client';

import { Group, Container, Paper } from '@mantine/core';
import Link from 'next/link';
import { useEmbeddedMode } from '@/app/hooks/useEmbeddedMode';
import { markketColors } from '@/markket/colors.config';
import AccountButton from '@/app/components/ui/account.button';
import { usePathname } from "next/navigation";

interface GlobalBannerProps {
  extraActions?: React.ReactNode;
}

export function GlobalBanner({ extraActions }: GlobalBannerProps) {
  const embedded = useEmbeddedMode();
  const pathname = usePathname();

  if (embedded) return null;

  return (
    <Paper
      py="xs"
      style={{
        borderBottom: `1px solid ${markketColors.neutral.lightGray}`,
        position: 'sticky',
        top: 0,
        zIndex: 100,
        backgroundColor: 'var(--mantine-color-body)',
      }}
    >
      <Container size="lg">
        <Group justify="space-between" align="center" wrap="nowrap">
          <Link
            href={pathname.startsWith('tienda') ? '/tienda' : '/'}
            prefetch={false}
            style={{
              textDecoration: 'none',
              color: markketColors.neutral.charcoal,
              fontFamily: 'var(--font-playfair), serif',
              fontSize: '1.15rem',
              fontWeight: 700,
              letterSpacing: '-0.02em',
            }}
          >
            Markkët
          </Link>
          <Group gap="xs" align="center" wrap="nowrap">
            {extraActions}
            <AccountButton />
          </Group>
        </Group>
      </Container>
    </Paper>
  );
};
