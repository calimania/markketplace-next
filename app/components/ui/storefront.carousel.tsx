'use client';

import { useRef, useState } from 'react';
import { Box, Text, Group, ActionIcon, Stack, rem } from '@mantine/core';
import { IconArrowRight, IconChevronLeft, IconChevronRight } from '@tabler/icons-react';
import Link from 'next/link';
import { Store } from '@/markket/store.d';
import { markketColors } from '@/markket/colors.config';

const pickImg = (...urls: Array<string | undefined | null>): string | undefined =>
  urls.find((u): u is string => Boolean(u));

interface StorefrontCarouselProps {
  stores: Store[];
}

const fmt = (n: number) => n.toString().padStart(2, '0');

const getDesc = (store?: Store) =>
  store?.SEO?.metaDescription ||
  store?.SEO?.metaTitle ||
  'Independent storefront on the Markketplace network.';

export function StorefrontCarousel({ stores }: StorefrontCarouselProps) {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const stripRef = useRef<HTMLDivElement | null>(null);

  if (!stores.length) return null;

  const featured = stores[selectedIdx];
  const progress = ((selectedIdx + 1) / stores.length) * 100;
  const coverUrl = pickImg(
    featured?.Cover?.formats?.large?.url,
    featured?.Cover?.formats?.medium?.url,
    featured?.Cover?.formats?.small?.url,
    featured?.Cover?.url,
    featured?.SEO?.socialImage?.formats?.medium?.url,
    featured?.SEO?.socialImage?.url,
  );
  const logoUrl = pickImg(
    featured?.Logo?.formats?.small?.url,
    featured?.Logo?.formats?.thumbnail?.url,
    featured?.Logo?.url,
  );
  const href = featured?.slug ? `/${featured.slug}` : '/stores';

  const scrollStrip = (dir: 'left' | 'right') => {
    const el = stripRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === 'left' ? -240 : 240, behavior: 'smooth' });
  };

  return (
    <Box
      style={{
        borderRadius: 24,
        overflow: 'hidden',
        background: '#fff',
        border: `1px solid ${markketColors.neutral.lightGray}`,
        boxShadow: '0 12px 40px rgba(0,0,0,0.08)',
      }}
    >
      {/* ── Featured panel ── */}
      <Link href={href} style={{ textDecoration: 'none', display: 'block' }}>
        <Box
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr',
          }}
        >
          {/* Cover image */}
          <Box
            style={{
              position: 'relative',
              height: 'clamp(220px, 30vw, 420px)',
              background: coverUrl
                ? `url(${coverUrl}) center/cover no-repeat`
                : `linear-gradient(135deg, ${markketColors.sections.shop.main} 0%, ${markketColors.rosa.main} 100%)`,
            }}
          >
            <Box
              style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(180deg, rgba(0,0,0,0.0) 40%, rgba(0,0,0,0.48) 100%)',
              }}
            />
            {logoUrl && (
              <Box
                style={{
                  position: 'absolute',
                  top: 16,
                  left: 16,
                  width: 52,
                  height: 52,
                  borderRadius: 14,
                  overflow: 'hidden',
                  background: 'rgba(255,255,255,0.96)',
                  padding: 6,
                  boxShadow: '0 4px 16px rgba(0,0,0,0.16)',
                }}
              >
                <img
                  src={logoUrl}
                  alt={`${featured?.title} logo`}
                  style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: 8 }}
                />
              </Box>
            )}
            <Text
              size="xs"
              fw={600}
              style={{
                position: 'absolute',
                top: 16,
                right: 16,
                color: 'rgba(255,255,255,0.9)',
                fontFamily: 'monospace',
                letterSpacing: '0.1em',
                background: 'rgba(0,0,0,0.28)',
                borderRadius: 8,
                padding: '4px 10px',
              }}
            >
              {fmt(selectedIdx + 1)} / {fmt(stores.length)}
            </Text>
          </Box>

          {/* Text panel */}
          <Box
            style={{
              padding: 'clamp(1.2rem, 3vw, 2rem)',
              background: [
                `radial-gradient(circle at top left, ${markketColors.sections.shop.light} 0%, transparent 50%)`,
                `linear-gradient(180deg, ${markketColors.neutral.offWhite} 0%, #fff 100%)`,
              ].join(', '),
              display: 'flex',
              flexDirection: 'column',
              gap: rem(16),
            }}
          >
            <Stack gap={8}>
              <Text
                style={{
                  fontSize: 'clamp(1.4rem, 4vw, 2.4rem)',
                  fontWeight: 900,
                  letterSpacing: '-0.03em',
                  lineHeight: 1.1,
                  color: markketColors.neutral.charcoal,
                }}
              >
                {featured?.title || 'A store worth opening'}
              </Text>

              <Text
                style={{
                  color: markketColors.neutral.darkGray,
                  lineHeight: 1.6,
                  fontSize: '0.95rem',
                }}
                lineClamp={2}
              >
                {getDesc(featured)}
              </Text>
            </Stack>

            <Group gap={6} wrap="nowrap" align="center">
              <Text
                size="sm"
                fw={700}
                style={{ color: markketColors.sections.shop.main }}
              >
                Visit /{featured?.slug || 'stores'}
              </Text>
              <IconArrowRight size={15} color={markketColors.sections.shop.main} />
            </Group>
          </Box>
        </Box>
      </Link>

      {/* ── Thumbnail strip ── */}
      {stores.length > 1 && (
        <Box style={{ background: '#fff', borderTop: `1px solid ${markketColors.neutral.lightGray}` }}>
          {/* Progress bar */}
          <Box style={{ height: 3, background: markketColors.neutral.lightGray }}>
            <Box
              style={{
                height: '100%',
                width: `${progress}%`,
                background: `linear-gradient(90deg, ${markketColors.sections.shop.main} 0%, ${markketColors.rosa.main} 100%)`,
                transition: 'width 0.25s ease',
              }}
            />
          </Box>

          <Box px="md" pt="sm" pb="md">
            <Group justify="space-between" align="center" mb="sm" wrap="nowrap">
              <Text
                size="xs"
                fw={600}
                style={{
                  color: markketColors.neutral.mediumGray,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                }}
              >
                {fmt(selectedIdx + 1)} of {stores.length} stores
              </Text>
              <Group gap={6} wrap="nowrap">
                <ActionIcon
                  variant="default"
                  radius="xl"
                  size="md"
                  onClick={() => scrollStrip('left')}
                  aria-label="Previous store"
                  style={{ borderColor: markketColors.neutral.lightGray }}
                >
                  <IconChevronLeft size={15} />
                </ActionIcon>
                <ActionIcon
                  variant="default"
                  radius="xl"
                  size="md"
                  onClick={() => scrollStrip('right')}
                  aria-label="Next store"
                  style={{ borderColor: markketColors.neutral.lightGray }}
                >
                  <IconChevronRight size={15} />
                </ActionIcon>
              </Group>
            </Group>

            <Box
              ref={stripRef}
              style={{
                display: 'grid',
                gridAutoFlow: 'column',
                gridAutoColumns: 'minmax(140px, 180px)',
                gap: rem(10),
                overflowX: 'auto',
                paddingBottom: rem(4),
                scrollbarWidth: 'none',
              }}
            >
              {stores.map((store, idx) => {
                const isActive = idx === selectedIdx;
                const thumbUrl = pickImg(
                  store?.Cover?.formats?.thumbnail?.url,
                  store?.Cover?.formats?.small?.url,
                  store?.Cover?.url,
                  store?.Logo?.formats?.thumbnail?.url,
                  store?.Logo?.url,
                );

                return (
                  <Box
                    key={store.documentId || store.id || store.slug || idx}
                    component="button"
                    type="button"
                    onClick={() => setSelectedIdx(idx)}
                    style={{
                      appearance: 'none',
                      border: `2px solid ${isActive ? markketColors.sections.shop.main : markketColors.neutral.lightGray}`,
                      background: '#fff',
                      borderRadius: 14,
                      padding: 0,
                      cursor: 'pointer',
                      overflow: 'hidden',
                      textAlign: 'left',
                      transition: 'border-color 0.18s, transform 0.18s, box-shadow 0.18s',
                      transform: isActive ? 'translateY(-2px)' : 'none',
                      boxShadow: isActive
                        ? `0 6px 20px ${markketColors.sections.shop.main}28`
                        : '0 2px 8px rgba(0,0,0,0.05)',
                    }}
                  >
                    <Box
                      style={{
                        height: rem(80),
                        background: thumbUrl
                          ? `url(${thumbUrl}) center/cover no-repeat`
                          : `linear-gradient(135deg, ${markketColors.sections.shop.main} 0%, ${markketColors.rosa.main} 100%)`,
                      }}
                    />
                    <Box p="xs">
                      <Text size="xs" fw={700} lineClamp={1} style={{ color: markketColors.neutral.charcoal }}>
                        {store.title}
                      </Text>
                      <Text size="xs" lineClamp={1} style={{ color: markketColors.neutral.mediumGray, marginTop: 2 }}>
                        /{store.slug}
                      </Text>
                    </Box>
                  </Box>
                );
              })}
            </Box>
          </Box>
        </Box>
      )}
    </Box>
  );
}
