import { SimpleGrid } from '@mantine/core';
import { StoreCard, type StoreCardProps } from './card';

interface StoreGridProps {
  stores: StoreCardProps["store"][];
}

export function StoreGrid({ stores }: StoreGridProps) {
  return (
    <SimpleGrid
      cols={{ base: 1, sm: 2, md: 3 }}
      spacing="lg"
      verticalSpacing="xl"
    >
      {stores.map((store) => (
        <StoreCard key={store.id} store={store} />
      ))}
    </SimpleGrid>
  );
};

export default StoreGrid;
