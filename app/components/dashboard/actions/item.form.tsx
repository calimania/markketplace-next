import {
  Container,
  Badge,
  Divider,
  ThemeIcon,
  Collapse,
  Accordion,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { Article, Product, Album, URL, Page, AlbumTrack } from '@/markket';
import {
  IconCalendar,
  IconClock,
  IconBubbleTea,
  IconSailboat,
  IconLinkPlus,
  IconCurrencyDollar,
  IconPigMoney,
  IconPhotoHexagon,
  IconAlbum,
} from '@tabler/icons-react';
import { format } from 'date-fns';
import { ContentBlock } from '../content.blocks.view';
import SEOPreview from '../seo.preview';
import { ContentItem } from '@/app/hooks/common';
import { Remarkable } from 'remarkable';
import ImagesView from '../item.images';
import AlbumTrackList from '../album.tracks.component';
import AlbumsView from '../album.page.component';
import { useRouter } from 'next/navigation';
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
import { Store, SEO } from '@/markket';

const prefixMap: Record<string, string> = {
  article: 'blog',
  track: 'track',
  page: 'about',
  product: 'product',
  store: 'store',
}


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
  store: Store;
  singular: string;
  previewUrl?: string;
  onCreate?: any;
  onUpdate?: any;
};


const seoUrl = (preview_url: string | undefined, store: Store, item: ContentItem, prefix?: string) => {
  if (preview_url) return preview_url;

  if (prefix == 'store') return `/store/${item.slug}`;

  return `/store/${store?.slug}/${prefix}/${item.slug}`;
}

const FormItem = ({  }: ItemFormProps) => {

  return (
    <Container size="md" py="xl" >
    FORM!
    </Container>
  );
};

export default FormItem;




export  function StoreForm(props: ItemFormProps) {
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
        excludeFromSearch: true,
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
        metaTitle: (value: string | undefined) => ((value?.length || 0) < 3 ? 'Meta title must be at least 3 characters' : null),
        metaDescription: (value: string | undefined) => ((value?.length || 0) < 10 ? 'Meta description must be at least 10 characters' : null),
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

      if (onSubmit) onSubmit({
        ...values,
        id: response.data.documentId,
        SEO: {
          metaTitle: values.SEO?.metaTitle || '',
          metaDescription: values.SEO?.metaDescription || '',
        },
      } as Store);

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
