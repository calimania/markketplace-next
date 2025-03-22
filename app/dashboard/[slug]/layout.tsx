'use client';

import { useEffect, useState } from 'react';
import { Store } from '@/markket/store.d';
import ProtectedRoute from '@/app/components/protectedRoute';
import { useAuth } from '@/app/providers/auth';
import {
  AppShell,
  Text,
  UnstyledButton,
  Group,
  rem,
  Burger,
  HoverCard,
  Stack,
  Divider
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { strapiClient } from '@/markket/api.strapi';
import {
  IconSettings,
  IconShoppingCart,
  IconArticle,
  IconFileTypeDoc,
  IconBuildingStore,
  IconUserCircle,
  IconShoppingBagEdit,
  IconTicket,
  IconSubscript,
  IconMessageChatbot,
  IconMoodEdit,
  IconHomeHeart,
  IconHomeStar,
  IconCashBanknoteHeart,
} from '@tabler/icons-react';

type DashboardLayoutProps = {
  children: React.ReactNode;
};

const mainLinks = [
  { icon: IconHomeStar, label: 'Store', href: '/dashboard/store' },
  { icon: IconCashBanknoteHeart, label: 'Payouts [Stripe]', href: '/dashboard/stripe' },
  { icon: IconShoppingCart, label: 'Products', href: '/dashboard/products' },
  { icon: IconArticle, label: 'Articles', href: '/dashboard/articles' },
  { icon: IconFileTypeDoc, label: 'Pages', href: '/dashboard/pages' },
  { icon: IconShoppingBagEdit, label: 'Orders', notifications: 2, href: '/dashboard/orders' },
  { icon: IconTicket, label: 'Events', href: '/dashboard/events' },
  { icon: IconMessageChatbot, label: 'Inbox', notifications: 1, href: '/dashboard/inbox' },
  { icon: IconSubscript, label: 'Subscribers', href: '/dashboard/subscribers' },
  { icon: IconMoodEdit, label: 'Newsletters', href: '/dashboard/newsletters' },
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
      <Group align="right" style={{ width: '100%' }} py={8}>
        <Icon style={{ width: rem(20), height: rem(20) }} />
        <Text size="sm">
          <a href={href?.startsWith('http') ? href : `${href || '#'}`} className="hover:text-blue-500 hover:bg-gray-300 block py-1 cursor-pointer">
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

export default function DashboardPage({ children }: DashboardLayoutProps) {
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
            <HoverCard width={280} shadow="md" position="bottom-end">
              <HoverCard.Target>
                <UnstyledButton>
                  <Group>
                    <IconUserCircle size={24} style={{ color: '#228be6' }} />
                    <Text fw={500}>{user?.username}</Text>
                  </Group>
                </UnstyledButton>
              </HoverCard.Target>

              <HoverCard.Dropdown>
                <Stack>
                  <Group>
                    <IconUserCircle size={32} style={{ color: '#228be6' }} />
                    <div>
                      <Text fw={500}>{user?.username}</Text>
                      <Text size="xs" c="dimmed">{user?.email}</Text>
                    </div>
                  </Group>
                  <Divider />
                  <UnstyledButton
                    component="a"
                    href="/auth"
                    className="hover:bg-gray-100 p-2 rounded"
                  >
                    <Group>
                      <Text size="sm">Auth Page</Text>
                    </Group>
                  </UnstyledButton>
                </Stack>
              </HoverCard.Dropdown>
            </HoverCard>
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
        <ProtectedRoute>
          {children}
        </ProtectedRoute>
      </AppShell.Main>
    </AppShell>
  );
};
