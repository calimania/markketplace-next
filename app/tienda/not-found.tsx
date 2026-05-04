'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Button, Group, Paper, Stack, Text, Title } from '@mantine/core';

function getStoreSlugFromPath(pathname: string) {
  const parts = pathname.split('/').filter(Boolean);
  const tiendaIndex = parts.indexOf('tienda');

  if (tiendaIndex < 0) return '';
  const candidate = parts[tiendaIndex + 1];

  if (!candidate || ['new'].includes(candidate)) return '';
  return candidate;
}

export default function TiendaNotFound() {
  const router = useRouter();
  const pathname = usePathname() || '/tienda';
  const storeSlug = getStoreSlugFromPath(pathname);

  return (
    <Stack gap="md" maw={780} mx="auto" my="xl" px="md">
      <Paper withBorder p="xl" radius="md">
        <Stack gap="sm">
          <Title order={2}>This page, product, event, or article does not exist</Title>
          <Text c="dimmed">
            The item you opened could not be found. Use the links below to get back to your store content.
          </Text>

          <Group gap="sm" mt="sm">
            <Button variant="default" onClick={() => router.back()}>
              Go Back
            </Button>
            <Button component={Link} href="/tienda" variant="filled">
              All Stores
            </Button>
            <Button component={Link} href="/me" variant="light">
              My Account
            </Button>
          </Group>

          <Text size="sm" mt="xs">
            Quick links: <Link href="/tienda">Stores</Link> · <Link href="/me">Account</Link>
            {storeSlug ? (
              <>
                {' '}· <Link href={`/tienda/${storeSlug}`}>Store</Link> ·{' '}
                <Link href={`/tienda/${storeSlug}/pages`}>Pages</Link> ·{' '}
                <Link href={`/tienda/${storeSlug}/blog`}>Articles</Link> ·{' '}
                <Link href={`/tienda/${storeSlug}/products`}>Products</Link> ·{' '}
                <Link href={`/tienda/${storeSlug}/events`}>Events</Link>
              </>
            ) : null}
          </Text>

          {!!storeSlug && (
            <Group gap="sm" mt="xs">
              <Button component={Link} href={`/tienda/${storeSlug}`} variant="default">
                Store Overview
              </Button>
              <Button component={Link} href={`/tienda/${storeSlug}/pages`} variant="subtle">
                Pages
              </Button>
              <Button component={Link} href={`/tienda/${storeSlug}/blog`} variant="subtle">
                Articles
              </Button>
              <Button component={Link} href={`/tienda/${storeSlug}/products`} variant="subtle">
                Products
              </Button>
              <Button component={Link} href={`/tienda/${storeSlug}/events`} variant="subtle">
                Events
              </Button>
            </Group>
          )}

          <Text size="xs" c="dimmed" mt="sm">
            Missing route: {pathname}
          </Text>
        </Stack>
      </Paper>
    </Stack>
  );
}
