import { Container, Group, Paper, Stack, Title, Text, Button, Skeleton } from '@mantine/core';
import { IconArticle, IconPlus, IconSearch, IconMicroscope } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import ItemList from '@/app/components/dashboard/cms/list.component';
import { Store } from '@/markket';

import { ContentItem } from '@/app/hooks/common.d';

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

const CMSIndex = ({ singular = 'item', plural = 'items', items, loading, store, description }: CMSComponent) => {
  const router = useRouter();

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
      <Stack gap="lg">
        <Paper p="md" withBorder>
          <Group justify="space-between" wrap="nowrap">
            <Group gap="md">
              <Icon size={24} style={{ color: 'var(--mantine-color-blue-6)' }} />
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
                disabled={plural !== 'stores'}
                leftSection={<IconPlus size={16} />}
              >
                New {singular}
              </Button>
            </Group>
          </Group>
        </Paper>

        {loading ? (
          <Stack gap="md">
            <Skeleton height={50} radius="md" />
            <Skeleton height={50} radius="md" />
            <Skeleton height={50} radius="md" />
          </Stack>
        ) : (
            <ItemList items={items}
              plural={plural}
              singular={singular}
              actions={{
                onView: (item) => {
                  router.push(`/dashboard/${plural}/view/${item.documentId}?store=${store.documentId}`);
                },
                onEdit: (item) => {
                  router.push(`/dashboard/${plural}/edit/${item.documentId}?store=${store.documentId}`);
                },
                onDelete: async (item) => {
                  console.log('Deleting article:', item.documentId);
                },
                onPublish: async (item) => {
                  console.log('Publishing article:', item.documentId);
                },
                onUnpublish: async (item) => {
                  console.log('Unpublishing article:', item.documentId);
                },
              }}
            />
        )}
      </Stack>
    </Container>
  )
};

export default CMSIndex;
