'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Store } from '@/markket/store.d';
import { useRouter } from 'next/navigation';
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
  Badge,
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
  IconMusicStar,
  IconMessageChatbot,
  IconMoodEdit,
  IconHomeStar,
  IconCashBanknoteHeart,
  IconClipboardPlus,
  IconLibraryPhoto,
  IconWindmill,
} from '@tabler/icons-react';
import { DashboardProvider } from '@/app/providers/dashboard.provider';

const mainLinks = [
  { icon: IconHomeStar, label: 'Store', href: '/dashboard/store' },
  { icon: IconShoppingCart, label: 'Products', href: '/dashboard/products' },
  { icon: IconArticle, label: 'Articles', href: '/dashboard/articles' },
  { icon: IconFileTypeDoc, label: 'Pages', href: '/dashboard/pages' },
  { icon: IconShoppingBagEdit, label: 'Orders', notifications: 0, href: '/dashboard/orders' },
  { icon: IconTicket, label: 'Events', href: '/dashboard/events' },
  { icon: IconLibraryPhoto, label: 'Collections', href: '/dashboard/albums' },
  { icon: IconMusicStar, label: 'Colection Items', nofications: 0, href: '/dashboard/tracks' },
  { icon: IconMessageChatbot, label: 'Inbox', notifications: 0, href: '/dashboard/inbox' },
  { icon: IconClipboardPlus, label: 'Forms & Responses', href: '/dashboard/forms' },
  { icon: IconMoodEdit, label: 'Newsletters', href: '/dashboard/newsletters' },
  { icon: IconCashBanknoteHeart, label: 'Payouts [Stripe]', href: '/dashboard/stripe' },
  { icon: IconBuildingStore, label: 'Settings', href: '/dashboard/settings' },
  { icon: IconWindmill, label: 'Stores', href: '/dashboard/stores' },
];

function MainLink({
  icon: Icon,
  label,
  notifications,
  href,
  active,
  store_id,
}: {
  icon: typeof IconSettings;
  label: string;
  notifications?: number;
    store_id?: string;
  href?: string;
    active?: boolean;
  }
) {
  return (
    <UnstyledButton
      component={Link}
      href={(!store_id ? href : `${href}?store=${store_id}`) as string}
      className={`
        transition-colors duration-200 rounded-md w-full
        ${active
          ? 'bg-blue-50 text-blue-600 hover:bg-blue-100'
          : 'hover:bg-gray-100'
        }
      `}
    >
      <Group
        align="center"
        justify="space-between"
        py={8}
        px={12}
      >
        <Group gap="sm">
          <Icon
            size={20}
            className={active ? 'text-blue-600' : 'text-gray-600'}
          />
          <Text
            size="sm"
            fw={active ? 500 : 400}
          >
            {label}
          </Text>
        </Group>
        {notifications && (
          <Badge
            size="sm"
            variant={active ? "filled" : "light"}
            color="blue"
          >
            {notifications}
          </Badge>
        )}
      </Group>
    </UnstyledButton>
  );
}

type DashboardLayoutProps = {
  children: React.ReactNode;
};

export default function AnyDashboardLayout({ children }: DashboardLayoutProps) {
  const [opened, { toggle }] = useDisclosure();
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [loading, setLoading] = useState(true);
  const { user, stores, isLoading: authLoading } = useAuth();
  const router = useRouter();

  let hideSelector = false;
  if (typeof window === 'object') {
    hideSelector = window.location.pathname.includes('settings') || window.location.pathname.includes('stores');
  }

  const updateStoreInUrl = useCallback((storeId: string) => {
    const url = new URL(window.location.href);
    url.searchParams.set('store', storeId);

    if (url.pathname.includes('view') || url.pathname.includes('edit')) {
      const parts = url.pathname.split('/');
      const newPath = [''].concat('dashboard', parts[2] || 'store').join('/');

      return new URL(`${newPath}?store=${storeId}`, window.location.origin);
    }

    return url;
  }, []);

  useEffect(() => {
    if (stores) {
      setLoading(authLoading);
    }
  }, [stores, authLoading]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const currentStoreId = params.get('store');

    if (!currentStoreId && stores.length) {
      const newURL = updateStoreInUrl(stores[0].documentId);
      setSelectedStore(stores[0]);
      router.replace(newURL.pathname + newURL.search);
    }

    if (currentStoreId && !selectedStore) {
      setSelectedStore(stores.find(s => s.documentId === currentStoreId) || null);
    }

  }, [router, updateStoreInUrl, stores, selectedStore,]);


  const handleStoreChange = (storeId: string | null) => {
    if (!storeId) return;

    const store = stores.find(s => s.documentId === storeId);
    if (store) {
      setSelectedStore(store);
      const newURL = updateStoreInUrl(store.documentId);
      router.replace(newURL.pathname + newURL.search);
    }
  };

  if (loading || authLoading) {
    return (
      <Container>
        <Paper p="xl" withBorder mt="xl">
          <Group justify="center">
            <Loader size="sm" />
            <Text>Loading...</Text>
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
      styles={{
        main: {
          paddingTop: 'calc(var(--mantine-spacing-md) + 60px)',
        },
      }}
    >
      <AppShell.Header p="md">
        <Group justify="space-between" h="100%">
          <Group>
            <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
            {selectedStore && (
              <img
                src={selectedStore.Favicon?.url || selectedStore.Logo?.url || '/images/logo.png'}
                alt={selectedStore.title}
                style={{ height: 30, width: 'auto' }}
              />
            )}
          </Group>

          {!hideSelector && (<Select
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
          />)}

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
        <Stack h="100%" gap={0}>
          <div>
            <Text size="xs" tt="uppercase" fw={700} c="dimmed" mb="md">
            Dashboard
          </Text>
            <Divider mb="md" />
          </div>
          <div className="flex-1 overflow-y-auto" style={{
            scrollbarWidth: 'thin',
            scrollbarColor: 'var(--mantine-color-gray-3) transparent',
          }}>
            <Stack gap="xs">
              {mainLinks.map((link) => (
                <MainLink
                  {...link}
                  key={link.label}
                  store_id={selectedStore?.documentId}
                  active={window.location.pathname.includes(link.href)}
                />
              ))}
            </Stack>
          </div>
          <div className="mt-auto pt-md buttom-navbar">
            <Divider mb="md" />
            <Button
              fullWidth
              leftSection={<IconBuildingStore size={16} />}
              variant="light"
              component={Link}
              href="/"
            >
              Home
            </Button>
          </div>
        </Stack>
      </AppShell.Navbar>

      <AppShell.Main py="md">
        <ProtectedRoute>
          <DashboardProvider store={selectedStore as Store}>
            {children}
          </DashboardProvider>
        </ProtectedRoute>
      </AppShell.Main>
    </AppShell>
  );
};
