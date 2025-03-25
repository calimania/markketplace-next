'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Store } from '@/markket/store.d';
import { markketClient } from '@/markket/api';
import ProtectedRoute from '@/app/components/protectedRoute';
import { useAuth } from '@/app/providers/auth.provider';
import {
  AppShell,
  Text,
  Container,
  Paper,
  Select,
  Avatar,
  UnstyledButton,
  Group,
  Burger,
  HoverCard,
  Stack,
  Divider,
  Button,
  Loader,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
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
import { DashboardContext } from '@/app/providers/dashboard.provider';

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
    <UnstyledButton component={Link} href={href || '#'}>
      <Group align="center" justify="space-between" py={8} px={4} className="hover:bg-gray-200 rounded">
        <Group gap="sm">
          <Icon size={20} />
          <Text size="sm">{label}</Text>
        </Group>
        {notifications && (
          <Text size="xs" c="blue" fw={700}>
            {notifications}
          </Text>
        )}
      </Group>
    </UnstyledButton>
  );
}

type DashboardLayoutProps = {
  children: React.ReactNode;
};

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [opened, { toggle }] = useDisclosure();
  const [stores, setStores] = useState<Store[]>([]);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const router = useRouter();


  const updateStoreInUrl = useCallback((storeId: string) => {
    const url = new URL(window.location.href);
    url.searchParams.set('store', storeId);
    return url;
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const currentStoreId = params.get('store');

    async function fetchStores() {
      const markket = new markketClient();
      setLoading(true);

      try {
        const response = await markket.fetch('/api/markket/store', {});

        // Handle 401 unauthorized
        if (response.status === 401) {
          router.push('/auth');
          return;
        }

        const stores = response?.data || [];
        setStores(stores);

        // Select initial store
        if (stores.length > 0) {
          const initialStore = currentStoreId
            ? stores.find((s: Store) => s.documentId === currentStoreId)
            : stores[0];

          if (initialStore) {
            setSelectedStore(initialStore);

            if (!currentStoreId || currentStoreId !== initialStore.documentId) {
              const newURL = updateStoreInUrl(initialStore.documentId);
              router.replace(newURL.pathname + newURL.search);
            }
          }
        }
      } catch (error) {
        console.error('Failed to fetch stores:', error);

        // if (error.response?.status === 401) {
        //   router.push('/auth');
        // }

      } finally {
        setLoading(false);
      }
    }

    fetchStores();
  }, [router, updateStoreInUrl]);


  const handleStoreChange = (storeId: string | null) => {
    if (!storeId) return;

    const store = stores.find(s => s.documentId === storeId);
    if (store) {
      setSelectedStore(store);
      const newURL = updateStoreInUrl(store.documentId);
      router.replace(newURL.pathname + newURL.search);
    }
  };

  if (loading) {
    return (
      <Container>
        <Paper p="xl" withBorder mt="xl">
          <Group justify="center">
            <Loader size="sm" />
            <Text>Loading stores...</Text>
          </Group>
        </Paper>
      </Container>
    );
  }

  if (!user) {
    router.push('/auth');
    return null;
  }

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: 300,
        breakpoint: 'sm',
        collapsed: { mobile: !opened }
      }}
      padding="md"
    >
      <AppShell.Header p="md">
        <Group justify="space-between" h="100%">
          <Group>
            <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
            {selectedStore && (
              <img
                src={selectedStore.Logo?.url}
                alt={selectedStore.title}
                style={{ height: 30, width: 'auto' }}
              />
            )}
          </Group>

          <Select
            value={selectedStore?.documentId}
            onChange={handleStoreChange}
            data={stores.map(store => ({
              value: store.documentId,
              label: store.title,
            }))}
            placeholder="Select Store"
            clearable={false}
            renderOption={({ option }) => (
              <Group gap="sm">
                <Avatar src={stores.find(s => s.documentId == option.value)?.Favicon?.url} size={20} radius="xl" />
                <Text>{option.label}</Text>
              </Group>
            )}
          />

          <HoverCard width={280} shadow="md">
            <HoverCard.Target>
              <UnstyledButton>
                <Group>
                  <IconUserCircle size={24} style={{ color: 'var(--mantine-color-blue-6)' }} />
                  <Text fw={500}>{user?.username}</Text>
                </Group>
              </UnstyledButton>
            </HoverCard.Target>

            <HoverCard.Dropdown>
              <Stack>
                <Group>
                  <IconUserCircle size={32} style={{ color: 'var(--mantine-color-blue-6)' }} />
                  <div>
                    <Text fw={500}>{user?.username}</Text>
                    <Text size="xs" c="dimmed">{user?.email}</Text>
                  </div>
                </Group>
                <Divider />
                <UnstyledButton component={Link} href="/auth" className="hover:bg-gray-100 p-2 rounded">
                  <Text size="sm">Auth Page</Text>
                </UnstyledButton>
              </Stack>
            </HoverCard.Dropdown>
          </HoverCard>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md">
        <Stack gap="xs">
          <Text size="xs" tt="uppercase" fw={700} c="dimmed">
            Dashboard
          </Text>
          {mainLinks.map((link) => (
            <MainLink {...link} key={link.label} />
          ))}
        </Stack>
      </AppShell.Navbar>

      <AppShell.Main>
        <ProtectedRoute>
          {stores.length === 0 ? (
            <Container>
              <Paper p="xl" withBorder mt="xl">
                <Stack align="center" gap="md">
                  <Text ta="center">No stores found. Create your first store to continue.</Text>
                  <Button
                    onClick={() => router.push('/dashboard/store/new')}
                    leftSection={<IconBuildingStore size={16} />}
                  >
                    Create Store
                  </Button>
                </Stack>
              </Paper>
            </Container>
          ) : selectedStore ? (
              <>
                <DashboardContext.Provider value={{ store: selectedStore }}>
                  {children}
                </DashboardContext.Provider>
              </>
          ) : (
            <Container>
              <Paper p="xl" withBorder mt="xl">
                <Text ta="center">Please select a store to continue</Text>
              </Paper>
            </Container>
          )}
        </ProtectedRoute>
      </AppShell.Main>
    </AppShell>
  );
};
