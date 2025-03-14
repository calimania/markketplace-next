import { Collection } from '@/markket/collection.d';
import {
  SimpleGrid,
  Card,
  Image,
  Text,
  Group,
  Badge,
  Title,
  Container,
  Paper,
  Overlay,
  AspectRatio,
} from '@mantine/core';
import Link from 'next/link';
import { IconUsers } from '@tabler/icons-react';

interface CollectionCardProps {
  collection: Collection;
  store_slug: string;
}

interface CollectionListProps {
  collections: Collection[];
  store_slug: string;
}

function CollectionCard({ collection, store_slug }: CollectionCardProps) {
  return (
    <Link href={`/store/${store_slug}/${collection.slug}`} style={{ textDecoration: 'none' }}>
      <Card
        shadow="sm"
        padding="lg"
        radius="md"
        withBorder
        className="transform transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
      >
        <>
          <AspectRatio ratio={16 / 9} pos="relative">
            <Image
              src={collection.cover?.url || collection.SEO?.socialImage?.url}
              alt={collection.title}
              height={200}
            />
            <Overlay
              gradient="linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, .85) 90%)"
              opacity={0.5}
            />
          </AspectRatio>
        </>

        <Group justify="space-between" mt="md" mb="xs">
          <Title order={3} lineClamp={2}>
            {collection.title}
          </Title>
          <Badge
            leftSection={<IconUsers size={14} />}
            variant="light"
          >
            {collection.items.length} items
          </Badge>
        </Group>

        <Text size="sm" c="dimmed" lineClamp={2} mb="md">
          {collection.description}
        </Text>

        {collection.store && (
          <Group gap="xs">
            <Image
              src={collection.store.Favicon?.url || collection.store.Logo?.url}
              width={20}
              height={20}
              radius="xl"
              alt={collection.store.title}
            />
            <Text size="sm" c="dimmed">
              {collection.store.title}
            </Text>
          </Group>
        )}
      </Card>
    </Link>
  );
}

export default function CollectionList({ collections, store_slug }: CollectionListProps) {
  if (!collections?.length) {
    return (
      <></>
    );
  }

  return (
    <Container size="xl" py="xl">
      <SimpleGrid
        cols={{ base: 1, sm: 2, md: 3 }}
        spacing="xl"
        verticalSpacing="xl"
      >
        {collections.map((collection) => (
          <CollectionCard
            key={collection.id}
            store_slug={store_slug}
            collection={collection}
          />
        ))}
      </SimpleGrid>
    </Container>
  );
};
