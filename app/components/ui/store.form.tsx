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
import { markketClient } from '@/markket/api';

interface StoreFormValues {
  title: string;
  Description: string;
  slug: string;
  SEO?: {
    metaTitle: string;
    metaDescription: string;
  };
};

type StoreFormProps = {
  onSubmit: (values: StoreFormValues) => void;
};

export default function StoreForm(props: StoreFormProps) {
  const { onSubmit } = props;
  const [loading, setLoading] = useState(false);

  const form = useForm<StoreFormValues>({
    initialValues: {
      title: '',
      Description: '',
      slug: '',
      SEO: {
        metaDescription: '',
        metaTitle: '',
      }
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
      SEO: {
        metaTitle: (value: string) => (value.length < 3 ? 'Meta title must be at least 3 characters' : null),
        metaDescription: (value: string) => (value.length < 10 ? 'Meta description must be at least 10 characters' : null),
      },
      Description: (value) => (value.length < 10 ? 'Description must be at least 10 characters' : null),
    },
  });

  const handleSubmit = async (values: StoreFormValues) => {
    setLoading(true);
    const client = new markketClient();

    try {
      const response = await client.post('/api/markket/store', {
        body: {
          store: values,
        },
      });

      if (!response?.data?.id) {
        throw new Error('Failed to create store');
      }

      notifications.show({
        title: 'Success',
        message: 'Store created successfully',
        color: 'green',
      });

      if (onSubmit) onSubmit(values);
      form.reset();
    } catch (error) {
      console.warn({ error });
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
            Fill out the form below to create a new store. The slug will be used in your store&apos;s URL.
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

          <Stack mt="xl">
            <Title order={5}>META Settings</Title>
            <Text size="sm" c="dimmed">
              This content is used by aggregators to better understand your store
            </Text>

            <TextInput
              label="Meta Title"
              placeholder="Your Store Name - Key Product or Service"
              description="Title that appears in search engine results (50-60 characters recommended)"
              required
              {...form.getInputProps('SEO.metaTitle')}
            />

            <Textarea
              label="Meta Description"
              placeholder="Brief description of your store for search results..."
              description="Short description that appears in search results (150-160 characters recommended)"
              required
              minRows={2}
              maxLength={160}
              {...form.getInputProps('SEO.metaDescription')}
            />
          </Stack>

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
