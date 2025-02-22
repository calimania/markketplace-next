'use client';

import { useAuth } from '@/app/providers/auth';
import {
  Container,
  Paper,
  Text,
  Group,
  Avatar,
  Title,
  Stack,
  Button,
  Badge,
} from '@mantine/core';
import { IconEdit } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
  const { user } = useAuth();
  const router = useRouter();

  if (!user) {
    return null;
  }

  return (
    <Container size="md" py="xl">
      <Paper withBorder p="xl" radius="md" mb="xl">
        <Group justify="space-between" align="flex-start">
          <Group>
            <Avatar
              src={user.avatar}
              size="xl"
              radius="md"
              color="blue"
            >
              {user.username?.charAt(0).toUpperCase()}
            </Avatar>

            <Stack gap="xs">
              <div>
                <Title order={3}>{user.username}</Title>
                <Text size="sm" c="dimmed">ID: {user.id}</Text>
              </div>
              <Group gap="xs">
                <Badge variant="light" color="blue">
                  Store Owner
                </Badge>
                <Text size="sm" c="dimmed">·</Text>
                <Text size="sm" c="dimmed">
                  Member since {new Date(user.createdAt).toLocaleDateString()}
                </Text>
              </Group>
            </Stack>
          </Group>

          <Button
            variant="light"
            leftSection={<IconEdit size={16} />}
            onClick={() => router.push('/dashboard/settings/profile')}
          >
            Edit Profile
          </Button>
        </Group>
      </Paper>

      {/* Settings tabs will be rendered below through layout */}
    </Container>
  );
};
