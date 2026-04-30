import { Group, Paper, Stack, Text, Title } from '@mantine/core';
import type { ReactNode } from 'react';
import TinyBreadcrumbs from '@/app/components/ui/tiny.breadcrumbs';
import { markketColors } from '@/markket/colors.config';

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
  tone?: 'blog' | 'products' | 'events' | 'pages' | 'albums' | 'crm';
};

const TONE_STYLES = {
  blog: {
    main: markketColors.sections.blog.main,
    light: markketColors.sections.blog.light,
  },
  products: {
    main: markketColors.sections.shop.main,
    light: markketColors.sections.shop.light,
  },
  events: {
    main: markketColors.sections.events.main,
    light: markketColors.sections.events.light,
  },
  pages: {
    main: markketColors.sections.about.main,
    light: markketColors.sections.about.light,
  },
  albums: {
    main: markketColors.rosa.main,
    light: markketColors.rosa.light,
  },
  crm: {
    main: markketColors.sections.about.main,
    light: markketColors.sections.about.light,
  },
} as const;

export default function TiendaListShell({
  breadcrumbs,
  title,
  subtitle,
  routePath,
  actions,
  sectionTitle,
  children,
  tone = 'pages',
}: TiendaListShellProps) {
  const toneStyle = TONE_STYLES[tone];

  return (
    <Stack gap="md">
      <TinyBreadcrumbs items={breadcrumbs} />

      <Group justify="space-between" align="end">
        <div>
          <Title order={1}>{title}</Title>
          {!!routePath && (
            <Text c="dimmed" mt={2}>
              <span
                className="accent-blue"
                style={{
                  color: toneStyle.main,
                }}
              >
                {routePath}
              </span>
            </Text>
          )}
          <Text size="xs" c="dimmed" mt={4}>{subtitle}</Text>
        </div>
        {!!actions && <Group>{actions}</Group>}
      </Group>

      <Paper
        withBorder
        p="md"
        radius="md"
        style={{
          borderColor: `${toneStyle.main}3a`,
          background: `linear-gradient(140deg, ${toneStyle.light} 0%, #ffffff 38%, #ffffff 100%)`,
        }}
      >
        <Stack gap="sm">
          <Text
            fw={700}
            size="sm"
            tt="uppercase"
            style={{
              letterSpacing: '0.08em',
              color: toneStyle.main,
            }}
          >
            {sectionTitle}
          </Text>
          {children}
        </Stack>
      </Paper>
    </Stack>
  );
}
