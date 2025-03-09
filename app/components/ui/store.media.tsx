'use client';

import { useState } from 'react';
import {
  Group,
  Text,
  FileButton,
  Button,
  Stack,
  Image,
  Paper,
  Title,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconUpload, IconPhoto } from '@tabler/icons-react';
import { Store, Media } from '@/markket/store';
import { strapiClient } from '@/markket/api';

interface StoreMediaProps {
  store: Store;
  onUpdate: (file: Media, field: string, id: number | string) => void;
}

export default  function StoreMedia({ store, onUpdate }: StoreMediaProps) {
  const [loading, setLoading] = useState<'logo' | 'favicon' | 'social' | null>(null);

  const handleUpload = async (file: File, field: 'Logo' | 'Favicon' | 'SEO.socialImage' | 'Cover') => {
    if (!store?.id) return;

    try {
      setLoading(field === 'Logo' ? 'logo' : field === 'Favicon' ? 'favicon' : 'social');

      // const markket = new markketClient();
      // const response = await markket.uploadImage(file, field, store.id);

      const response = await strapiClient.uploadAvatar(file, { id: store.id, field, model: 'api::store.store' });
      console.log('response', response);

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      notifications.show({
        title: 'Success',
        message: `Store ${field?.toLowerCase()} updated successfully`,
        color: 'green',
      });

      const json= await response.json();

      onUpdate(json?.[0] as Media, field, store.id);
    } catch (error) {
      console.error('Upload failed:', error);
      notifications.show({
        title: 'Error',
        message: `Failed to upload ${field?.toLowerCase()}`,
        color: 'red',
      });
    } finally {
      setLoading(null);
    }
  };

  return (
    <Paper withBorder p="md" radius="md">
      <Stack>
        <Title order={4}>Store Media</Title>

        <Group align="flex-start">
          <Paper withBorder p="xs" radius="md">
            <Stack align="center">
              {store.Logo?.url ? (
                <Image
                  src={store.Logo.url}
                  alt="Store logo"
                  width={100}
                  height={100}
                  fit="contain"
                />
              ) : (
                <IconPhoto size={100} opacity={0.3} />
              )}
              <FileButton
                onChange={(file) => file && handleUpload(file, 'Logo')}
                accept="image/png,image/jpeg,image/svg+xml"
              >
                {(props) => (
                  <Button
                    variant="light"
                    size="xs"
                    leftSection={<IconUpload size={14} />}
                    loading={loading === 'logo'}
                    {...props}
                  >
                    Upload Logo
                  </Button>
                )}
              </FileButton>
              <Text size="xs" c="dimmed">Recommended: 600x600px</Text>
            </Stack>
          </Paper>
          <Paper withBorder p="xs" radius="md">
            <Stack align="center">
              {store.Favicon?.url ? (
                <Image
                  src={store.Favicon.url}
                  alt="Store favicon"
                  width={100}
                  height={100}
                  fit="contain"
                />
              ) : (
                <IconPhoto size={100} opacity={0.3} />
              )}
              <FileButton
                onChange={(file) => file && handleUpload(file, 'Favicon')}
                accept="image/png,image/x-icon,image/svg+xml"
              >
                {(props) => (
                  <Button
                    variant="light"
                    size="xs"
                    leftSection={<IconUpload size={14} />}
                    loading={loading === 'favicon'}
                    {...props}
                  >
                    Upload Favicon
                  </Button>
                )}
              </FileButton>
              <Text size="xs" c="dimmed">Recommended: 120x120px</Text>
            </Stack>
          </Paper>
          <Paper withBorder p="xs" radius="md">
            <Stack align="center">
              {store.Cover?.url ? (
                <Image
                  src={store.Cover.url}
                  alt="Social preview"
                  width={200}
                  height={100 }
                  fit="cover"
                />
              ) : (
                <IconPhoto size={100} opacity={0.3} />
              )}
              <FileButton
                onChange={(file) => file && handleUpload(file, 'Cover')}
                accept="image/png,image/jpeg"
              >
                {(props) => (
                  <Button
                    variant="light"
                    size="xs"
                    leftSection={<IconUpload size={14} />}
                    loading={loading === 'social'}
                    {...props}
                  >
                    Upload Cover Image
                  </Button>
                )}
              </FileButton>
              <Text size="xs" c="dimmed">Recommended: 1200x630px</Text>
            </Stack>
          </Paper>
        </Group>
      </Stack>
    </Paper>
  );
};
