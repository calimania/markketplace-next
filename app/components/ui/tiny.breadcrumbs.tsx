import Link from 'next/link';
import { Group, Text } from '@mantine/core';

type Crumb = {
  label: string;
  href?: string;
};

type TinyBreadcrumbsProps = {
  items: Crumb[];
};

export default function TinyBreadcrumbs({ items }: TinyBreadcrumbsProps) {
  return (
    <Group className="tiny-breadcrumbs" gap={6} style={{ minHeight: 20, flexWrap: 'wrap' }}>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <Group key={`${item.label}-${index}`} gap={6}>
            {item.href && !isLast ? (
              <Link href={item.href} style={{ textDecoration: 'none' }}>
                <Text size="xs" c="dimmed" fw={600} style={{ letterSpacing: '0.02em' }}>
                  {item.label}
                </Text>
              </Link>
            ) : (
              <Text size="xs" fw={700} c={isLast ? 'dark' : 'dimmed'} style={{ letterSpacing: '0.02em' }}>
                {item.label}
              </Text>
            )}
            {!isLast && (
              <Text size="xs" c="dimmed" aria-hidden="true">
                /
              </Text>
            )}
          </Group>
        );
      })}
    </Group>
  );
}