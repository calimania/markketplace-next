'use client';

import { useMemo, useState } from 'react';
import { Box, Group, Paper, Stack, Text, Title, UnstyledButton } from '@mantine/core';
import { markketColors } from '@/markket/colors.config';

type StoreSlideItem = {
  src: string;
  alt: string;
  key: string | number;
};

type StoreSlidesGalleryProps = {
  slides: StoreSlideItem[];
};

export default function StoreSlidesGallery({ slides }: StoreSlidesGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const selected = useMemo(() => slides[selectedIndex] || slides[0], [slides, selectedIndex]);

  if (!selected) {
    return null;
  }

  return (
    <Stack gap="md">
      <Group justify="space-between" align="center">
        <Title order={2} fw={700} size="lg">Slides</Title>
        <Text size="xs" c="dimmed" tt="uppercase" fw={700} style={{ letterSpacing: '0.08em' }}>
          {slides.length} saved
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
        <Text size="sm" c="dimmed" mt="sm" lineClamp={2}>
          {selected.alt}
        </Text>
      </Paper>

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
    </Stack>
  );
}
