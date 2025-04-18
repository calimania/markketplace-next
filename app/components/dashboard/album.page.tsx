'use client';

import DashboardCMS from '@/app/components/dashboard/cms';
import { Album,  } from '@/markket/';
import { useContext } from 'react';
import { DashboardContext } from '@/app/providers/dashboard.provider';
import { useCMSItems } from '@/app/hooks/dashboard.items.hook';

const AlbumsPage = () => {
  const { store } = useContext(DashboardContext);
  const { items: albums, loading, } = useCMSItems<Album>('albums', store);

  return (
    <DashboardCMS
      singular="album"
      plural="albums"
      items={albums}
      loading={loading}
      store={store}
      description="Collections for featured releases and seasonal content"
    ></DashboardCMS>
  );
};

export default AlbumsPage;
