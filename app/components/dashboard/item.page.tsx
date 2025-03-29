'use client';

import { useContext, ElementType } from "react";
import { DashboardContext } from "@/app/providers/dashboard.provider";
import { useCMSItem, type ContentType } from "@/app/hooks/dashboard.item.hook";
import { Article, Page, Product } from '@/markket';
import ViewArticle from '@/app/components/dashboard/actions/article.view';
import { Container, Stack, Skeleton, Paper, Text, Button, Group } from '@mantine/core';
import { IconArrowLeft } from "@tabler/icons-react";
import { useRouter } from "next/navigation";

type ContentItem = Article | Page | Product;

interface ActionComponent {
  view: ElementType;
  edit: ElementType;
  url: string;
  singular: string;
  plural: string;
}

const actionsMap: Record<string, ActionComponent> = {
  articles: {
    url: `populate[]=SEO&populate[]=SEO.socialImage`,
    view: ViewArticle,
    edit: (item: Article) => <> edit {item.documentId}  </>,
    singular: 'article',
    plural: 'articles',
  },
  pages: {
    url: `populate[]=SEO&populate[]=SEO.socialImage&populate[]=albums`,
    view: (item: Page) => <> view {item.documentId}  </>,
    edit: (item: Page) => <> edit {item.documentId}  </>,
    singular: 'page',
    plural: 'pages',
  },
}

interface DashboardItemPageProps {
  id: string;
  action: 'view' | 'edit';
  slug: ContentType;
}
/**
 * The dashboard item to view, edit and interact with a specific item
 *
 * @param { params: { id: string, action: string } }
 * @returns
 */
const DashboardItemPage = ({ id, action, slug }: DashboardItemPageProps) => {
  const { store } = useContext(DashboardContext);
  const router = useRouter();

  const options = actionsMap[slug as keyof typeof actionsMap];

  const { item, loading, error } = useCMSItem<ContentItem>(slug as ContentType, id, {
    append: options.url,
  });

  const Component = options[action] as ElementType<{ item: ContentItem }>;

  if (loading) {
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
    <Container size="lg" py="xl">
      <Paper withBorder p="md" mb="xl">
        <Stack>
          <Text size="lg" fw={500}>
            {store.title}
          </Text>
          <Text c="dimmed">{item?.documentId}</Text>
        </Stack>
      </Paper>
      <Stack gap="xl">
        <Group justify="space-between">
          <Button
            variant="light"
            leftSection={<IconArrowLeft size={16} />}
            onClick={() => router.push(`/dashboard/${slug}`)}
          >
            Back to {options.plural}
          </Button>
        </Group>
        <Component item={item} />
      </Stack>
    </Container>
  );
}

export default DashboardItemPage;
