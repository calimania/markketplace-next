'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Container,
  Title,
  Text,
  SimpleGrid,
  Paper,
  Group,
  Button,
  Badge,
  Stack,
} from '@mantine/core';
import { IconBuildingStore, IconPlus, IconUserCircle } from '@tabler/icons-react';
import { useAuth } from '@/app/providers/auth.provider';

export default function MeHomePage() {
  const router = useRouter();
  const { confirmed, stores, fetchStores, isLoading, user } = useAuth();

  useEffect(() => {
    if (!confirmed()) {
      router.replace('/auth');
      return;
    }

    fetchStores();
  }, [confirmed, fetchStores, router]);

  return (
    <Container size="lg" py="xl">
      <Group justify="space-between" align="end" mb="lg">
        <Stack gap={2}>
          <Group gap="xs">
            <IconUserCircle size={28} />
            <Title order={1}>My Profile</Title>
          </Group>
          <Text c="dimmed">Manage account access and pick a store workspace.</Text>
        </Stack>

        <Button component={Link} href="/me/store/new" leftSection={<IconPlus size={16} />}>
          Create Store
        </Button>
      </Group>

      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
        <Paper withBorder p="lg" radius="md">
          <Title order={3}>Account</Title>
          <Text mt="xs" c="dimmed">Signed in as {user?.email || user?.username || 'member'}.</Text>
          <Button mt="md" variant="light" component={Link} href="/auth">
            Account Settings
          </Button>
        </Paper>

        <Paper withBorder p="lg" radius="md">
          <Title order={3}>Stores</Title>
          <Text mt="xs" c="dimmed">Choose a store to open the seller workspace.</Text>
          <Button mt="md" component={Link} href="/me/stores" leftSection={<IconBuildingStore size={16} />}>
            Open Store List
          </Button>
        </Paper>
      </SimpleGrid>

      <Paper withBorder p="lg" radius="md" mt="md">
        <Group justify="space-between" mb="sm">
          <Title order={4}>Quick Access</Title>
          <Badge variant="light">{stores.length} stores</Badge>
        </Group>

        <Stack>
          {isLoading && <Text c="dimmed">Loading stores...</Text>}
          {!isLoading && stores.length === 0 && (
            <Text c="dimmed">No stores yet. Create one to start publishing.</Text>
          )}
          {!isLoading && stores.slice(0, 4).map((store) => (
            <Paper key={store.documentId} withBorder p="sm" radius="sm">
              <Group justify="space-between">
                <div>
                  <Text fw={600}>{store.title}</Text>
                  <Text size="sm" c="dimmed">/{store.slug}</Text>
                </div>
                <Button
                  size="xs"
                  component={Link}
                  href={`/tienda/${store.documentId}/store`}
                >
                  Open Workspace
                </Button>
              </Group>
            </Paper>
          ))}
        </Stack>
      </Paper>
    </Container>
  );
}
