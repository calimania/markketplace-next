'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Container, Title, Text, Paper, Stack, Group, Button } from '@mantine/core';
import { IconArrowLeft, IconPlus } from '@tabler/icons-react';
import { useAuth } from '@/app/providers/auth.provider';
import TinyBreadcrumbs from '@/app/components/ui/tiny.breadcrumbs';

export default function MeStoresPage() {
  const router = useRouter();
  const { confirmed, stores, fetchStores, isLoading } = useAuth();

  useEffect(() => {
    if (!confirmed()) {
      router.replace('/auth');
      return;
    }

    fetchStores();
  }, [confirmed, fetchStores, router]);

  return (
    <Container size="md" py="xl">
      <Stack gap="md" mb="lg">
        <TinyBreadcrumbs
          items={[
            { label: 'Me', href: '/me' },
            { label: 'Tienda' },
          ]}
        />

        <Group justify="space-between" align="flex-start">
          <div>
            <Title order={1}>My Stores</Title>
            <Text c="dimmed" mt={2}>
              <span className="accent-blue">/</span>
            </Text>
            <Text c="dimmed" mt={4}>Pick a store to open its workspace.</Text>
          </div>
          <Group>
            <Button variant="default" component={Link} href="/me" leftSection={<IconArrowLeft size={16} />}>
              Back
            </Button>
            <Button component={Link} href="/me/store/new" leftSection={<IconPlus size={16} />}>
              Create Store
            </Button>
          </Group>
        </Group>
      </Stack>

      <Stack>
        {isLoading && <Text c="dimmed">Loading stores...</Text>}
        {!isLoading && stores.length === 0 && (
          <Paper withBorder p="lg" radius="md">
            <Text c="dimmed">No stores found yet.</Text>
          </Paper>
        )}
        {!isLoading && stores.map((store) => (
          <Paper key={store.documentId} withBorder p="md" radius="md">
            <Group justify="space-between">
              <div>
                <Title order={4}>{store.title}</Title>
                <Text c="dimmed" size="sm">{store.slug}</Text>
              </div>
              <Button component={Link} href={`/tienda/${store.slug}`}>
                Open
              </Button>
            </Group>
          </Paper>
        ))}
      </Stack>
    </Container>
  );
}
