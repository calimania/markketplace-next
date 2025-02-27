'use client';

import { useState } from 'react';
import {
  TextInput,
  Textarea,
  Button,
  Group,
  Stack,
  Paper,
  Text,
  Title,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IconBuildingStore } from '@tabler/icons-react';

interface StoreFormValues {
  title: string;
  Description: string;
  slug: string;
}

export default function StoreForm() {
  const [loading, setLoading] = useState(false);

  const form = useForm<StoreFormValues>({
    initialValues: {
      title: '',
      Description: '',
      slug: '',
    },
    validate: {
      title: (value) => (value.length < 3 ? 'Title must be at least 3 characters' : null),
      slug: (value) => {
        if (value.length < 5) return 'Slug must be at least 5 characters';
        if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)) {
          return 'Slug can only contain lowercase letters, numbers, and hyphens';
        }
        return null;
      },
      Description: (value) => (value.length < 10 ? 'Description must be at least 10 characters' : null),
    },
  });

  const handleSubmit = async (values: StoreFormValues) => {
    setLoading(true);
    try {
      const response = await fetch('/api/markket/store', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error('Failed to create store');
      }

      notifications.show({
        title: 'Success',
        message: 'Store created successfully',
        color: 'green',
      });

      form.reset();
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to create store',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper withBorder p="md" radius="md">
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack>
          <Group>
            <IconBuildingStore size={24} />
            <Title order={3}>Create New Store</Title>
          </Group>

          <Text size="sm" c="dimmed">
            Fill out the form below to create a new store. The slug will be used in your store's URL.
          </Text>

          <TextInput
            label="Store Name"
            placeholder="My Awesome Store"
            required
            {...form.getInputProps('title')}
          />

          <TextInput
            label="Store Slug"
            placeholder="my-awesome-store"
            description="This will be your store's URL: markket.place/store/[slug]"
            required
            {...form.getInputProps('slug')}
          />

          <Textarea
            label="Description"
            placeholder="Tell us about your store..."
            required
            minRows={3}
            {...form.getInputProps('Description')}
          />

          <Group justify="flex-end">
            <Button
              type="submit"
              loading={loading}
              leftSection={<IconBuildingStore size={16} />}
            >
              Create Store
            </Button>
          </Group>
        </Stack>
      </form>
    </Paper>
  );
};
