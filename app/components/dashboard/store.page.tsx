'use client';

import { markketClient } from '@/markket/api';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  Container,
  Paper,
  Select,
  Group,
  Avatar,
  Text,
  Stack,
  Grid,
  Card,
  Image,
  Button,
  Badge,
  type ComboboxItem,
} from '@mantine/core';
import { Store } from '@/markket/store';
import { IconBuildingStore, IconLink, IconEdit } from '@tabler/icons-react';
import Link from 'next/link';
import Markdown from "@/app/components/ui/page.markdown";

type StoreOption = {
  value: string;
  label: string;
  image: string | undefined;
};

export default function StoreDashboardPage  ()   {
  const [ stores, setStores ] = useState<Store[]>([]);
  const [ store, setStore ] = useState<Store | null>(null);
  const router = useRouter();

  const storeOptions: StoreOption[]= stores.map((s) => ({
    value: s.id.toString(),
    label: s.title,
    image: s.Favicon?.url || s.Logo?.url
  }));

  const handleStoreChange = (storeId: string | null) => {
    if (storeId) {
      changeStore(parseInt(storeId));
    }
  };

  const getStores = async () => {
    const markket = new markketClient();
    try {
      const stores = await markket.fetch('/api/markket/store ', {});
      setStores(stores?.data || []);
      setStore(stores?.data?.[0] || null);

    } catch (error) {
      console.error('Failed to fetch stores:', error);
    }
  };

  const changeStore = (_id: number) => {
    const exists = stores.find((store) => store.id === _id);
    if (exists) {
      setStore(exists);
    }
  };

  useEffect(() => {
     getStores();
  }, []);

  return (
    <Container size="lg" py="xl">

        <Paper shadow="sm" p="md" withBorder mb="xl">
          <Group justify="space-between">
          <Group>
            <Text size="sm" fw={500} c="dimmed">
              Select Store
            </Text>
          </Group>
          <Group>
            <Button
              variant="light"
              size="sm"
              leftSection={<IconEdit size={16} />}
              onClick={() => router.push('/dashboard/settings#store')}
            >
              {!stores?.length && 'Create Stores'}
              {!!stores?.length && 'Manage Stores'}
            </Button>
            <Select
              value={store?.id.toString()}
              onChange={handleStoreChange}
              data={storeOptions}
              placeholder="Choose store"
              clearable={false}
              maxDropdownHeight={400}
              comboboxProps={{ withinPortal: true }}
              renderOption={({ option }: { option: ComboboxItem }) => (
                <Group gap="sm">
                  <Avatar
                    src={(option as StoreOption).image}
                    size={20}
                    radius="xl"
                  />
                  <span>{option.label}</span>
                </Group>
              )}
            />
          </Group>
        </Group>
      </Paper>

      {store && (
        <Stack gap="xl">
          <Paper shadow="sm" p="lg" withBorder>
            <Group wrap="nowrap" gap="xl">
              <Avatar
                src={store.Favicon?.url || store.Logo?.url}
                size={100}
                radius="md"
              />
              <div style={{ flex: 1 }}>
                <Text fz="lg" fw={500} mb={3}>
                  {store.title}
                </Text>
                <Markdown content={store.Description || ''} />
                <Group gap="xs">
                  <Badge color="blue">Active</Badge>
                  {store.URLS?.length > 0 && (
                    <Badge color="teal">URLs</Badge>
                  )}
                </Group>
              </div>
            </Group>
          </Paper>
          <Grid>
            <Grid.Col span={{ base: 12, md: 4 }}>
              <Card shadow="sm" padding="lg" radius="md" withBorder>
                <Card.Section p="md">
                  <Group>
                    <IconBuildingStore size={24} />
                    <Text fw={500}>Store Details</Text>
                  </Group>
                </Card.Section>
                <Stack gap="xs" mt="md">
                  <Text size="sm">
                    <b>Slug: </b>
                    <Link href={`/store/${store?.slug}`} title={store?.title} className='cursor-pointer'>
                      {store.slug}
                    </Link>
                  </Text>
                  <Text size="sm">
                    <b>Created:</b> {new Date(store.createdAt).toLocaleDateString()}
                  </Text>
                  {store.URLS?.length > 0 && (
                    <Text size="sm">
                      <b>Custom Domain:</b> {store?.URLS?.[0].URL}
                    </Text>
                  )}
                </Stack>
              </Card>
            </Grid.Col>

            {store.SEO && (
              <Grid.Col span={{ base: 12, md: 8 }}>
                <Card shadow="sm" padding="lg" radius="md" withBorder>
                  <Card.Section p="md">
                    <Group>
                      <IconLink size={24} />
                      <Text fw={500}>SEO Preview</Text>
                    </Group>
                  </Card.Section>
                  {store.SEO.socialImage && (
                    <Image
                      src={store.SEO.socialImage.url}
                      height={200}
                      alt="Store social preview"
                      mt="md"
                    />
                  )}
                  <Text fz="lg" fw={500} mt="md">
                    {store.SEO.metaTitle || store.title}
                  </Text>
                  <Text size="sm" c="dimmed" mt="xs">
                    {store.SEO.metaDescription}
                  </Text>
                </Card>
              </Grid.Col>
            )}
          </Grid>
        </Stack>
      )}
    </Container>
  );
};
