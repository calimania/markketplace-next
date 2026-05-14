"use client";

import { useEffect, useMemo, useRef, useState } from 'react';
import { ActionIcon, Box, Button, Group, Modal, Paper, Stack, Text, Title, UnstyledButton } from '@mantine/core';
import { IconChevronLeft, IconChevronRight, IconZoomIn } from '@tabler/icons-react';
import { markketColors } from '@/markket/colors.config';

type StoreSlideItem = {
  src: string;
  alt: string;
  key: string | number;
};

type StoreSlidesGalleryProps = {
  slides: StoreSlideItem[];
  title?: string;
};

export default function StoreSlidesGallery({ slides, title }: StoreSlidesGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(slides.length > 1 ? 1 : 0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const selected = useMemo(() => slides[selectedIndex] || slides[0], [slides, selectedIndex]);

  useEffect(() => {
    setSelectedIndex(slides.length > 1 ? 1 : 0);
  }, [slides]);

  const goPrevious = () => {
    setSelectedIndex((current) => (current <= 0 ? slides.length - 1 : current - 1));
  };
  const goNext = () => {
    setSelectedIndex((current) => (current >= slides.length - 1 ? 0 : current + 1));
  };
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const onTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };
  const onTouchEnd = () => {
    if (touchStartX.current !== null && touchEndX.current !== null) {
      const delta = touchEndX.current - touchStartX.current;
      if (Math.abs(delta) > 40) {
        if (delta > 0) {
          goPrevious();
        } else {
          goNext();
        }
      }
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  if (!selected) {
    return null;
  }

  return (
    <Stack
      gap="md"
      style={{
        borderRadius: 22,
        padding: '14px',
        background: 'linear-gradient(135deg, rgba(246,248,250,0.94) 0%, rgba(255,255,255,0.98) 52%, rgba(236,247,250,0.92) 100%)',
        boxShadow: '0 12px 28px rgba(15, 23, 42, 0.06)',
      }}
    >
      <Group justify="space-between" align="center">
        <Stack gap={2}>
          <Text size="xs" tt="uppercase" fw={800} style={{ letterSpacing: '0.1em', color: markketColors.sections.about.main }}>
            Gallery
          </Text>
          <Title order={2} fw={700} size="lg">{title || 'Slides'}</Title>
        </Stack>
        <Text size="xs" c="dimmed" tt="uppercase" fw={700} style={{ letterSpacing: '0.08em' }}>
          {selectedIndex + 1} / {slides.length}
        </Text>
      </Group>

      <Paper
        withBorder
        radius="xl"
        p="sm"
        style={{
          borderColor: markketColors.neutral.gray,
          background: 'white',
          overflow: 'hidden',
          boxShadow: '0 10px 24px rgba(15,23,42,0.06)',
        }}
      >
        <UnstyledButton
          component="button"
          tabIndex={0}
          onClick={() => {
            setLightboxOpen(true);
          }}
          aria-label="Open full image"
          style={{ display: 'block', width: '100%', pointerEvents: 'auto', background: 'transparent' }}
        >
          <Box
            style={{
              height: 'clamp(220px, 38vw, 420px)',
              borderRadius: 16,
              backgroundImage: `url(${selected.src})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              touchAction: 'pan-y',
              pointerEvents: 'auto',
              backgroundColor: 'rgba(0,188,212,0.08)',
            }}
            onTouchStart={e => {
              onTouchStart(e);
            }}
            onTouchMove={e => {
              onTouchMove(e);
            }}
            onTouchEnd={e => {
              onTouchEnd();
            }}
          />
        </UnstyledButton>

        <Group justify="space-between" align="center" mt="sm" gap="xs">
          <Text size="sm" c="dimmed" lineClamp={2} style={{ flex: 1 }}>
            {selected.alt}
          </Text>
          <Button
            size="md"
            variant="light"
            leftSection={<IconZoomIn size={16} />}
            onClick={() => setLightboxOpen(true)}
            radius="xl"
            style={{ minWidth: 44, minHeight: 36 }}
          >
            Full image
          </Button>
        </Group>
      </Paper>

      <Group justify="space-between" align="center" gap="xs">
        <ActionIcon
          variant="outline"
          radius="xl"
          size="xl"
          onClick={goPrevious}
          aria-label="Previous slide"
          disabled={slides.length <= 1}
          style={{ minWidth: 48, minHeight: 48, touchAction: 'manipulation', background: '#fff' }}
        >
          <IconChevronLeft size={24} />
        </ActionIcon>
        <Text size="xs" c="dimmed" tt="uppercase" fw={700} style={{ letterSpacing: '0.08em' }}>
          Tap or swipe image
        </Text>
        <ActionIcon
          variant="outline"
          radius="xl"
          size="xl"
          onClick={goNext}
          aria-label="Next slide"
          disabled={slides.length <= 1}
          style={{ minWidth: 48, minHeight: 48, touchAction: 'manipulation', background: '#fff' }}
        >
          <IconChevronRight size={24} />
        </ActionIcon>
      </Group>

      <Group gap="sm" wrap="nowrap" style={{ overflowX: 'auto', paddingBottom: 4 }}>
        {slides.map((slide, index) => {
          const isActive = index === selectedIndex;

          return (
            <UnstyledButton
              key={`${slide.key}-${index}`}
              onClick={() => setSelectedIndex(index)}
              style={{ flex: '0 0 auto' }}
              aria-label={`Show slide ${index + 1}`}
            >
              <Paper
                withBorder
                radius="md"
                p={2}
                style={{
                  borderColor: isActive ? markketColors.sections.about.main : markketColors.neutral.gray,
                  boxShadow: isActive ? '0 0 0 2px rgba(0,188,212,0.16)' : 'none',
                  transition: 'border-color 140ms ease, box-shadow 140ms ease',
                }}
              >
                <Box
                  style={{
                    width: 104,
                    height: 74,
                    borderRadius: 8,
                    backgroundImage: `url(${slide.src})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                />
              </Paper>
            </UnstyledButton>
          );
        })}
      </Group>

      <Modal
        opened={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        centered
        withCloseButton
        size="90vw"
        title={title || 'Slides'}
        styles={{
          content: { background: '#05080f' },
          header: { background: '#05080f' },
          title: { color: '#ffffff' },
          close: { color: '#ffffff' },
        }}
      >
        <Stack gap="md">
          <Box
            style={{
              position: 'relative',
              width: '100%',
              height: 'min(78vh, 860px)',
              borderRadius: 12,
              backgroundImage: `url(${selected.src})`,
              backgroundSize: 'contain',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              backgroundColor: '#0b1220',
            }}
          >
            {slides.length > 1 && (
              <>
                <ActionIcon
                  variant="filled"
                  radius="xl"
                  size="xl"
                  onClick={goPrevious}
                  aria-label="Previous slide"
                  style={{
                    position: 'absolute',
                    left: 14,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'rgba(5, 8, 15, 0.64)',
                    border: '1px solid rgba(255, 255, 255, 0.24)',
                  }}
                >
                  <IconChevronLeft size={20} color="#fff" />
                </ActionIcon>
                <ActionIcon
                  variant="filled"
                  radius="xl"
                  size="xl"
                  onClick={goNext}
                  aria-label="Next slide"
                  style={{
                    position: 'absolute',
                    right: 14,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'rgba(5, 8, 15, 0.64)',
                    border: '1px solid rgba(255, 255, 255, 0.24)',
                  }}
                >
                  <IconChevronRight size={20} color="#fff" />
                </ActionIcon>
              </>
            )}
          </Box>
          <Group justify="space-between" align="center">
            <ActionIcon
              variant="light"
              radius="xl"
              size="lg"
              onClick={goPrevious}
              aria-label="Previous slide"
              disabled={slides.length <= 1}
            >
              <IconChevronLeft size={18} />
            </ActionIcon>
            <Text c="white" size="sm" fw={600} ta="center" lineClamp={2} style={{ flex: 1, opacity: 0.95 }}>
              {selected.alt}
            </Text>
            <ActionIcon
              variant="light"
              radius="xl"
              size="lg"
              onClick={goNext}
              aria-label="Next slide"
              disabled={slides.length <= 1}
            >
              <IconChevronRight size={18} />
            </ActionIcon>
          </Group>

          {slides.length > 1 && (
            <Group gap="sm" wrap="nowrap" style={{ overflowX: 'auto', paddingBottom: 4 }}>
              {slides.map((slide, index) => {
                const isActive = index === selectedIndex;

                return (
                  <UnstyledButton
                    key={`modal-${slide.key}-${index}`}
                    onClick={() => setSelectedIndex(index)}
                    style={{ flex: '0 0 auto' }}
                    aria-label={`Show large slide ${index + 1}`}
                  >
                    <Paper
                      withBorder
                      radius="md"
                      p={2}
                      style={{
                        borderColor: isActive ? markketColors.sections.about.main : 'rgba(255,255,255,0.24)',
                        boxShadow: isActive ? '0 0 0 2px rgba(0,188,212,0.2)' : 'none',
                        background: 'rgba(255,255,255,0.04)',
                      }}
                    >
                      <Box
                        style={{
                          width: 96,
                          height: 64,
                          borderRadius: 8,
                          backgroundImage: `url(${slide.src})`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                        }}
                      />
                    </Paper>
                  </UnstyledButton>
                );
              })}
            </Group>
          )}
        </Stack>
      </Modal>
    </Stack>
  );
}
