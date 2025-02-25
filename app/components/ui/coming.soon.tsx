'use client';

import { Container, Title, Text, Stack } from '@mantine/core';
import { IconTrafficCone } from '@tabler/icons-react';
import { useEffect, useState } from 'react';

interface ComingSoonProps {
  title?: string;
  description?: string;
}

export default function ComingSoon({
  title = "Coming Soon!",
  description = "Perdone la molestia..."
}: ComingSoonProps) {
  const [rotate, setRotate] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setRotate(prev => (prev + 1) % 360);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  return (
    <Container size="md" py="xl">
      <Stack align="center" gap="xl">
        <IconTrafficCone
          size={180}
          color="var(--mantine-color-orange-6)"
          style={{
            transform: `rotate(${rotate}deg)`,
            transition: 'transform 0.1s ease',
            cursor: 'pointer',
          }}
          onClick={() => setRotate(prev => prev + 45)}
        />
        <Title
          order={1}
          style={{
            background: 'linear-gradient(45deg, var(--mantine-color-orange-4), var(--mantine-color-yellow-4))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          {title}
        </Title>
        <Text
          size="xl"
          c="dimmed"
          ta="center"
          style={{ maxWidth: '400px' }}
        >
          {description}
        </Text>
      </Stack>
    </Container>
  );
};
