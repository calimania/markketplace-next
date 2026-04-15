import { Badge, Box, Card, Group, Stack, Text, rem } from '@mantine/core';
import Link from 'next/link';
import type { Store } from '@/markket/store.d';

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
  { key: 'about', label: 'About', href: (slug: string) => `/${slug}/about`, color: 'cyan' },
  { key: 'blog', label: 'Blog', href: (slug: string) => `/${slug}/blog`, color: 'pink' },
  { key: 'products', label: 'Products', href: (slug: string) => `/${slug}/products`, color: 'blue' },
  { key: 'events', label: 'Events', href: (slug: string) => `/${slug}/events`, color: 'green' },
] as const;

export default function StoreCrosslinks({ slug, store, items = [], currentSection }: StoreCrosslinksProps) {
  const heroImage = store?.Logo?.url || store?.SEO?.socialImage?.url || store?.Cover?.url;
  const title = store?.title || slug;
  const description = store?.SEO?.metaDescription || 'Discover more from this store.';

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
              <Badge size="lg" radius="md" variant="filled" color="dark">Store Home</Badge>
            </Link>
            {sectionLinks.map((section) => (
              <Link key={section.key} href={section.href(slug)} style={{ textDecoration: 'none' }}>
                <Badge
                  size="lg"
                  radius="md"
                  variant={currentSection === section.key ? 'filled' : 'light'}
                  color={section.color}
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
