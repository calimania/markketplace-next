import { notFound } from 'next/navigation';
import { Container, Paper, Stack, Title, Text, Group, Button, Badge } from '@mantine/core';
import { IconPalette, IconEdit } from '@tabler/icons-react';
import { strapiClient } from '@/markket/api.strapi';
import Markdown from '@/app/components/ui/page.markdown';
import type { Store } from '@/markket/store';

type TiendaStorePageProps = {
  params: Promise<{ storeSlug: string }>;
};

export default async function TiendaStorePage({ params }: TiendaStorePageProps) {
  const { storeSlug } = await params;
  const storeResponse = await strapiClient.getStore(storeSlug);
  const store = storeResponse?.data?.[0] as Store | undefined;

  if (!store) {
    notFound();
  }

  const title = store.title || store.slug;
  const description = store.Description || store?.SEO?.metaDescription || '';

  return (
    <Container size="md" py="xl">
      <Stack gap="md">
        <Group justify="space-between" align="flex-start">
          <div>
            <Title order={1}>{title}</Title>
            <Text c="dimmed" mt={4}>/tienda/{store.slug}</Text>
          </div>
          <Badge variant="light">Read only</Badge>
        </Group>

        <Paper withBorder radius="md" p="lg">
          <Stack gap="sm">
            <Text fw={600}>Store Description</Text>
            {description ? (
              <Markdown content={description} />
            ) : (
              <Text c="dimmed">No description yet for this store.</Text>
            )}
          </Stack>
        </Paper>

        <Group>
          <Button
            component="a"
            href={`/tienda/${store.slug}/design-system`}
            leftSection={<IconPalette size={16} />}
          >
            Open Design System
          </Button>
          <Button
            component="a"
            variant="default"
            href={`/tienda/${store.slug}/store`}
            leftSection={<IconEdit size={16} />}
          >
            Open Store Editor
          </Button>
        </Group>
      </Stack>
    </Container>
  );
}
