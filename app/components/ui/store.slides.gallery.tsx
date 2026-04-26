'use client';

import { useMemo, useState } from 'react';
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
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const selected = useMemo(() => slides[selectedIndex] || slides[0], [slides, selectedIndex]);
  const atStart = selectedIndex <= 0;
  const atEnd = selectedIndex >= slides.length - 1;

  const goPrevious = () => {
    setSelectedIndex((current) => (current <= 0 ? slides.length - 1 : current - 1));
  };

  const goNext = () => {
    setSelectedIndex((current) => (current >= slides.length - 1 ? 0 : current + 1));
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
          onClick={() => setLightboxOpen(true)}
          aria-label="Open full image"
          style={{ display: 'block', width: '100%' }}
        >
          <Box
            style={{
              height: 'clamp(220px, 38vw, 420px)',
              borderRadius: 14,
              backgroundImage: `url(${selected.src})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              border: '1px solid rgba(15, 23, 42, 0.08)',
            }}
          />
        </UnstyledButton>
        <Group justify="space-between" align="center" mt="sm" gap="xs">
          <Text size="sm" c="dimmed" lineClamp={2} style={{ flex: 1 }}>
            {selected.alt}
          </Text>
          <Button
            size="xs"
            variant="light"
            leftSection={<IconZoomIn size={14} />}
            onClick={() => setLightboxOpen(true)}
          >
            Full image
          </Button>
        </Group>
      </Paper>

      <Group justify="space-between" align="center" gap="xs">
        <ActionIcon
          variant="outline"
          radius="xl"
          size="lg"
          onClick={goPrevious}
          aria-label="Previous slide"
          disabled={slides.length <= 1}
        >
          <IconChevronLeft size={18} />
        </ActionIcon>
        <Text size="xs" c="dimmed" tt="uppercase" fw={700} style={{ letterSpacing: '0.08em' }}>
          Tap image to expand
        </Text>
        <ActionIcon
          variant="outline"
          radius="xl"
          size="lg"
          onClick={goNext}
          aria-label="Next slide"
          disabled={slides.length <= 1}
        >
          <IconChevronRight size={18} />
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
                  borderColor: isActive ? markketColors.rosa.main : markketColors.neutral.gray,
                  boxShadow: isActive ? '0 0 0 2px rgba(228,0,124,0.18)' : 'none',
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
              disabled={slides.length <= 1 || atStart}
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
              disabled={slides.length <= 1 || atEnd}
            >
              <IconChevronRight size={18} />
            </ActionIcon>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
}
