import { Badge, Box, Card, Group, Stack, Text, rem } from '@mantine/core';
import Link from 'next/link';
import type { Store } from '@/markket/store.d';
import { markketColors } from '@/markket/colors.config';

type StoreCrosslinkItem = {
  href: string;
  label: string;
};

type StoreCrosslinksProps = {
  slug: string;
  store?: Store | null;
  items?: StoreCrosslinkItem[];
  currentSection?: 'blog' | 'about' | 'products' | 'events';
};

const sectionLinks = [
  {
    key: 'about',
    label: 'About',
    href: (slug: string) => `/${slug}/about`,
    color: markketColors.sections.about.main,
    light: markketColors.sections.about.light,
  },
  {
    key: 'blog',
    label: 'Blog',
    href: (slug: string) => `/${slug}/blog`,
    color: markketColors.sections.blog.main,
    light: markketColors.sections.blog.light,
  },
  {
    key: 'products',
    label: 'Products',
    href: (slug: string) => `/${slug}/products`,
    color: markketColors.sections.shop.main,
    light: markketColors.sections.shop.light,
  },
  {
    key: 'events',
    label: 'Events',
    href: (slug: string) => `/${slug}/events`,
    color: markketColors.sections.events.main,
    light: markketColors.sections.events.light,
  },
] as const;

export default function StoreCrosslinks({ slug, store, items = [], currentSection }: StoreCrosslinksProps) {
  const heroImage = store?.Logo?.url || store?.SEO?.socialImage?.url || store?.Cover?.url;
  const title = store?.title || slug;
  const description = store?.SEO?.metaDescription || 'Explore more sections from this storefront.';

  return (
    <Box mt="xl" pt="xl" style={{ borderTop: '1px solid rgba(148, 163, 184, 0.25)' }}>
      <Card withBorder radius="xl" padding="lg" shadow="sm">
        <Stack gap="md">
          <Group align="flex-start" wrap="nowrap">
            {heroImage ? (
              <img
                src={heroImage}
                alt={title}
                style={{
                  width: rem(64),
                  height: rem(64),
                  objectFit: 'cover',
                  borderRadius: rem(16),
                  flexShrink: 0,
                }}
              />
            ) : (
              <Box
                style={{
                  width: rem(64),
                  height: rem(64),
                  borderRadius: rem(16),
                  background: 'linear-gradient(135deg, #e0f7fa 0%, #fce4ec 100%)',
                  flexShrink: 0,
                }}
              />
            )}

            <Stack gap={4} style={{ flex: 1 }}>
              <Text size="xs" tt="uppercase" fw={700} c="dimmed">
                From this store
              </Text>
              <Link href={`/${slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <Text fw={700} size="xl">{title}</Text>
              </Link>
              <Text size="sm" c="dimmed">{description}</Text>
            </Stack>
          </Group>

          <Group gap="xs" wrap="wrap">
            <Link href={`/${slug}`} style={{ textDecoration: 'none' }}>
              <Badge
                size="lg"
                radius="md"
                variant="filled"
                style={{ background: markketColors.neutral.charcoal, color: '#fff' }}
              >
                Store Home
              </Badge>
            </Link>
            {sectionLinks.map((section) => (
              <Link key={section.key} href={section.href(slug)} style={{ textDecoration: 'none' }}>
                <Badge
                  size="lg"
                  radius="md"
                  variant={currentSection === section.key ? 'filled' : 'light'}
                  style={
                    currentSection === section.key
                      ? {
                        background: section.color,
                        color: '#fff',
                      }
                      : {
                        background: section.light,
                        color: section.color,
                        border: `1px solid ${section.color}33`,
                      }
                  }
                >
                  {section.label}
                </Badge>
              </Link>
            ))}
          </Group>

          {items.length > 0 && (
            <Stack gap="xs">
              <Text size="xs" tt="uppercase" fw={700} c="dimmed">Keep exploring</Text>
              <Group gap="xs" wrap="wrap">
                {items.slice(0, 4).map((item) => (
                  <Link key={item.href} href={item.href} style={{ textDecoration: 'none' }}>
                    <Badge size="md" radius="md" variant="light" color="gray">
                      {item.label}
                    </Badge>
                  </Link>
                ))}
              </Group>
            </Stack>
          )}
        </Stack>
      </Card>
    </Box>
  );
}
