import { Badge, Group, Paper, Stack, Text, Title } from '@mantine/core';
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

      <Paper
        withBorder
        radius="lg"
        p="sm"
        style={{
          borderColor: `${toneStyle.main}26`,
          background: 'linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(250,250,250,0.94) 100%)',
        }}
      >
        <Group justify="space-between" align="center" wrap="wrap" gap="sm">
          <Stack gap={2} style={{ minWidth: 0, flex: 1 }}>
            <Group gap={8} wrap="wrap">
              <Badge size="sm" variant="light" color="gray">
                {sectionTitle}
              </Badge>
              {!!routePath && (
                <Text size="xs" c="dimmed" style={{ color: toneStyle.main }}>
                  {routePath}
                </Text>
              )}
            </Group>
            <Title order={2} style={{ fontSize: 'clamp(1.6rem, 2.6vw, 2rem)', letterSpacing: '-0.03em' }}>{title}</Title>
            <Text size="xs" c="dimmed" maw={760}>
              {subtitle}
            </Text>
          </Stack>
          {!!actions && <Group>{actions}</Group>}
        </Group>
      </Paper>

      <Paper
        withBorder
        p="sm"
        radius="md"
        style={{
          borderColor: `${toneStyle.main}3a`,
          background: `linear-gradient(140deg, ${toneStyle.light} 0%, #ffffff 42%, #ffffff 100%)`,
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
