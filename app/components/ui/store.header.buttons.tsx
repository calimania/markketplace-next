import { Button, Group } from '@mantine/core';
import { IconNews, IconShoppingBag, IconFiles, IconOctahedronPlus, IconCalendar } from '@tabler/icons-react';
import { Store } from '@/markket/store.d';
import { StoreVisibility } from '@/markket/store.visibility.d';
import './store-header-buttons.css';

type StoreHeaderButtonsProps = {
  store: Store;
  visibility?: StoreVisibility | null;
};

const StoreHeaderButtons = ({ store, visibility }: StoreHeaderButtonsProps) => {
  const buttons = [
    {
      href: `/${store.slug}`,
      icon: <IconOctahedronPlus size={20} />,
      label: 'Home',
      show: true,
    },
    {
      href: `/${store.slug}/blog`,
      icon: <IconNews size={20} />,
      label: 'Blog',
      show: visibility ? visibility.show_blog : true,
    },
    {
      href: `/${store.slug}/products`,
      icon: <IconShoppingBag size={20} />,
      label: 'Shop',
      show: visibility ? visibility.show_shop : true,
    },
    {
      href: `/${store.slug}/events`,
      icon: <IconCalendar size={20} />,
      label: 'Events',
      show: visibility ? visibility.show_events : true,
    },
    {
      href: `/${store.slug}/about`,
      icon: <IconFiles size={20} />,
      label: 'About',
      show: visibility ? visibility.show_about : true,
    },
  ].filter(btn => btn.show);

  return (
    <Group justify="center" gap="md" className='py-12 StoreHeaderButtons'>
      {buttons.map((btn) => (
        <Button
          key={btn.href}
          component="a"
          href={btn.href}
          variant="light"
          leftSection={btn.icon}
          className="store-header-btn"
        >
          {btn.label}
        </Button>
      ))}
    </Group>
  );
};

export default StoreHeaderButtons;
