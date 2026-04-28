import TiendaDetailShell from '@/app/components/ui/tienda.detail.shell';
import { Paper, Stack, Text } from '@mantine/core';

type TiendaAlbumNewPageProps = {
  params: Promise<{ storeSlug: string }>;
};

export default async function TiendaAlbumNewPage({ params }: TiendaAlbumNewPageProps) {
  const { storeSlug } = await params;

  return (
    <TiendaDetailShell
      breadcrumbs={[
        { label: 'Tienda', href: '/tienda' },
        { label: storeSlug, href: `/tienda/${storeSlug}` },
        { label: 'Albums', href: `/tienda/${storeSlug}/albums` },
        { label: 'New Album' },
      ]}
      title="New Album"
      routePath={`/tienda/${storeSlug}/albums/new`}
    >
      <Stack gap="md">
        <Paper withBorder p="lg" radius="md">
          <Text c="dimmed" size="sm">
            Album creation coming soon. Create albums via the Strapi admin panel for now.
          </Text>
        </Paper>
      </Stack>
    </TiendaDetailShell>
  );
}
