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

const formatIndex = (value: number) => value.toString().padStart(2, '0');

const getStoreDescription = (store?: Store) => {
  return store?.SEO?.metaDescription
    || store?.SEO?.metaTitle
    || 'Independent storefronts with a distinct point of view, curated across the Markketplace network.';
};

export function StorefrontCarousel({ stores }: StorefrontCarouselProps) {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const thumbnailsRef = useRef<HTMLDivElement | null>(null);

  if (!stores.length) return null;

  const featured = stores[selectedIdx];
  const progress = ((selectedIdx + 1) / stores.length) * 100;
  const coverUrl = pickImg(
    featured?.Cover?.formats?.medium?.url,
    featured?.Cover?.formats?.small?.url,
    featured?.Cover?.url,
    featured?.SEO?.socialImage?.url,
  );
  const logoUrl = pickImg(
    featured?.Logo?.formats?.small?.url,
    featured?.Logo?.formats?.thumbnail?.url,
    featured?.Logo?.url,
  );
  const href = featured?.slug ? `/${featured.slug}` : '/stores';

  const scrollThumbnails = (direction: 'left' | 'right') => {
    const container = thumbnailsRef.current;
    if (!container) return;

    const amount = Math.max(container.clientWidth * 0.72, 220);
    container.scrollBy({
      left: direction === 'left' ? -amount : amount,
      behavior: 'smooth',
    });
  };

  return (
    <Box
      style={{
        borderRadius: 28,
        overflow: 'hidden',
        background: '#ffffff',
        boxShadow: '0 22px 60px rgba(24, 24, 24, 0.12)',
        border: `1px solid ${markketColors.neutral.lightGray}`,
      }}
    >
      <Link href={href} style={{ textDecoration: 'none' }}>
        <Box
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1.05fr) minmax(0, 1.45fr)',
            background: markketColors.neutral.offWhite,
          }}
          className="max-md:grid-cols-1"
        >
          <Box
            style={{
              position: 'relative',
              padding: 'clamp(1.4rem, 3vw, 2.4rem)',
              background: [
                `radial-gradient(circle at top left, ${markketColors.sections.shop.light} 0%, transparent 42%)`,
                `linear-gradient(180deg, ${markketColors.neutral.offWhite} 0%, #ffffff 100%)`,
              ].join(', '),
              minHeight: 'clamp(280px, 34vw, 460px)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: rem(20),
            }}
          >
            <Stack gap={18}>
              <Group justify="space-between" align="flex-start" wrap="nowrap" gap="md">
                <Stack gap={6}>
                  <Text
                    size="xs"
                    style={{
                      fontFamily: 'monospace',
                      letterSpacing: '0.12em',
                      textTransform: 'uppercase',
                      color: markketColors.sections.shop.main,
                    }}
                  >
                    Store {formatIndex(selectedIdx + 1)}
                  </Text>
                </Stack>

                <Box
                  style={{
                    minWidth: rem(72),
                    padding: '10px 12px',
                    borderRadius: 16,
                    background: '#ffffff',
                    border: `1px solid ${markketColors.neutral.lightGray}`,
                    textAlign: 'right',
                  }}
                >
                  <Text fw={700} style={{ color: markketColors.neutral.charcoal, lineHeight: 1 }}>
                    {formatIndex(selectedIdx + 1)}
                  </Text>
                  <Text size="xs" style={{ color: markketColors.neutral.mediumGray }}>
                    / {formatIndex(stores.length)}
                  </Text>
                </Box>
              </Group>

              <Stack gap={10}>
                <Text
                  style={{
                    fontSize: 'clamp(2rem, 5vw, 3.5rem)',
                    lineHeight: 0.95,
                    fontWeight: 900,
                    letterSpacing: '-0.045em',
                    color: markketColors.neutral.charcoal,
                    textWrap: 'balance',
                  }}
                >
                  {featured?.title || 'A store worth opening'}
                </Text>

                <Text
                  style={{
                    maxWidth: rem(440),
                    color: markketColors.neutral.darkGray,
                    lineHeight: 1.7,
                    fontSize: '1rem',
                  }}
                >
                  {getStoreDescription(featured)}
                </Text>
              </Stack>
            </Stack>

            <Group justify="space-between" align="flex-end" wrap="nowrap" gap="md">
              <Stack gap={6}>
                <Text
                  size="xs"
                  fw={700}
                  style={{
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    color: markketColors.neutral.mediumGray,
                  }}
                >
                  Open the store
                </Text>
                <Text size="sm" style={{ color: markketColors.neutral.darkGray }}>
                  /{featured?.slug || 'stores'}
                </Text>
              </Stack>

              <Group gap="xs" wrap="nowrap">
                <Text
                  size="sm"
                  fw={700}
                  style={{
                    color: markketColors.sections.shop.main,
                    letterSpacing: '0.04em',
                  }}
                >
                  Enter store
                </Text>
                <IconArrowRight size={18} color={markketColors.sections.shop.main} />
              </Group>
            </Group>
          </Box>

          <Box
            style={{
              position: 'relative',
              minHeight: 'clamp(300px, 34vw, 460px)',
              background: coverUrl
                ? `url(${coverUrl}) center/cover no-repeat`
                : `linear-gradient(135deg, ${markketColors.sections.shop.main} 0%, ${markketColors.rosa.main} 100%)`,
            }}
          >
            <Box
              style={{
                position: 'absolute',
                inset: 0,
                background: [
                  'linear-gradient(180deg, rgba(21,21,21,0.08) 0%, rgba(21,21,21,0.0) 24%)',
                  'linear-gradient(180deg, rgba(21,21,21,0.04) 0%, rgba(21,21,21,0.52) 100%)',
                ].join(', '),
              }}
            />

            <Box
              style={{
                position: 'absolute',
                inset: 0,
                padding: 'clamp(1.2rem, 3vw, 2rem)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <Group justify="space-between" align="flex-start" wrap="nowrap" gap="md">
                {logoUrl && (
                  <Box
                    style={{
                      width: rem(62),
                      height: rem(62),
                      borderRadius: 18,
                      overflow: 'hidden',
                      background: 'rgba(255,255,255,0.94)',
                      padding: 8,
                      boxShadow: '0 12px 30px rgba(0,0,0,0.18)',
                    }}
                  >
                    <img
                      src={logoUrl}
                      alt={featured?.title || 'Store logo'}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 10 }}
                    />
                  </Box>
                )}
              </Group>

              <Group justify="space-between" align="flex-end" wrap="nowrap" gap="md">
                <Text
                  size="xs"
                  style={{
                    color: 'rgba(255,255,255,0.72)',
                    letterSpacing: '0.14em',
                    textTransform: 'uppercase',
                    writingMode: 'vertical-rl',
                    transform: 'rotate(180deg)',
                  }}
                  className="max-sm:hidden"
                >
                  Open store
                </Text>
              </Group>
            </Box>
          </Box>
        </Box>
      </Link>

      {stores.length > 1 && (
        <Stack gap={14} p="lg" style={{ background: '#ffffff' }}>
          <Group justify="space-between" align="center" wrap="nowrap" gap="md">
            <Stack gap={2}>
              <Text
                size="xs"
                fw={700}
                style={{
                  color: markketColors.neutral.mediumGray,
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                }}
              >
                Browse stores
              </Text>
              <Text size="sm" style={{ color: markketColors.neutral.darkGray }}>
                Scroll the strip and swap the featured panel.
              </Text>
            </Stack>

            <Group gap="xs" wrap="nowrap">
              <ActionIcon
                variant="default"
                radius="xl"
                size="lg"
                onClick={() => scrollThumbnails('left')}
                aria-label="Scroll stores left"
                style={{
                  background: '#ffffff',
                  borderColor: markketColors.neutral.lightGray,
                  color: markketColors.neutral.charcoal,
                }}
              >
                <IconChevronLeft size={18} />
              </ActionIcon>
              <ActionIcon
                variant="default"
                radius="xl"
                size="lg"
                onClick={() => scrollThumbnails('right')}
                aria-label="Scroll stores right"
                style={{
                  background: '#ffffff',
                  borderColor: markketColors.neutral.lightGray,
                  color: markketColors.neutral.charcoal,
                }}
              >
                <IconChevronRight size={18} />
              </ActionIcon>
            </Group>
          </Group>

          <Box
            style={{
              height: 6,
              borderRadius: 999,
              overflow: 'hidden',
              background: markketColors.neutral.lightGray,
            }}
          >
            <Box
              style={{
                height: '100%',
                width: `${progress}%`,
                borderRadius: 999,
                background: `linear-gradient(90deg, ${markketColors.sections.shop.main} 0%, ${markketColors.rosa.main} 100%)`,
                transition: 'width 0.22s ease',
              }}
            />
          </Box>

          <Box
            ref={thumbnailsRef}
            style={{
              display: 'grid',
              gridAutoFlow: 'column',
              gridAutoColumns: 'minmax(180px, 220px)',
              gap: rem(14),
              overflowX: 'auto',
              paddingBottom: rem(6),
              scrollbarWidth: 'thin',
            }}
          >
            {stores.map((store, idx) => {
              const isActive = idx === selectedIdx;
              const thumbUrl = pickImg(
                store?.Cover?.formats?.thumbnail?.url,
                store?.Cover?.formats?.small?.url,
                store?.Cover?.url,
                store?.Logo?.formats?.thumbnail?.url,
                store?.Logo?.formats?.small?.url,
                store?.Logo?.url,
                store?.SEO?.socialImage?.formats?.thumbnail?.url,
                store?.SEO?.socialImage?.url,
              );

              return (
                <Box
                  key={store.documentId || store.id || store.slug || idx}
                  component="button"
                  type="button"
                  onClick={() => setSelectedIdx(idx)}
                  style={{
                    appearance: 'none',
                    border: `1px solid ${isActive ? `${markketColors.rosa.main}55` : markketColors.neutral.lightGray}`,
                    background: isActive ? markketColors.neutral.offWhite : '#ffffff',
                    borderRadius: 22,
                    padding: 0,
                    cursor: 'pointer',
                    overflow: 'hidden',
                    textAlign: 'left',
                    boxShadow: isActive
                      ? `0 18px 36px ${markketColors.rosa.main}22`
                      : '0 8px 20px rgba(0,0,0,0.06)',
                    transition: 'border-color 0.2s ease, background 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease',
                    transform: isActive ? 'translateY(-2px)' : 'none',
                  }}
                >
                  <Box
                    style={{
                      height: rem(104),
                      background: thumbUrl
                        ? `url(${thumbUrl}) center/cover no-repeat`
                        : `linear-gradient(135deg, ${markketColors.sections.shop.main} 0%, ${markketColors.rosa.main} 100%)`,
                      position: 'relative',
                    }}
                  >
                    <Box
                      style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'linear-gradient(180deg, rgba(21,21,21,0.02) 0%, rgba(21,21,21,0.4) 100%)',
                      }}
                    />
                    <Text
                      size="xs"
                      fw={700}
                      style={{
                        position: 'absolute',
                        top: 12,
                        left: 12,
                        color: 'white',
                        letterSpacing: '0.12em',
                        textTransform: 'uppercase',
                      }}
                    >
                      {formatIndex(idx + 1)}
                    </Text>
                  </Box>

                  <Stack gap={6} p="sm">
                    <Text size="sm" fw={700} lineClamp={1} style={{ color: markketColors.neutral.charcoal }}>
                      {store.title}
                    </Text>
                    <Text size="xs" lineClamp={2} style={{ color: markketColors.neutral.darkGray, minHeight: rem(30) }}>
                      {getStoreDescription(store)}
                    </Text>
                  </Stack>
                </Box>
              );
            })}
          </Box>
        </Stack>
      )}
    </Box>
  );
}
