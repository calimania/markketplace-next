import { Card, Image, Text, Badge, Button, Group } from '@mantine/core';
import { IconBuilding, IconCannabisFilled } from '@tabler/icons-react';
import Link from 'next/link';
import { Store } from "@/markket/store.d";
import "../docs/card.css";

export interface StoreCardProps {
  store: Store;
  idx: number;
}

export function StoreCard({ store, idx }: StoreCardProps) {
  const index = (idx > 9) ? Math.floor(idx) % 10 : idx;
  const logoUrl = store.Logo?.url || `https://placecats.com/60${index}/40${index}`;

  return (
    <Card
      shadow="sm"
      padding="lg"
      radius="md"
      withBorder
      className="transform transition-all duration-300 hover:scale-105 justify-between"
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
          `/${store.slug}`}
        color="blue"
        fullWidth
        mt="md"
        radius="md"
        rightSection={<IconCannabisFilled size={14} />}
      >
      </Button>
    </Card>
  );
};
