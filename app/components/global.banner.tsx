'use client';

import { useEffect, useState } from 'react';
import { Group, ActionIcon, Container, Paper } from '@mantine/core';
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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const safePathname = mounted ? (pathname || '') : '';

  const storesActive = safePathname.startsWith('/stores');
  const blogActive = safePathname.startsWith('/blog');
  const inTienda = safePathname.startsWith('/tienda');

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

            {!inTienda && (
              <>
                <Link
                  href="/stores"
                  prefetch={false}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    color: storesActive ? markketColors.rosa.main : markketColors.neutral.darkGray,
                    paddingInline: 10,
                    paddingBlock: 4,
                    borderRadius: 999,
                    background: storesActive ? markketColors.rosa.light : 'transparent',
                    textDecoration: 'none',
                  }}
                >
                  <IconBuildingStore size={15} />
                  <span className="global-banner-label">Stores</span>
                </Link>

                <Link
                  href="/blog"
                  prefetch={false}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    color: blogActive ? markketColors.sections.blog.main : markketColors.neutral.darkGray,
                    paddingInline: 10,
                    paddingBlock: 4,
                    borderRadius: 999,
                    background: blogActive ? markketColors.sections.blog.light : 'transparent',
                    textDecoration: 'none',
                  }}
                >
                  <IconArticle size={15} />
                  <span className="global-banner-label">Blog</span>
                </Link>
              </>
            )}
          </Group>

          <Group gap="xs" align="center" wrap="nowrap">
            {extraActions}
            <AccountButton />
          </Group>
        </Group>
      </Container>

      <style jsx>{`
        @media (max-width: 40em) {
          .global-banner-label {
            display: none;
          }
        }
      `}</style>
    </Paper>
  );
};
