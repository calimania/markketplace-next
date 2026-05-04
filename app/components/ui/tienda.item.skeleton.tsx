'use client';

import { Divider, Group, Paper, Skeleton, Stack } from '@mantine/core';

/**
 * Skeleton placeholder for tienda content detail pages while data loads.
 * Mirrors the rough shape of TiendaDetailShell + content cards.
 */
export default function TiendaItemSkeleton() {
  return (
    <Stack gap="md" py="md" px={{ base: 'sm', sm: 'md' }}>
      {/* Breadcrumb */}
      <Group gap="xs">
        <Skeleton height={12} width={60} radius="xl" />
        <Skeleton height={12} width={8} radius="xl" />
        <Skeleton height={12} width={80} radius="xl" />
        <Skeleton height={12} width={8} radius="xl" />
        <Skeleton height={12} width={100} radius="xl" />
      </Group>

      {/* Title + actions row */}
      <Group justify="space-between" align="center">
        <Skeleton height={28} width={240} radius="md" />
        <Group gap="sm">
          <Skeleton height={32} width={80} radius="md" />
          <Skeleton height={32} width={80} radius="md" />
          <Skeleton height={32} width={64} radius="md" />
        </Group>
      </Group>

      {/* Meta description */}
      <Skeleton height={14} width="70%" radius="xl" />

      {/* Media slots (Cover + Social) */}
      <Group gap="md" align="flex-start">
        <Stack gap={6} align="center">
          <Skeleton height={90} width={130} radius="md" />
          <Skeleton height={10} width={50} radius="xl" />
        </Stack>
        <Stack gap={6} align="center">
          <Skeleton height={90} width={130} radius="md" />
          <Skeleton height={10} width={50} radius="xl" />
        </Stack>
      </Group>

      <Divider />

      {/* Content preview card */}
      <Paper withBorder p="lg" radius="md" style={{ background: 'var(--mantine-color-gray-0, #fafafa)' }}>
        <Stack gap="sm">
          <Skeleton height={14} radius="xl" />
          <Skeleton height={14} radius="xl" width="90%" />
          <Skeleton height={14} radius="xl" width="80%" />
          <Skeleton height={14} radius="xl" width="95%" />
          <Skeleton height={14} radius="xl" width="60%" />
        </Stack>
      </Paper>

      {/* Public link bar */}
      <Group gap="xs">
        <Skeleton height={32} width={160} radius="md" />
        <Skeleton height={32} width={120} radius="md" />
      </Group>
    </Stack>
  );
}
