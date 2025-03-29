'use client';

import { useContext, ElementType } from "react";
import { DashboardContext } from "@/app/providers/dashboard.provider";
import { useCMSItem, type ContentType } from "@/app/hooks/dashboard.item.hook";
import { Article } from '@/markket';
import ViewArticle from '@/app/components/dashboard/actions/article.view';
import { Container, Stack, Skeleton } from '@mantine/core';

const actionsMap = {
  articles: {
    url: `?populate[]=SEO&populate[]=SEO.socialImage`,
    view: ViewArticle,
    edit: <>Edit</>,
    singular: 'article',
    plural: 'articles',
  }
}

/**
 * The dashboard item to view, edit and interact with a specific item
 *
 * @param { params: { id: string, action: string } }
 * @returns
 */
const DashboardItemPage =  ({id, action, slug }: { id: string, action : string, slug: string }) => {
  const { store } = useContext(DashboardContext);

  const options = actionsMap[slug as keyof typeof actionsMap];

  const { item, loading, error } = useCMSItem<Article>(slug as ContentType, id, {
    append: options.url,
  });

  const Component = options[action as keyof typeof options] as ElementType;

  if (loading) {
    return (
      <Container size="lg" py="xl">
        <Stack gap="md">
          <Skeleton height={50} radius="md" />
          <Skeleton height={50} radius="md" />
          <Skeleton height={50} radius="md" />
          <Skeleton height={50} radius="md" />
        </Stack>
      </Container>
    )
  }

  if (error || !store) {
    return (
      <Container size="lg" py="xl">
        <Stack gap="md">
          <h1 className="text-2xl font-bold">Error</h1>
          <p>{error?.message}</p>
        </Stack>
      </Container>
    )
  }


  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">{store.title}</h1>
      <p>{store.Description}</p>
      <div className="flex gap-4">
        {(Component && item) && (<Component item={item} />)}
      </div>
    </div>
  );
}

export default DashboardItemPage;
