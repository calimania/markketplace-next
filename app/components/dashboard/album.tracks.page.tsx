'use client';

import DashboardCMS from '@/app/components/dashboard/cms';
import { AlbumTrack,  } from '@/markket/';
import { useContext } from 'react';
import { DashboardContext } from '@/app/providers/dashboard.provider';
import { useCMSItems } from '@/app/hooks/dashboard.items.hook';

const TracksPage = () => {
  const { store } = useContext(DashboardContext);
  const { items: tracks, loading, } = useCMSItems<AlbumTrack>('tracks', store);

  return (
    <DashboardCMS
      singular="track"
      plural="tracks"
      items={tracks}
      loading={loading}
      store={store}
      description="Tracks are the individual items in an album. They have their own pages, and can be featured in multiple albums."
    ></DashboardCMS>
  );
};

export default TracksPage;
