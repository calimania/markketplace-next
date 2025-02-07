import { SimpleGrid } from '@mantine/core';
import { StoreCard } from './card';

interface StoreGridProps {
  stores: any[];
}

export function StoreGrid({ stores }: StoreGridProps) {
  return (
    <SimpleGrid
      cols={{ base: 1, sm: 2, md: 3 }}
      spacing="lg"
      verticalSpacing="xl"
    >
      {stores.map((store) => (
        <StoreCard key={store.id} store={store} key={store.id} />
      ))}
    </SimpleGrid>
  );
};

export default StoreGrid;
