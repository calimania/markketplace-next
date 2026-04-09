import { Group, Paper, Stack, Text, Title } from '@mantine/core';
import type { ReactNode } from 'react';
import TinyBreadcrumbs from '@/app/components/ui/tiny.breadcrumbs';

type BreadcrumbItem = {
  label: string;
  href?: string;
};

type TiendaListShellProps = {
  breadcrumbs: BreadcrumbItem[];
  title: string;
  subtitle: string;
  routePath?: string;
  actions?: ReactNode;
  sectionTitle: string;
  children: ReactNode;
};

export default function TiendaListShell({
  breadcrumbs,
  title,
  subtitle,
  routePath,
  actions,
  sectionTitle,
  children,
}: TiendaListShellProps) {
  return (
    <Stack gap="md">
      <TinyBreadcrumbs items={breadcrumbs} />

      <Group justify="space-between" align="end">
        <div>
          <Title order={1}>{title}</Title>
          {!!routePath && (
            <Text c="dimmed" mt={2}>
              <span className="accent-blue">{routePath}</span>
            </Text>
          )}
          <Text size="xs" c="dimmed" mt={4}>{subtitle}</Text>
        </div>
        {!!actions && <Group>{actions}</Group>}
      </Group>

      <Paper withBorder p="md" radius="md">
        <Stack gap="sm">
          <Text fw={600}>{sectionTitle}</Text>
          {children}
        </Stack>
      </Paper>
    </Stack>
  );
}
