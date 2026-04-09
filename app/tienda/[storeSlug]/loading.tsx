import { Paper, Skeleton, Stack, Group } from '@mantine/core';

function SectionSkeleton() {
  return (
    <Paper withBorder radius="md" p="md">
      <Stack gap="sm">
        <Group justify="space-between" align="center">
          <Skeleton height={18} width={180} radius="sm" />
          <Skeleton height={28} width={84} radius="xl" />
        </Group>
        <Skeleton height={52} radius="md" />
        <Skeleton height={52} radius="md" />
        <Skeleton height={52} radius="md" />
      </Stack>
    </Paper>
  );
}

export default function TiendaStoreLoading() {
  return (
    <Stack gap="md">
      <Skeleton height={12} width={210} radius="sm" />

      <Group justify="space-between" align="flex-start">
        <Stack gap="xs" style={{ flex: 1 }}>
          <Skeleton height={34} width="38%" radius="md" />
          <Skeleton height={14} width={190} radius="sm" />
          <Skeleton height={12} width="62%" radius="sm" />
        </Stack>
        <Skeleton height={26} width={84} radius="xl" />
      </Group>

      <Paper withBorder radius="md" p="md">
        <Stack gap="sm">
          <Skeleton height={16} width={140} radius="sm" />
          <Skeleton height={12} width="100%" radius="sm" />
          <Skeleton height={12} width="92%" radius="sm" />
          <Skeleton height={12} width="78%" radius="sm" />
        </Stack>
      </Paper>

      <SectionSkeleton />
      <SectionSkeleton />
      <SectionSkeleton />
    </Stack>
  );
}
