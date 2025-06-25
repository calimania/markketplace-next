'use client';

import { AppShell, Burger, Container, Group, Button, Text, Stack } from "@mantine/core";
import { IconHome, IconShoppingCart, IconLockBolt, IconArticle, IconInfoCircle, IconArrowLeft } from "@tabler/icons-react";
import Link from "next/link";
import { useDisclosure } from '@mantine/hooks';
import { Store } from '@/markket/store.d';
import './store-navbar.css';

function StoreNavigation({ slug, onNavigate }: { slug: string; onNavigate?: () => void }) {
  return (
    <Stack gap="md" w="100%">
      <Stack gap="xs">
        <Link href={`/store/${slug}`} onClick={onNavigate}>
          <Button
            variant="subtle"
            leftSection={<IconHome size={18} />}
            fullWidth
            className="justify-start h-12 store-nav-btn"
          >
            Store Home
          </Button>
        </Link>
        <Link href={`/store/${slug}/products`} onClick={onNavigate}>
          <Button
            variant="subtle"
            leftSection={<IconShoppingCart size={18} />}
            fullWidth
            className="justify-start h-12 store-nav-btn"
          >
            Products
          </Button>
        </Link>
        <Link href={`/store/${slug}/blog`} onClick={onNavigate}>
          <Button
            variant="subtle"
            leftSection={<IconArticle size={18} />}
            fullWidth
            className="justify-start h-12 store-nav-btn"
          >
            Articles
          </Button>
        </Link>
        <Link href={`/store/${slug}/about`} onClick={onNavigate}>
          <Button
            variant="subtle"
            leftSection={<IconInfoCircle size={18} />}
            fullWidth
            className="justify-start h-12 store-nav-btn"
          >
            About
          </Button>
        </Link>
      </Stack>

      <Stack gap="xs" className="mt-auto pt-4 border-t border-gray-200">
        <Link href="/stores" onClick={onNavigate}>
          <Button
            variant="light"
            leftSection={<IconArrowLeft size={18} />}
            fullWidth
            className="justify-start h-12 store-nav-btn store-nav-btn-light"
          >
            All Stores
          </Button>
        </Link>
        <Link href="/" onClick={onNavigate}>
          <Button
            variant="light"
            leftSection={<IconArrowLeft size={18} />}
            fullWidth
            className="justify-start h-12 store-nav-btn store-nav-btn-light"
          >
            Markkët Home
          </Button>
        </Link>
        <Link href="/auth" onClick={onNavigate}>
          <Button
            variant="light"
            leftSection={<IconLockBolt size={18} />}
            fullWidth
            className="justify-start h-12 store-nav-btn store-nav-btn-light"
          >
            Auth Page
          </Button>
        </Link>
      </Stack>
    </Stack>
  );
}

type ClientLayoutProps = {
  children: React.ReactNode;
  store: Store;
};

export function ClientLayout({
  children,
  store,
}: ClientLayoutProps) {
  const [opened, { toggle, close }] = useDisclosure();

  const handleNavigation = () => {
    close();
  };

  return (
    <AppShell
      header={{ height: 60, }}
      navbar={{
        width: 300,
        breakpoint: 'sm',
        collapsed: {
          desktop: !opened,
          mobile: !opened,
        }
      }}
    >
      <AppShell.Header>
        <Container size="lg">
          <Group justify="space-between" h="60px">
            <Group gap="md">
              <Burger
                opened={opened}
                onClick={toggle}
                size="sm"
              />
              <Link href={`/store/${store?.slug}`} onClick={handleNavigation}>
                <img
                  src={store?.Logo?.url}
                  alt={store?.SEO?.metaTitle}
                  style={{ height: '30px', width: 'auto' }}
                />
              </Link>
            </Group>
          </Group>
        </Container>
      </AppShell.Header>

      <AppShell.Navbar p="md">
        <Stack h="100%">
          <Text size="sm" fw={500} c="dimmed" className="uppercase tracking-wider">
            Store Navigation
          </Text>
          <StoreNavigation
            slug={store?.slug as string}
            onNavigate={handleNavigation}
          />
        </Stack>
      </AppShell.Navbar>

      <AppShell.Main p="xs" className="store-page">
        {children}
      </AppShell.Main>
    </AppShell>
  );
};
