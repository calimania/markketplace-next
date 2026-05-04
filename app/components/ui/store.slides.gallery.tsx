"use client";

import { useMemo, useRef, useState } from 'react';
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
    <Stack gap="md">
      <Group justify="space-between" align="center">
        <Title order={2} fw={700} size="lg">{title || 'Slides'}</Title>
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
        }}
      >
        <UnstyledButton
          component="button"
          tabIndex={0}
          onClick={() => {
            setLightboxOpen(true);
          }}
          aria-label="Open full image"
          style={{ display: 'block', width: '100%', pointerEvents: 'auto', background: '#ffe5e5', }}
        >
          <Box
            style={{
              height: 'clamp(220px, 38vw, 420px)',
              borderRadius: 14,
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
          style={{ minWidth: 48, minHeight: 48, touchAction: 'manipulation' }}
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
          style={{ minWidth: 48, minHeight: 48, touchAction: 'manipulation' }}
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
                  borderColor: isActive ? markketColors.neutral.charcoal : markketColors.neutral.gray,
                  boxShadow: isActive ? '0 0 0 2px rgba(15,23,42,0.12)' : 'none',
                  transition: 'border-color 140ms ease, box-shadow 140ms ease',
                }}
              >
                <Box
                  style={{
                    width: 96,
                    height: 72,
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
        size="xl"
        title={title || 'Slides'}
        styles={{
          content: { background: '#05080f' },
          header: { background: '#05080f' },
          title: { color: '#ffffff' },
          close: { color: '#ffffff' },
        }}
      >
        <Stack gap="sm">
          <Box
            style={{
              width: '100%',
              height: 'min(68vh, 720px)',
              borderRadius: 12,
              backgroundImage: `url(${selected.src})`,
              backgroundSize: 'contain',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              backgroundColor: '#0b1220',
            }}
          />
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
            <Text c="white" size="sm" fw={600} ta="center" lineClamp={2} style={{ flex: 1 }}>
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
        </Stack>
      </Modal>
    </Stack>
  );
}
