import { Button, Group } from '@mantine/core';
import { IconNews, IconShoppingBag, IconFiles, IconOctahedronPlus } from '@tabler/icons-react';
import { Store } from '@/markket/store.d';

type StoreHeaderButtonsProps = {
  store: Store;
};

const StoreHeaderButtons = ({ store }: StoreHeaderButtonsProps) => {
  return (
    <Group justify="center" gap="md" className='py-12'>
      <Button
        component="a"
        href={`/store/${store.slug}`}
        variant="light"
        leftSection={<IconOctahedronPlus size={20} />}
      >
        Home
      </Button>
      <Button
        component="a"
        href={`/store/${store.slug}/blog`}
        variant="light"
        leftSection={<IconNews size={20} />}
      >
        Blog
      </Button>
      <Button
        component="a"
        href={`/store/${store.slug}/products`}
        variant="light"
        leftSection={<IconShoppingBag size={20} />}
      >
        Products
      </Button>
      <Button
        component="a"
        href={`/store/${store.slug}/about`}
        variant="light"
        leftSection={<IconFiles size={20} />}
      >
        About
      </Button>
    </Group>
  );
};

export default StoreHeaderButtons;
