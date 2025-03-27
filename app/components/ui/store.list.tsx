
import { Text, Button, Group, Stack, Paper, Title, Badge } from '@mantine/core';
import Link from 'next/link';
import { markketConfig } from '@/markket/config';
import { useState } from 'react';
import StoreForm from '@/app/components/ui/store.form';
import { Store } from '@/markket/store';

type StoreSettingsListPageProps = {
  stores: Store[];
  onCreate?: (store: Store | undefined) => void;
  onEdit?: (store: Store) => void;
};

const StoreSettingsListPage = ({stores, onCreate}: StoreSettingsListPageProps) => {
  const [showStoreForm, setShowStoreForm] = useState(false);

  return (
    <>
      <Text size="sm" c="dimmed" maw={600}>
      </Text>
      <Group justify="space-between" align="center">
        {stores?.length < markketConfig?.max_stores_per_user ? (
          <>
            <Text>You can create up to two stores</Text>
            <Button
              variant="light"
              onClick={() => setShowStoreForm(!showStoreForm)}
            >
              {showStoreForm ? 'Cancel' : 'Create New Store'}
            </Button>
          </>
        ) : (
          <>
            <Text><strong>{stores?.length} stores</strong></Text>
          </>
        )}
      </Group>
      {showStoreForm && (
        stores?.length >= markketConfig?.max_stores_per_user ?
          (<></>) :
          (<StoreForm onSubmit={(values) => {
            setShowStoreForm(false);
            return onCreate && onCreate(values as Store);
          }} />)
      )}

      {stores.length > 0 && (
        <Stack mt="xl">
          <Title order={5}>Your Stores</Title>
          {stores.map((store) => (
            <Paper key={store.id} withBorder p="md">
              <Group justify="space-between">
                <Text fw={500}>
                  <Link href={`/store/${store.slug}`}>
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

