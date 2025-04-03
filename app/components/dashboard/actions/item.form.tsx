
// import SEOPreview from '../seo.preview';
import { ContentItem } from '@/app/hooks/common';
import { useState } from 'react';
import {
  TextInput,
  Container,
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
import { Store, SEO } from '@/markket';


interface StoreFormValues {
  title: string;
  Description: string;
  slug: string;
  SEO?: SEO;
};

type ItemFormProps = {
  onSubmit: (values: StoreFormValues) => void;
  action: string;
  item: ContentItem;
  id?: string;
  store: Store;
  singular: string;
  previewUrl?: string;
  create?: any;
  update?: any;
  form_config?: any;
};

const FormItem = ({ id, create, update, form_config }: ItemFormProps) => {
  const [loading, setLoading] = useState(false);

  const form = useForm<StoreFormValues>(form_config);

  const handleSubmit = async (values: StoreFormValues) => {
    setLoading(true);

    try {
      if (create) create(values);

      if (update && id) update(values);

      notifications.show({
        title: 'Success',
        message: 'Store created successfully',
        color: 'green',
      });

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
    <Container size="md" py="xl" >
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
    </Container>
  );
};

export default FormItem;
