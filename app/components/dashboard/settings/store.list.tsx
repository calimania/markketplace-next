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
      <Group justify="space-between" align="center" className="mb-6">
        {stores?.length < markketConfig?.max_stores_per_user ? (
          <>
            <Text className="text-fuchsia-700 font-bold text-lg">You can create up to two stores</Text>
            <Button
              variant="light"
              component='a'
              href="/dashboard/stores/new"
              className="border-2 border-black bg-yellow-100 text-fuchsia-700 font-bold hover:bg-fuchsia-200 hover:text-fuchsia-900 transition-all shadow-md rounded-xl px-6 py-2"
            >
              + Create New Store
            </Button>
          </>
        ) : (
            <Text className="text-fuchsia-700 font-bold text-lg"><strong>{stores?.length} stores</strong></Text>
        )}
      </Group>
      <Paper withBorder radius="lg" p="md" className="border-2 border-black bg-gradient-to-br from-fuchsia-50 to-sky-50 mb-6">
        <Group>
          <IconTrafficCone size={32} color="#f48f01" className="drop-shadow" />
          <Text size="sm" c="dimmed" maw={600}>
            <strong className="text-fuchsia-700">Collaborators</strong> <span className="ml-2">(WIP)</span> — To invite collaborators, send us an email <span className="text-indigo-700 font-bold">support@caliman.org</span>
          </Text>
        </Group>
      </Paper>
      {stores.length > 0 && (
        <Stack mt="xl" gap="lg">
          <Title order={4} className="text-fuchsia-700 font-bold mb-2">Your Stores</Title>
          <Group gap="lg" wrap="wrap">
            {stores.map((store) => (
              <Paper key={store.id} withBorder p="lg" radius="xl" className="border-4 border-black bg-white/90 shadow-xl min-w-[220px] max-w-xs flex-1 hover:bg-fuchsia-50 transition-all">
                <Stack gap="xs">
                  <Group justify="space-between">
                    <Text fw={700} className="text-sky-900 text-lg">
                      <Link href={`/store/${store.slug}`} target="_preview" className="hover:underline">
                        {store.title}
                      </Link>
                    </Text>
                    <Badge size="lg" color="fuchsia" className="border-2 border-black bg-fuchsia-100 text-fuchsia-700 font-bold">{store.slug}</Badge>
                  </Group>
                  <Text size="xs" c="dimmed" className="italic">ID: {store.documentId}</Text>
                </Stack>
              </Paper>
            ))}
          </Group>
        </Stack>
      )}
    </>
  );
};

export default StoreSettingsListPage;

