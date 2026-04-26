'use client';

import { Card, Text, Badge, Group, Box, Anchor } from '@mantine/core';
import { IconArrowRight, IconMapPin } from '@tabler/icons-react';
import { Store } from "@/markket/store.d";
import { markketColors } from '@/markket/colors.config';

export interface StoreCardProps {
  store: Store;
  idx: number;
  featured?: boolean;
}

export function StoreCard({ store, featured }: StoreCardProps) {
  const coverUrl = store.Cover?.formats?.small?.url || store.Cover?.formats?.thumbnail?.url || store.Cover?.url || store.SEO?.socialImage?.formats?.small?.url || store.SEO?.socialImage?.url;
  const logoUrl = store.Logo?.formats?.small?.url || store.Logo?.formats?.thumbnail?.url || store.Logo?.url;
  const description = store.SEO?.metaDescription || '';

  return (
    <Anchor
      href={`/${store.slug}`}
      underline="never"
      style={{ display: 'block', height: '100%' }}
    >
      <Card
        shadow="none"
        padding={0}
        radius="xl"
        withBorder
        style={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          borderColor: markketColors.neutral.gray,
          overflow: 'hidden',
          transition: 'transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease',
          cursor: 'pointer',
        }}
        onMouseEnter={(e) => {
          const el = e.currentTarget as HTMLElement;
          el.style.transform = 'translateY(-4px)';
          el.style.boxShadow = `0 12px 32px ${markketColors.rosa.main}22`;
          el.style.borderColor = `${markketColors.rosa.main}50`;
        }}
        onMouseLeave={(e) => {
          const el = e.currentTarget as HTMLElement;
          el.style.transform = '';
          el.style.boxShadow = '';
          el.style.borderColor = markketColors.neutral.gray;
        }}
      >
        {/* Cover / banner */}
        <Box
          style={{
            height: featured ? 200 : 140,
            background: coverUrl
              ? `url(${coverUrl}) center/cover no-repeat`
              : markketColors.gradients.hero,
            position: 'relative',
            flexShrink: 0,
          }}
        >
          {/* Logo pill */}
          <Box
            style={{
              position: 'absolute',
              bottom: -28,
              left: 20,
              width: 56,
              height: 56,
              borderRadius: 14,
              background: 'white',
              border: `2px solid ${markketColors.neutral.gray}`,
              boxShadow: '0 2px 12px rgba(0,0,0,0.10)',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '1.4rem',
              color: markketColors.rosa.main,
              backgroundImage: logoUrl ? `url(${logoUrl})` : undefined,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            {!logoUrl && (store.title || store.slug).charAt(0).toUpperCase()}
          </Box>
        </Box>

        {/* Body */}
        <Box p="md" pt={40} style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <Group justify="space-between" align="flex-start" mb={6}>
            <Text fw={700} size="md" style={{ color: markketColors.neutral.charcoal, lineHeight: 1.3 }} lineClamp={1}>
              {store.title}
            </Text>
            <Badge
              variant="light"
              radius="xl"
              size="md"
              style={{
                background: markketColors.rosa.light,
                color: markketColors.rosa.main,
                flexShrink: 0,
              }}
            >
              <IconMapPin size={12} style={{ marginRight: 2 }} />
            </Badge>
          </Group>

          {description && (
            <Text size="sm" c="dimmed" lineClamp={2} style={{ flex: 1, lineHeight: 1.6 }}>
              {description}
            </Text>
          )}

          <Group justify="flex-end" mt="md">
            <Box
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                fontSize: '0.8rem',
                fontWeight: 600,
                color: markketColors.rosa.main,
              }}
            >
              Visit <IconArrowRight size={14} />
            </Box>
          </Group>
        </Box>
      </Card>
    </Anchor>
  );
};
