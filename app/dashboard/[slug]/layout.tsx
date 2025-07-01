'use client';

import {
  AppShell, Burger, Container, Paper, Group, Text, Loader,
  Select, Avatar, UnstyledButton, Divider, Button, Stack,
  TextInput, HoverCard, Box, ActionIcon,
  Tooltip,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import {
  IconBuildingStore, IconArticle, IconShoppingCart, IconFileTypeDoc, IconTicket, IconLibraryPhoto, IconMusicStar,
  IconShoppingBagEdit, IconMessageChatbot, IconClipboardPlus, IconMoodEdit, IconCashBanknoteHeart,
  IconWindmill, IconUserCircle, IconSearch, IconHomeStar,
  IconMessageUser,
} from '@tabler/icons-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/providers/auth.provider';
import { Store } from '@/markket/store.d';
import ProtectedRoute from '@/app/components/protectedRoute';
import { DashboardProvider } from '@/app/providers/dashboard.provider';
import { useState, useCallback, useEffect, } from 'react';
import { MainLink } from '@/app/components/dashboard/ui.menu';

const mainLinks = [
  { icon: IconHomeStar, label: 'Store', href: '/dashboard/store', visible: true, },
  { icon: IconArticle, label: 'Articles', href: '/dashboard/articles', visible: true },
  { icon: IconFileTypeDoc, label: 'Pages', href: '/dashboard/pages', visible: true },
  { icon: IconShoppingCart, label: 'Products', href: '/dashboard/products', visible: true },
  { icon: IconTicket, label: 'Events', href: '/dashboard/events', visible: true },
  { icon: IconLibraryPhoto, label: 'Collections', href: '/dashboard/albums', visible: true },
  { icon: IconMusicStar, label: 'Collection Items', notifications: 0, href: '/dashboard/tracks', visible: true },
  { icon: IconMessageChatbot, label: 'Inbox', notifications: 0, href: '/dashboard/crm#inbox', },
  { icon: IconClipboardPlus, label: 'Forms', href: '/dashboard/crm#forms' },
  { icon: IconMoodEdit, label: 'Subscribers', href: '/dashboard/crm#newsletter' },
  { icon: IconShoppingBagEdit, label: 'Sales', notifications: 0, href: '/dashboard/crm#orders' },
  { icon: IconCashBanknoteHeart, label: 'Payouts [Stripe]', href: '/dashboard/stripe' },
  { icon: IconBuildingStore, label: 'Settings', href: '/dashboard/settings' },
  { icon: IconWindmill, label: 'Stores', href: '/dashboard/stores' },
  { icon: IconMessageUser, label: 'Customer Center', href: '/dashboard/crm', visible: true }
];

type DashboardLayoutProps = {
  children: React.ReactNode;
};

export const fetchCache = 'force-no-store';

export default function AnyDashboardLayout({ children }: DashboardLayoutProps) {
  const [opened, { toggle }] = useDisclosure();
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [loading, setLoading] = useState(true);
  const { user, stores, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredLinks = mainLinks.filter(link => {
    if (searchQuery.toLowerCase()) {
      if (link.label.toLowerCase().includes(searchQuery.toLowerCase())) {
        return true;
      }
    } else if (link.visible) {
      return true;
    }
  });

  let hideSelector = false;
  if (typeof window === 'object') {
    hideSelector = window.location.pathname.includes('settings') || window.location.pathname.includes('stores');
  }

  const updateStoreInUrl = useCallback((storeId: string) => {
    const url = new URL(window.location.href);
    url.searchParams.set('store', storeId);

    if (url.pathname.includes('view') || url.pathname.includes('edit') || url.pathname.includes('new')) {
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
  }, [router, updateStoreInUrl, stores, selectedStore]);

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
      <Container px={0}>
        <Paper p="xs" withBorder mt="xl">
          <Group justify="center">
            <Loader size="sm" />
            <Text>Loading...</Text>
          </Group>
        </Paper>
      </Container>
    );
  }

  const getActiveLink = () => {
    if (typeof window !== 'object') return '';
    const path = window.location.pathname;
    return mainLinks.find(link => path.includes(link.href))?.href || '';
  };

  const currentActive = getActiveLink();

  return (
    <AppShell
      header={{ height: 'auto' }}
      navbar={{
        width: 320,
        breakpoint: 'sm',
        collapsed: { mobile: !opened }
      }}
      padding="xs"
      styles={{
        main: {
          paddingTop: 'calc(var(--mantine-spacing-md) + 60px)',
          background: 'linear-gradient(135deg, #fdf6fd 0%, #e0f2fe 100%)',
          minHeight: '100vh',
        },
      }}
    >
      <AppShell.Header p="md" className="border-b-4 border-fuchsia-200 bg-white/90 shadow-md">
        <Group justify="space-between" h="100%">
          <Group>
            <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" className="border-2 border-fuchsia-200" />
            {selectedStore && (
              <img
                src={selectedStore.Favicon?.url || selectedStore.Logo?.url || '/images/logo.png'}
                alt={selectedStore.title}
                style={{ height: 36, width: 'auto', borderRadius: 12, border: '2px solid #f472b6', background: '#fff', boxShadow: '2px 2px 0 #fbbf24' }}
              />
            )}
          </Group>

          {!hideSelector && (
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
                  <Avatar src={stores.find(s => s.documentId == option.value)?.Favicon?.url} size={22} radius="xl" className="border-2 border-fuchsia-200" />
                  <Text className="font-bold text-fuchsia-700">{option.label}</Text>
                </Group>
              )}
              className="rounded-xl border-2 border-fuchsia-200 bg-white font-bold text-fuchsia-700"
            />
          )}
          <HoverCard width={280} shadow="md">
            <HoverCard.Target>
              <UnstyledButton className="rounded-xl border-2 border-fuchsia-200 bg-white px-2 py-1 hover:bg-fuchsia-50 transition-all">
                <Group>
                  {!user?.avatar?.url ? <IconUserCircle size={28} style={{ color: 'var(--mantine-color-blue-6)' }} /> : (
                    <Avatar
                      src={user?.avatar?.url}
                      size="sm"
                      radius="md"
                      color="blue"
                      className="border-2 border-fuchsia-200"
                    >
                      {user?.username?.charAt(0).toUpperCase()}
                    </Avatar>
                  )}
                  <Text fw={600} className="text-fuchsia-700">{user?.username}</Text>
                </Group>
              </UnstyledButton>
            </HoverCard.Target>
            <HoverCard.Dropdown className="rounded-xl border-2 border-fuchsia-200 bg-white">
              <Stack>
                <Group>
                  {!user?.avatar?.url ? <IconUserCircle size={32} style={{ color: 'var(--mantine-color-blue-6)' }} /> : (
                    <Avatar
                      src={user?.avatar?.url}
                      size="md"
                      radius="md"
                      color="blue"
                      className="border-2 border-fuchsia-200"
                    >
                      {user?.username?.charAt(0).toUpperCase()}
                    </Avatar>
                  )}
                  <div>
                    <Text fw={600} className="text-fuchsia-700">{user?.username}</Text>
                    <Text size="xs" c="dimmed">{user?.email}</Text>
                  </div>
                </Group>
                <Divider />
                <UnstyledButton component={Link} href="/auth" className="hover:bg-fuchsia-50 p-2 rounded-xl">
                  <Text size="sm">Auth Page</Text>
                </UnstyledButton>
                <UnstyledButton component={Link} href="/dashboard/settings" className="hover:bg-fuchsia-50 p-2 rounded-xl">
                  <Text size="sm">Settings</Text>
                </UnstyledButton>
              </Stack>
            </HoverCard.Dropdown>
          </HoverCard>
        </Group>
      </AppShell.Header>
      <AppShell.Navbar p="md" mt="lg" zIndex={1} className="border-r-4 border-fuchsia-200 bg-white/90 rounded-tr-2xl">
        <Stack h="100%" gap={0}>
          <div>
            <Group mb="md">
              <Text size="xs" tt="uppercase" fw={700} c="dimmed">
                Dashboard
              </Text>
              <Tooltip label="Go to home dashboard">
                <ActionIcon variant="subtle" component={Link} href="/dashboard" className="border-2 border-fuchsia-200">
                  <IconHomeStar size={16} />
                </ActionIcon>
              </Tooltip>
            </Group>
            <TextInput
              placeholder="Search menu..."
              leftSection={<IconSearch size={16} />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.currentTarget.value)}
              mb="md"
              size="xs"
              className="rounded-xl border-2 border-fuchsia-200 bg-white"
            />
            <Divider mb="md" className="border-fuchsia-200" />
          </div>
          <Box className="flex-1 flex flex-col overflow-hidden">
            <Stack gap="xs">
              {filteredLinks.map((link) => (
                <MainLink
                  {...link}
                  key={link.label}
                  store_id={selectedStore?.documentId}
                  active={currentActive === link.href}
                />
              ))}
            </Stack>
          </Box>
          <div className="mt-auto pt-3">
            <Divider mb="md" className="border-fuchsia-200" />
            <Button
              fullWidth
              leftSection={<IconWindmill size={16} />}
              className='mb-4 border-2 border-fuchsia-200 bg-fuchsia-50 text-fuchsia-700 font-bold hover:bg-fuchsia-100 hover:text-fuchsia-900 transition-all rounded-xl'
              variant="light"
              component={Link}
              href="/dashboard/settings"
            >
              Settings
            </Button>
            <Button
              fullWidth
              leftSection={<IconBuildingStore size={16} />}
              variant="light"
              component={Link}
              href="/auth"
              className='border-2 border-fuchsia-200 bg-fuchsia-50 text-fuchsia-700 font-bold hover:bg-fuchsia-100 hover:text-fuchsia-900 transition-all rounded-xl'
            >
              Auth
            </Button>
          </div>
        </Stack>
      </AppShell.Navbar>
      <AppShell.Main py="sm" className='!min-h-[90vh]'>
        <ProtectedRoute>
          <DashboardProvider store={selectedStore as Store}>
            {children}
          </DashboardProvider>
        </ProtectedRoute>
      </AppShell.Main>
    </AppShell>
  );
};
