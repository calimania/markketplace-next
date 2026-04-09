import { Group, Paper, Stack, Text, Title } from '@mantine/core';
import type { ReactNode } from 'react';
import TinyBreadcrumbs from '@/app/components/ui/tiny.breadcrumbs';

type BreadcrumbItem = {
  label: string;
  href?: string;
};

type TiendaDetailShellProps = {
  breadcrumbs: BreadcrumbItem[];
  title: string;
  routePath: string;
  helperText?: string;
  actions?: ReactNode;
  children: ReactNode;
};

export default function TiendaDetailShell({
  breadcrumbs,
  title,
  routePath,
  helperText = 'Read-only preview',
  actions,
  children,
}: TiendaDetailShellProps) {
  return (
    <Stack gap="md">
      <TinyBreadcrumbs items={breadcrumbs} />

      <Group justify="space-between" align="end">
        <div>
          <Title order={1}>{title}</Title>
          <Text c="dimmed">{helperText}</Text>
          <Text c="dimmed" mt={4}>
            <span className="accent-blue">{routePath}</span>
          </Text>
        </div>
        {!!actions && <Group>{actions}</Group>}
      </Group>

      <Paper withBorder p="md" radius="md">
        {children}
      </Paper>
    </Stack>
  );
}
