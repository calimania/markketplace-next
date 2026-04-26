import { type Page } from '@/markket/page.d';
import { Group, Text, Title, Paper, Box, Stack } from '@mantine/core';
import { IconArrowRight } from '@tabler/icons-react';
import { markketColors } from '@/markket/colors.config';
import Link from 'next/link';

type PageListProps = {
  pages: Page[];
  storeSlug?: string;
};

const excluded_list = ['docs', 'blog', 'events', 'about', 'products'];

export const PageList = ({ pages, storeSlug }: PageListProps) => {
  return (
    <Stack gap="md">
      {pages.map((page) => {
        if (['home', 'receipt'].includes(page.slug)) return null;
        return (
          <Link
            key={page.id}
            href={`/store/${storeSlug}/${!excluded_list.includes(page.slug) ? 'about/' : ''}${page.slug}`}
            style={{ textDecoration: 'none' }}
          >
            <Paper
              withBorder
              radius="xl"
              p={0}
              style={{
                borderColor: `${markketColors.sections.about.main}28`,
                background: '#ffffff',
                boxShadow: '0 4px 14px rgba(15, 23, 42, 0.05)',
                overflow: 'hidden',
                transition: 'box-shadow 0.18s ease, transform 0.18s ease',
              }}
              className="page-list-card"
            >
              <Group gap={0} wrap="nowrap" align="stretch">
                {page?.SEO?.socialImage?.url ? (
                  <Box
                    style={{
                      width: 140,
                      minHeight: 120,
                      flexShrink: 0,
                      background: `url(${page.SEO.socialImage.url}) center/cover no-repeat`,
                    }}
                  />
                ) : (
                    <Box
                      style={{
                        width: 140,
                        minHeight: 120,
                        flexShrink: 0,
                        background: `linear-gradient(135deg, ${markketColors.sections.about.light} 0%, #ffffff 100%)`,
                      }}
                    />
                )}

                <Stack gap={6} p="md" style={{ flex: 1, minWidth: 0 }}>
                  <Title order={4} fw={600} lineClamp={1} style={{ color: markketColors.neutral.charcoal, letterSpacing: '-0.02em' }}>
                    {page.Title || 'Untitled Page'}
                  </Title>

                  {page.SEO?.metaDescription && (
                    <Text size="sm" c="dimmed" lineClamp={2} lh={1.6}>
                      {page.SEO.metaDescription}
                    </Text>
                  )}

                  <Group gap={4} mt="auto" align="center">
                    <Text size="xs" fw={600} style={{ color: markketColors.sections.about.main }}>
                      Read more
                    </Text>
                    <IconArrowRight size={12} color={markketColors.sections.about.main} />
                  </Group>
                </Stack>
              </Group>
            </Paper>
          </Link>
        );
      })}
    </Stack>
  );
};
