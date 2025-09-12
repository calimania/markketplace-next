import { Container, Group, Paper, Stack, Title, Text, Button, Skeleton, Modal } from '@mantine/core';
import { IconArticle, IconPlus, IconSearch, IconMicroscope } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import ItemList from '@/app/components/dashboard/cms/list.component';
import { Store } from '@/markket';

import { ContentItem } from '@/app/hooks/common.d';
import { markketplace } from '@/markket/config';
import { useState } from 'react';
import { notifications } from '@mantine/notifications';

type CMSComponent = {
  singular: string;
  plural: string;
  items: ContentItem[];
  loading: boolean;
  store: Store;
  description?: string;
};

const Icons: Record<string, any> = {
  article: IconArticle,
  page: IconMicroscope,
};

// @TODO: Adds more complex logic that considers subscription for additional services
// @TODO: The CMS needs to display more items to support stores with additional content
// @TODO: Allow to DELETE and recycle content easier
const canAddMore = (singular: string, length: number) => {
  const l = length || 1;

  switch (singular) {
    case 'store':
      return l <= markketplace.max_stores_per_user;
    case 'article':
      return l <= markketplace.max_articles_per_store;
    case 'page':
      return l <= markketplace.max_pages_per_store;
    case 'album':
      return l <= markketplace.max_albums_per_store;
    case 'product':
      return l <= markketplace.max_products_per_store;
    case 'event':
      return l <= markketplace.max_events_per_store;
    default:
      return l <= 20;
  }
}

/**
 * Displays CMS Dashboard pages - depending on the action by {path}
 *
 * @param props
 * @returns
 */
const CMSIndex = ({ singular = 'item', plural = 'items', items, loading, store, description }: CMSComponent) => {
  const router = useRouter();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<ContentItem | null>(null);

  const Icon = Icons[singular as string] || IconArticle;

  if (loading || !store) {
    return (
      <Container size="lg" py="xl">
        <Stack gap="md">
          <Skeleton height={50} radius="md" />
          <Skeleton height={50} radius="md" />
          <Skeleton height={50} radius="md" />
          <Skeleton height={50} radius="md" />
        </Stack>
      </Container>
    );
  }

  return (
    <Container size="lg" py="xl">
      <Modal
        opened={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title={<span className="font-black text-fuchsia-700 flex items-center gap-2">🗑️ Delete {singular.charAt(0).toUpperCase() + singular.slice(1)}?</span>}
        centered
        radius="xl"
        classNames={{ content: 'border-4 border-fuchsia-200 bg-gradient-to-br from-fuchsia-50 to-sky-50 shadow-xl', title: 'font-bold' }}
      >
        <Stack gap="md">
          <Text className="text-sky-800 text-lg font-semibold">
            Are you sure you want to delete <b>{itemToDelete?.title || singular}</b>? This action cannot be undone.
          </Text>
          <Group justify="flex-end">
            <Button variant="light" color="gray" onClick={() => setDeleteModalOpen(false)} className="border-2 border-black">Cancel</Button>
            <Button
              color="red"
              className="border-2 border-black font-bold bg-red-100 hover:bg-fuchsia-200 hover:text-fuchsia-900 transition-all shadow-md"
              onClick={async () => {
                setDeleteModalOpen(false);
                notifications.show({
                  title: 'Coming soon!',
                  message: 'Delete functionality will be available soon.',
                  color: 'yellow',
                  icon: '🦄',
                });
                // TODO: Call API to delete item, then refresh list or show success notification
              }}
            >
              Yes, Delete
            </Button>
          </Group>
        </Stack>
      </Modal>
      <Stack gap="lg">
        <Paper p="md" withBorder>
          <Group justify="space-between" wrap="nowrap">
            <Group gap="md">
              <Icon size={27} style={{ color: 'var(--mantine-color-blue-6)' }} />
              <strong className=''>[ {items?.length} ]</strong>
              <div>
                <Title order={2} size="h3">
                  {plural.charAt(0).toUpperCase() + plural.slice(1)}
                </Title>
                {description ? (
                  <Text size="sm" c="dimmed">
                    {description}
                  </Text>
                ) : (
                    <Text size="sm" c="dimmed">
                      Manage {plural} for {store.title}
                    </Text>
                )}
              </div>
            </Group>
            <Group gap="sm">
              <Button
                variant="light"
                leftSection={<IconSearch size={16} />}
                disabled={!items.length}
              >
                Search
              </Button>
              <Button
                onClick={() => router.push(`/dashboard/${plural}/new?store=${store.documentId}`)}
                className='add-content-type new-item'
                disabled={
                  !['stores', 'pages', 'articles', 'events', 'products', 'albums', 'tracks'].includes(plural)
                  || !!!canAddMore(singular, items.length)
                }
                leftSection={<IconPlus size={16} />}
              >
                New {singular}
              </Button>
            </Group>
          </Group>
        </Paper>
        <ItemList items={items}
          plural={plural}
          singular={singular}
          actions={{
            onView: (item) => {
              if (plural == 'stores') {
                return router.push(`/dashboard/${singular}?store=${item.documentId}`);
              }
              router.push(`/dashboard/${plural}/view/${item.documentId}?store=${store.documentId}`);
            },
            onEdit: (item) => {
              router.push(`/dashboard/${plural}/edit/${item.documentId}?store=${store.documentId}`);
            },
            onDelete: async (item) => {
              setItemToDelete(item);
              setDeleteModalOpen(true);
            },
            // onPublish: async (item) => {
            //   console.log('Publishing article:', item.documentId);
            // },
            // onUnpublish: async (item) => {
            //   console.log('Unpublishing article:', item.documentId);
            // },
          }}
        />
      </Stack>
    </Container>
  )
};

export default CMSIndex;
