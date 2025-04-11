'use client';

import {
  AppShell, Burger, Container, Paper, Group, Text, Loader,
  Select, Avatar, UnstyledButton, Divider, Button, Stack,
  TextInput, ScrollArea, HoverCard, Box, ActionIcon,
  Tooltip,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import {
  IconBuildingStore, IconArticle, IconShoppingCart, IconFileTypeDoc,
  IconShoppingBagEdit, IconTicket, IconLibraryPhoto, IconMusicStar,
  IconMessageChatbot, IconClipboardPlus, IconMoodEdit, IconCashBanknoteHeart,
  IconWindmill, IconUserCircle, IconSearch, IconHomeStar,
} from '@tabler/icons-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/providers/auth.provider';
import { Store } from '@/markket/store.d';
import ProtectedRoute from '@/app/components/protectedRoute';
import { DashboardProvider } from '@/app/providers/dashboard.provider';
import { useState, useRef, useCallback, useEffect, } from 'react';
import { MainLink } from '@/app/components/dashboard/ui.menu';

const mainLinks = [
  { icon: IconHomeStar, label: 'Store', href: '/dashboard/store' },
  { icon: IconShoppingCart, label: 'Products', href: '/dashboard/products' },
  { icon: IconArticle, label: 'Articles', href: '/dashboard/articles' },
  { icon: IconFileTypeDoc, label: 'Pages', href: '/dashboard/pages' },
  { icon: IconTicket, label: 'Events', href: '/dashboard/events' },
  { icon: IconLibraryPhoto, label: 'Collections', href: '/dashboard/albums' },
  { icon: IconMusicStar, label: 'Collection Items', notifications: 0, href: '/dashboard/tracks' },
  { icon: IconMessageChatbot, label: 'Inbox', notifications: 0, href: '/dashboard/inbox' },
  { icon: IconClipboardPlus, label: 'Forms', href: '/dashboard/forms' },
  { icon: IconMoodEdit, label: 'Subscribers', href: '/dashboard/newsletters' },
  { icon: IconShoppingBagEdit, label: 'Sales', notifications: 0, href: '/dashboard/orders' },
  { icon: IconCashBanknoteHeart, label: 'Payouts [Stripe]', href: '/dashboard/stripe' },
  { icon: IconBuildingStore, label: 'Settings', href: '/dashboard/settings' },
  { icon: IconWindmill, label: 'Stores', href: '/dashboard/stores' },
];

type DashboardLayoutProps = {
  children: React.ReactNode;
};

export default function AnyDashboardLayout({ children }: DashboardLayoutProps) {
  const [opened, { toggle }] = useDisclosure();
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [loading, setLoading] = useState(true);
  const { user, stores, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [favoriteLinks, setFavoriteLinks] = useState<string[]>([]);
  const viewportRef = useRef<HTMLDivElement>(null);

  let hideSelector = false;
  if (typeof window === 'object') {
    hideSelector = window.location.pathname.includes('settings') || window.location.pathname.includes('stores');
  }

  const filteredLinks = mainLinks.filter(link =>
    link.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleFavorite = (linkLabel: string) => {
    setFavoriteLinks(prev => {
      if (prev.includes(linkLabel)) {
        return prev.filter(l => l !== linkLabel);
      } else {
        return [...prev, linkLabel];
      }
    });
  };

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
    const savedFavorites = localStorage.getItem('markket.ui.dashboard');
    if (savedFavorites) {
      setFavoriteLinks(JSON.parse(savedFavorites));
    }

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

  useEffect(() => {
    // @TODO: persist in API
    if (!favoriteLinks.length) { return; }

    localStorage.setItem('markket.ui.dashboard', JSON.stringify(favoriteLinks));
  }, [favoriteLinks]);

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
        <Paper p="xs" withBorder mt="xl" px={0}>
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

  const favorites = filteredLinks.filter(link => favoriteLinks.includes(link.label));
  const regularLinks = filteredLinks.filter(link => !favoriteLinks.includes(link.label));

  return (
    <AppShell
      header={{ height: 'auto' }}
      navbar={{
        width: 300,
        breakpoint: 'sm',
        collapsed: { mobile: !opened }
      }}
      padding="xs"
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
                  <Avatar src={stores.find(s => s.documentId == option.value)?.Favicon?.url} size={20} radius="xl" />
                  <Text>{option.label}</Text>
                </Group>
              )}
            />
          )}
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
                <UnstyledButton component={Link} href="/dashboard/settings" className="hover:bg-gray-100 p-2 rounded">
                  <Text size="sm">Settings</Text>
                </UnstyledButton>
              </Stack>
            </HoverCard.Dropdown>
          </HoverCard>
        </Group>
      </AppShell.Header>
      <AppShell.Navbar p="md" mt="lg" zIndex={1}>
        <Stack h="100%" gap={0}>
          <div>
            <Group mb="md">
              <Text size="xs" tt="uppercase" fw={700} c="dimmed">
                Dashboard
              </Text>
              <Tooltip label="Go to home dashboard">
                <ActionIcon variant="subtle" component={Link} href="/dashboard">
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
            />
            <Divider mb="md" />
          </div>
          <Box className="flex-1 flex flex-col overflow-hidden">
            {favorites.length > 0 && (
              <>
                <Text size="xs" c="dimmed" fw={500} mb="xs" px="xs">
                  FAVORITES
                </Text>
                <ScrollArea.Autosize h={favorites.length * 48} type="hover" mb="sm">
                  <Stack gap="xs">
                    {favorites.map((link) => (
                      <MainLink
                        {...link}
                        key={`fav-${link.label}`}
                        store_id={selectedStore?.documentId}
                        active={currentActive === link.href}
                        favorite={true}
                        onFavorite={() => toggleFavorite(link.label)}
                      />
                    ))}
                  </Stack>
                </ScrollArea.Autosize>
                <Divider mb="md" />
              </>
            )}
            <Text size="xs" c="dimmed" fw={500} mb="xs" px="xs">
              NAVIGATION
            </Text>
            <ScrollArea.Autosize
              type="always"
              h={regularLinks.length * 48}
              viewportRef={viewportRef}
              scrollbarSize={8}
              scrollbars="y"
            >
              <Stack gap="xs">
                {regularLinks.map((link) => (
                  <MainLink
                    {...link}
                    key={link.label}
                    store_id={selectedStore?.documentId}
                    active={currentActive === link.href}
                    favorite={favoriteLinks.includes(link.label)}
                    onFavorite={() => toggleFavorite(link.label)}
                  />
                ))}
              </Stack>
            </ScrollArea.Autosize>
          </Box>
          <div className="mt-auto pt-3">
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
