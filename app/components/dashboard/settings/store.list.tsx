
import { Text, Button, Group, Stack, Paper, Title, Badge } from '@mantine/core';
import Link from 'next/link';
import { markketConfig } from '@/markket/config';
import { Store } from '@/markket/store';
import { IconTrafficCone } from '@tabler/icons-react';

type StoreSettingsListPageProps = {
  stores: Store[];
  onCreate?: (store: Store | undefined) => void;
  onEdit?: (store: Store) => void;
};

const StoreSettingsListPage = ({stores}: StoreSettingsListPageProps) => {


  return (
    <>
      <Group justify="space-between" align="center">
        {stores?.length < markketConfig?.max_stores_per_user ? (
          <>
            <Text>You can create up to two stores</Text>
            <Button
              variant="light"
              component='a'
              href="/dashboard/stores/new"
            >
              Create New Store
            </Button>
          </>
        ) : (
          <>
            <Text><strong>{stores?.length} stores</strong></Text>
          </>
        )}
      </Group>
      <h3>Collaborators</h3>
      <Group>
        <IconTrafficCone size={32} color="#f48f01"/>
        <Text size="sm" c="dimmed" maw={600}>
        </Text>
        <strong>WIP</strong> To invite collaborators, send us an email <span className="text-indigo-700">support@caliman.org</span>
      </Group>

      {stores.length > 0 && (
        <Stack mt="xl">
          <Title order={5}>Your Stores</Title>
          {stores.map((store) => (
            <Paper key={store.id} withBorder p="md">
              <Group justify="space-between">
                <Text fw={500}>
                  <Link href={`/store/${store.slug}`} target="_preview">
                    {store.title}
                  </Link>
                </Text>
                <Badge>{store.slug}</Badge>
              </Group>
            </Paper>
          ))}
        </Stack>
      )}
    </>
  );
};

export default StoreSettingsListPage;

