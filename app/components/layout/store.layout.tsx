'use client';

import { AppShell, Burger, Container, Group, Button, Text } from "@mantine/core";
import { IconHome, IconShoppingCart, IconArticle, IconInfoCircle } from "@tabler/icons-react";
import Link from "next/link";
import { useDisclosure } from '@mantine/hooks';
import { Store } from '@/markket/store.d';


// Make a separate component for the navigation links
function StoreNavigation({ slug }: { slug: string }) {
  return (
    <Group gap="xs" w="100%">
      <Link href={`/store/${slug}`}>
        <Button variant="subtle" leftSection={<IconHome size={16} />}>
          Home
        </Button>
      </Link>
      <Link href={`/store/${slug}/products`}>
        <Button variant="subtle" leftSection={<IconShoppingCart size={16} />}>
          Products
        </Button>
      </Link>
      <Link href={`/store/${slug}/articles`}>
        <Button variant="subtle" leftSection={<IconArticle size={16} />}>
          Articles
        </Button>
      </Link>
      <Link href={`/store/${slug}/about`}>
        <Button variant="subtle" leftSection={<IconInfoCircle size={16} />}>
          About
        </Button>
      </Link>
      <Link href="/">
        <Button variant="outline">
          Back to Markket
        </Button>
      </Link>
    </Group>
  );
}

export function ClientLayout({
  children,
  store,
}: {
  children: React.ReactNode;
  store: Store;
}) {
  const [opened, { toggle }] = useDisclosure();

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: 300,
        breakpoint: 'sm',
        collapsed: {
          desktop: !opened,
          mobile: !opened,
        }
      }}
      padding="md"
    >
      <AppShell.Header>
        <Container size="lg">
          <Group justify="space-between" h="60px">
            <Group>
              <Burger
                opened={opened}
                onClick={toggle}
                size="sm"
                // Remove hiddenFrom to show burger on all screen sizes
              />
              <Link href={`/store/${store?.slug}`}>
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
        <Text size="sm" fw={500} mb="md">
          Store Navigation
        </Text>
        <div className="flex flex-col gap-2">
          <StoreNavigation slug={store?.slug} />
        </div>
      </AppShell.Navbar>

      <AppShell.Main>
        {children}
      </AppShell.Main>
    </AppShell>
  );
};


