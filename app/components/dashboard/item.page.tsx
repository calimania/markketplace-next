'use client';

import { useContext, ElementType } from "react";
import { DashboardContext } from "@/app/providers/dashboard.provider";
import { useCMSItem, type ContentType } from "@/app/hooks/dashboard.item.hook";
import { Article, Page, Product, Store } from '@/markket';

import { Container, Stack, Skeleton, Paper, Text, Button, Group } from '@mantine/core';
import { IconArrowLeft, IconEdit, } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { actionsMap } from './actions/actions.config';

type ContentItem = Article | Page | Product | Store;


interface DashboardItemPageProps {
  id: string;
  action: 'view' | 'edit' | 'new';
  slug: ContentType;
}

/**
 * The dashboard item to view, edit and interact with a specific item
 *
 * @param { params: { id: string, action: string } }
 * @returns
 */
const DashboardItemPage = ({ id, action, slug, }: DashboardItemPageProps) => {
  const { store } = useContext(DashboardContext);
  const router = useRouter();

  const options = actionsMap[slug as keyof typeof actionsMap];

  const Component = options[action] as ElementType;

  const { item, loading, error, refresh } = useCMSItem<ContentItem>(slug as ContentType, id, {
    append: options?.url || '',
  });


  if (loading && action !== 'new') {
    return (
      <Container size="lg" py="xl">
        <Stack gap="md">
          <Skeleton height={50} radius="md" />
          <Skeleton height={200} radius="md" />
          <Skeleton height={150} radius="md" />
        </Stack>
      </Container>
    );
  }

  if (error || !item) {
    return (
      <Container size="lg" py="xl">
        <Paper p="xl" withBorder>
          <Stack gap="md">
            <Text size="lg" fw={500} c="red">
              Error Loading {options.singular}
            </Text>
            <Text c="dimmed">
              {error?.message || `Unable to load ${options.singular}`}
            </Text>
            <Button
              variant="light"
              leftSection={<IconArrowLeft size={16} />}
              onClick={() => router.back()}
            >
              Go Back
            </Button>
          </Stack>
        </Paper>
      </Container>
    );
  }

  return (
    <Container size="lg" py="xl" mx={0} px={0}>
      <Stack gap="sm">
        <Group justify="space-between">
          <Button
            variant="light"
            leftSection={<IconArrowLeft size={16} />}
            onClick={() => router.push(`/dashboard/${slug}?store=${store.documentId}`)}
          >
            Back to {options.plural}
          </Button>
          <Button
            disabled={['edit', 'new'].includes(action)}
            variant="light"
            leftSection={<IconEdit size={16} />}
            onClick={() => router.push(`/dashboard/${slug}/edit/${item.documentId}?store=${store.documentId}`)}
          >
            Edit {options.singular}
          </Button>
        </Group>
        <Component
          item={item}
          className="ViewItem | FormItem"
          store={store}
          id={item?.id}
          documentId={item?.documentId}
          singular={options.singular}
          plural={options.plural}
          create={options.create}
          action={action}
          update={options.update}
          refresh={refresh}
          form={{ config: options.form, sections: options.form_sections }}
          description={options.form?.description}
          imageManager={['page', 'article', 'product'].includes(options.singular)}
        />
      </Stack>
      {(action !== 'new' && options.singular !== 'store') && (
        <Paper withBorder p="md" mb="xl">
          <Stack>
            <Text size="lg" fw={500}>
              {store?.title}
            </Text>
            <Text c="dimmed">
              <strong>{options.singular} </strong>
              {item?.documentId}</Text>
          </Stack>
        </Paper>
      )}
    </Container>
  );
}

export default DashboardItemPage;
