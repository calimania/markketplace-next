'use client';

import DashboardCMS from '@/app/components/dashboard/cms';
import { Event } from '@/markket/';
import { useContext } from 'react';
import { DashboardContext } from '@/app/providers/dashboard.provider';
import { useCMSItems } from '@/app/hooks/dashboard.items.hook';

const EventsPage = () => {
  const { store } = useContext(DashboardContext);
  const { items: events, loading, } = useCMSItems<Event>('events', store);

  return (
    <DashboardCMS
      singular="event"
      plural="events"
      items={events}
      loading={loading}
      store={store}
      description="Special occasions & activities that you can create to engage with your audience"
    ></DashboardCMS>
  );
};

export default EventsPage;
