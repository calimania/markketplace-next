'use client';

import type { ElementType } from 'react';
import { Paper, Stack, Box, Title, Text, rem } from '@mantine/core';

interface FeatureCardProps {
  icon?: ElementType;
  title: string;
  description: string;
  color?: string;
  index?: number;
}

export function FeatureCard({
  icon: Icon,
  title,
  description,
  color = '#00bcd4',
  index = 0,
}: FeatureCardProps) {
  return (
    <Paper
      withBorder
      radius="lg"
      p="xl"
      style={{
        borderColor: `${color}20`,
        background: 'rgba(255,255,255,0.98)',
        boxShadow: `0 18px 40px ${color}12`,
        transition: 'transform 0.22s ease, box-shadow 0.22s ease',
        animationDelay: `${index * 80}ms`,
      }}
      className="fade-in hover:-translate-y-1 hover:shadow-[0_24px_48px_rgba(0,0,0,0.08)]"
    >
      <Stack gap="md">
        {Icon && (
          <Box
            style={{
              width: rem(60),
              height: rem(60),
              borderRadius: rem(18),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: `${color}15`,
            }}
          >
            <Icon size={28} color={color} stroke={2.2} />
          </Box>
        )}

        <Title order={3} size="h4" style={{ color: '#111827' }}>
          {title}
        </Title>

        <Text c="dimmed" style={{ lineHeight: 1.75 }}>
          {description}
        </Text>
      </Stack>
    </Paper>
  );
}

export default FeatureCard;
