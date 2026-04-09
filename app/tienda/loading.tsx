import { Container, Group, Paper, Skeleton, Stack } from '@mantine/core';

export default function TiendaIndexLoading() {
  return (
    <Container size="md" py="xl">
      <Stack gap="md">
        <Group justify="space-between" align="center">
          <Skeleton height={30} width="42%" radius="md" />
          <Skeleton height={34} width={130} radius="xl" />
        </Group>

        <Paper withBorder radius="md" p="md">
          <Stack gap="sm">
            <Skeleton height={16} width={180} radius="sm" />
            <Skeleton height={52} radius="md" />
            <Skeleton height={52} radius="md" />
            <Skeleton height={52} radius="md" />
          </Stack>
        </Paper>
      </Stack>
    </Container>
  );
}
