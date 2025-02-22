'use client';

import { useEffect, useState } from 'react';
import { Store } from '@/markket/store.d';
import ProtectedRoute from '@/app/components/protectedRoute';
import { useAuth } from '@/app/providers/auth';

import {
  AppShell,
  Text,
  Title,
  UnstyledButton,
  Group,
  rem,
  Card,
  SimpleGrid,
  Alert,
  Burger,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { strapiClient } from '@/markket/api';
import {
  IconSettings,
  IconShoppingCart,
  IconArticle,
  IconFileTypeDoc,
  IconBuildingStore,
  IconUserCircle,
  IconAlertCircle,
  IconShoppingBagEdit,
  IconTicket,
  IconSubscript,
  IconMessageChatbot,
  IconMoodEdit,
  IconHomeHeart,
} from '@tabler/icons-react';

const mainLinks = [
  { icon: IconShoppingCart, label: 'Products', notifications: 4 },
  { icon: IconArticle, label: 'Articles', notifications: 2 },
  { icon: IconFileTypeDoc, label: 'Pages' },
  { icon: IconShoppingBagEdit, label: 'Orders' },
  { icon: IconTicket, label: 'Events' },
  { icon: IconMessageChatbot, label: 'Inbox' },
  { icon: IconSubscript, label: 'Subscribers' },
  { icon: IconMoodEdit, label: 'Newsletters' },
  { icon: IconBuildingStore, label: 'Settings', href: '/dashboard/settings' },
  { icon: IconHomeHeart, label: 'Homepage', href: '/' },
];

function MainLink({ icon: Icon, label, notifications, href }: {
  icon: typeof IconSettings;
  label: string;
  notifications?: number;
  href?: string;
}) {
  return (
    <UnstyledButton>
      <Group align="right" style={{ width: '100%' }} py={3} >
        <Icon style={{ width: rem(20), height: rem(20) }} />
        <Text size="sm">
          <a href={href?.startsWith('http') ? href : `${href || '#'}`} className="hover:text-blue-500 hover:bg-gray-300">
            {label}
          </a>
        </Text>
        {notifications && (
          <Text size="xs" color="blue" fw={700}>
            {notifications}
          </Text>
        )}
      </Group>
    </UnstyledButton>
  );
}

/**
 * Initial dashboard page we display to the user
 *
 * @returns {JSX.Element}
 */
export default function DashboardPage() {
  const [opened, { toggle }] = useDisclosure();
  const [store, setStore] = useState({} as Store);
  const { user } = useAuth();

  useEffect(() => {
    async function fetchStore() {
      const store = await strapiClient.getStore();
      setStore(store?.data?.[0]);
    }

    fetchStore();
  }, []);


  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: 300,
        breakpoint: 'sm',
        collapsed: { mobile: !opened },
      }}
      padding="md"
    >
      <AppShell.Header p="md" style={{ borderBottom: '1px solid #eee' }}>
        <Group justify="space-between" h="100%">
          <Group>
            <Burger
              opened={opened}
              onClick={toggle}
              hiddenFrom="sm"
              size="sm"
            />
            <img
              src={store?.Logo?.url}
              alt={store?.SEO?.metaTitle}
              style={{
                height: '30px',
                width: 'auto',
                marginLeft: rem(12)
              }}
            />
          </Group>
          <Group>
            <IconUserCircle size={24} style={{ color: '#228be6' }} />
            <Text fw={500}>{user?.username}</Text>
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar
        p="md"
        style={{
          borderRight: '1px solid #eee',
          background: '#f8f9fa'
        }}
      >
        <Text size="xs" tt="uppercase" fw={700} c="dimmed" mb="md">
          Dashboard
        </Text>
        {mainLinks.map((link) => (
          <MainLink {...link} key={link.label} />
        ))}
      </AppShell.Navbar>
      <AppShell.Main>
        <Alert icon={<IconAlertCircle size="1rem" />} title="Coming Soon!" color="yellow">
          We&apos;e working hard to bring you amazing features. Stay tuned!
        </Alert>
        <ProtectedRoute>
          <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} mt="md" spacing="md">
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <IconShoppingCart size={24} style={{ marginBottom: rem(10) }} />
              <Title order={3}>Products</Title>
              <Text c="dimmed" size="sm">
                Manage your store products
              </Text>
            </Card>

            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <IconArticle size={24} style={{ marginBottom: rem(10) }} />
              <Title order={3}>Articles</Title>
              <Text c="dimmed" size="sm">
                Blog posts and news
              </Text>
            </Card>

            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <IconSettings size={24} style={{ marginBottom: rem(10) }} />
              <Title order={3}>Analytics</Title>
              <Text c="dimmed" size="sm">
                Store performance metrics
              </Text>
            </Card>
          </SimpleGrid>
        </ProtectedRoute>
      </AppShell.Main>
    </AppShell>
  );
};
