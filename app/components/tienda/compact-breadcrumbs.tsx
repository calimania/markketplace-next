'use client';

import { Breadcrumbs, Group, Text, ActionIcon } from '@mantine/core';
import { IconChevronLeft, IconHome } from '@tabler/icons-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEmbeddedMode } from '@/app/hooks/useEmbeddedMode';

/**
 * CompactBreadcrumbs
 *
 * Shows a minimal breadcrumb trail only in embedded mode.
 * - Homepage icon (clickable)
 * - Current section title
 * - No full navigation (prevents user escape)
 *
 * @example
 * <CompactBreadcrumbs storeSlug="artisan-collective" section="products" />
 */

interface CompactBreadcrumbsProps {
  storeSlug?: string;
  section?: string;
}

export default function CompactBreadcrumbs({ storeSlug, section }: CompactBreadcrumbsProps) {
  const embedded = useEmbeddedMode();
  const pathname = usePathname();

  if (!embedded) {
    return null;
  }

  // Map section names to display text
  const sectionLabel = section
    ? section.charAt(0).toUpperCase() + section.slice(1)
    : 'Store';

  const items = [
    {
      title: (
        <ActionIcon
          variant="subtle"
          size="sm"
          p={0}
          component={Link}
          href={storeSlug ? `/tienda/${storeSlug}` : '/tienda'}
          aria-label="Back to store"
        >
          <IconHome size={14} />
        </ActionIcon>
      ),
    },
  ];

  if (section) {
    items.push({
      title: (
        <Text size="sm" fw={500} c="dimmed">
          {sectionLabel}
        </Text>
      ),
    });
  }

  return (
    <Group
      p="xs"
      px="md"
      style={{
        borderBottom: '1px solid var(--mantine-color-gray-2)',
        backgroundColor: 'var(--mantine-color-blue-0)',
        minHeight: '32px',
        display: 'flex',
        alignItems: 'center',
      }}
      gap={4}
    >
      <Breadcrumbs separator={<Text size="xs">•</Text>}>
        {items.map((item, idx) => (
          <div key={idx}>{item.title}</div>
        ))}
      </Breadcrumbs>
    </Group>
  );
}
