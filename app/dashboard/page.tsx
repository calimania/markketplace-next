'use client';
import { useEffect, useState } from 'react';

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
} from '@tabler/icons-react';

const mainLinks = [
  { icon: IconShoppingCart, label: 'Products', notifications: 4 },
  { icon: IconArticle, label: 'Articles', notifications: 2 },
  { icon: IconFileTypeDoc, label: 'Pages' },
  { icon: IconBuildingStore, label: 'Store Settings' },
  { icon: IconSettings, label: 'Account Settings' },
];

function MainLink({ icon: Icon, label, notifications }: {
  icon: typeof IconSettings;
  label: string;
  notifications?: number;
}) {
  return (
    <UnstyledButton
      sx={(theme) => ({
        display: 'block',
        width: '100%',
        padding: theme.spacing.xs,
        borderRadius: theme.radius.sm,
        color: theme.colorScheme === 'dark' ? theme.colors.dark[0] : theme.black,
        '&:hover': {
          backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[0],
        },
      })}
    >
      <Group>
        <Icon style={{ width: rem(20), height: rem(20) }} />
        <Text size="sm">{label}</Text>
        {notifications && (
          <Text size="xs" color="blue" fw={700}>
            {notifications}
          </Text>
        )}
      </Group>
    </UnstyledButton>
  );
}

export default function DashboardPage() {
  const [opened, { toggle }] = useDisclosure();
  const [store, setStore] = useState({});

  useEffect(() => {
    async function fetchStore() {
      const store = await strapiClient.getStore();
      setStore(store?.data[0]);
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
      <AppShell.Header p="md">
        <Group justify="space-between">
          <Group>
            <Burger
              opened={opened}
              onClick={toggle}
              hiddenFrom="sm"
              size="sm"
            />
            {console.log({store})}
            <img src={store?.Logo?.url} alt={store?.SEO?.metaTitle} width={70} />
          </Group>
          <Group>
            <IconUserCircle size={24} />
            <Text>Admin</Text>
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md">
        {mainLinks.map((link) => (
          <MainLink {...link} key={link.label} />
        ))}
      </AppShell.Navbar>

      <AppShell.Main>
        <Alert icon={<IconAlertCircle size="1rem" />} title="Coming Soon!" color="yellow">
          We're working hard to bring you amazing features. Stay tuned!
        </Alert>

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
      </AppShell.Main>
    </AppShell>
  );
}