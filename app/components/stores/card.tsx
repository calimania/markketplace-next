import { Card, Image, Text, Badge, Button, Group } from '@mantine/core';
import { IconBuilding, IconArrowRight } from '@tabler/icons-react';
import Link from 'next/link';
import { Store } from "@/markket/store.d";

export interface StoreCardProps {
  store: Store;
}

export function StoreCard({ store }: StoreCardProps) {
  const logoUrl = store.Logo?.url || 'https://placehold.co/800x400';

  return (
    <Card
      shadow="sm"
      padding="lg"
      radius="md"
      withBorder
      className="transform transition-all duration-300 hover:scale-105"
    >
      <Image
        src={logoUrl}
        height={160}
        alt={store.title}
      />

      <Group justify="space-between" mt="md" mb="xs">
        <Text fw={500} size="lg">{store.title}</Text>
        <Badge color="blue" variant="light">
          <IconBuilding size={14} className="mr-1" />
          Store
        </Badge>
      </Group>

      <Text size="sm" c="dimmed" lineClamp={2}>
        {store.Description || store.SEO?.metaDescription}
      </Text>

      <Button
        component={Link}
        href={
          `store/${store.slug}`}
        color="blue"
        fullWidth
        mt="md"
        radius="md"
        rightSection={<IconArrowRight size={14} />}
      >
        {'View Store'}
      </Button>
    </Card>
  );
};
