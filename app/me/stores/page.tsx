'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Container, Title, Text, Paper, Stack, Group, Button } from '@mantine/core';
import { IconArrowLeft, IconPlus } from '@tabler/icons-react';
import { useAuth } from '@/app/providers/auth.provider';

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
      <Group justify="space-between" mb="lg">
        <div>
          <Title order={1}>My Stores</Title>
          <Text c="dimmed">Pick a store to open its workspace.</Text>
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
