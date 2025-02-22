'use client';

import {
  Container,
  Title,
  Text,
  Button,
  Group,
  Card,
  ThemeIcon,
  Badge,
  rem,
} from '@mantine/core';
import { IconRocket, IconBuildingStore, IconUsers } from '@tabler/icons-react';
import {  useState } from 'react';

interface ComingSoonProps {
  title?: string;
  description?: string;
}

export default function ComingSoon({
  title = "This feature is coming soon!",
  description = "We're working hard to bring you amazing features. Stay tuned!"
}: ComingSoonProps) {
  const [count, setCount] = useState(0);

  const features = [
    {
      icon: IconRocket,
      title: 'Lightning Fast',
      description: 'Optimized for speed and performance',
    },
    {
      icon: IconBuildingStore,
      title: 'Store Management',
      description: 'Easy to use dashboard for your store',
    },
    {
      icon: IconUsers,
      title: 'Built Together',
      description: 'Community driven development',
    },
  ];

  return (
    <Container size="lg" py="xl">
      <Card withBorder radius="md" p="xl" bg="var(--mantine-color-body)">
        <Group justify="center" mb="xl">
          <Badge
            size="lg"
            radius="sm"
            variant="gradient"
            gradient={{ from: 'blue', to: 'cyan', deg: 90 }}
          >
            Coming Soon
          </Badge>
        </Group>

        <Title order={2} ta="center" mt="sm">
          {title}
        </Title>

        <Text c="dimmed" ta="center" mt="md">
          {description}
        </Text>

        <Group justify="center" mt="lg">
          <Button
            variant="light"
            size="md"
            onClick={() => setCount(c => c + 1)}
          >
            {count === 0 ? 'Get Notified' : `Thanks! #${count} in line`}
          </Button>
        </Group>

        <Group mt={rem(50)} justify="center" gap={rem(50)}>
          {features.map((feature) => (
            <div key={feature.title} style={{ textAlign: 'center' }}>
              <ThemeIcon
                size={60}
                radius="md"
                variant="light"
                color="blue"
                mb="sm"
              >
                <feature.icon
                  style={{ width: rem(30), height: rem(30) }}
                  stroke={1.5}
                />
              </ThemeIcon>
              <Text size="sm" fw={500}>
                {feature.title}
              </Text>
              <Text size="xs" c="dimmed" mt={4}>
                {feature.description}
              </Text>
            </div>
          ))}
        </Group>
      </Card>
    </Container>
  );
};
