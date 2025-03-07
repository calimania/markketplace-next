'use client';

import { Container, Title, Text, SimpleGrid, Paper, rem } from '@mantine/core';
import {
  IconBuildingStore,
  IconSettings,
  IconUserCircle,
} from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

interface DashboardCard {
  title: string;
  description: string;
  icon: typeof IconBuildingStore;
  color: string;
  href: string;
  iconColor?: string;
}

const dashboardCards: DashboardCard[] = [
  {
    title: 'Stores',
    description: 'Manage your stores and products',
    icon: IconBuildingStore,
    color: 'blue',
    href: '/dashboard/store',
    iconColor: '#0067ff'
  },
  {
    title: 'Settings',
    description: 'New stores, and preferences',
    icon: IconSettings,
    color: 'pink',
    iconColor: '#ff3366',
    href: '/dashboard/settings'
  },
  {
    title: 'Account',
    description: 'Profile and authentication',
    icon: IconUserCircle,
    color: 'grape',
    iconColor: '#fbda0f',
    href: '/auth'
  },
];

export default function DashboardHome() {
  const router = useRouter();

  return (
    <Container size="md" py="xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Title order={1} mb="sm">Dashboard</Title>
        <Text c="dimmed" mb="xl">
          Store Management and Configuration
        </Text>

        <SimpleGrid
          cols={{ base: 1, sm: 2, md: 3 }}
          spacing="xl"
          verticalSpacing="xl"
        >
          {dashboardCards.map((card, index) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Paper
                shadow="md"
                p="xl"
                radius="md"
                className={`
                  cursor-pointer transition-all duration-200
                  hover:shadow-lg hover:-translate-y-1
                  bg-gradient-to-br from-${card.color}-50 to-white
                `}
                onClick={() => router.push(card.href)}
              >
                <card.icon
                  size={rem(48)}
                  color={card.iconColor}
                  className={`text-${card.color}-500 mb-4`}
                />
                <Title order={3} mb="xs" size="h4">
                  {card.title}
                </Title>
                <Text size="sm" c="dimmed">
                  {card.description}
                </Text>
              </Paper>
            </motion.div>
          ))}
        </SimpleGrid>
      </motion.div>
    </Container>
  );
};
