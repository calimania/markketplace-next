'use client';

import { useState } from 'react';
import { Tabs } from '@mantine/core';
import { IconCalendar, IconUsers } from '@tabler/icons-react';
import EventRsvpsTab from './event.rsvps.tab';

type EventDetailTabsProps = {
  storeRef: string;
  eventDocumentId: string;
  eventNumericId?: number;
  children: React.ReactNode;
};

export default function EventDetailTabs({ storeRef, eventDocumentId, eventNumericId, children }: EventDetailTabsProps) {
  const [activeTab, setActiveTab] = useState<string | null>('details');

  return (
    <Tabs value={activeTab} onChange={setActiveTab} variant="outline" keepMounted>
      <Tabs.List mb="md">
        <Tabs.Tab value="details" leftSection={<IconCalendar size={14} />}>
          Details
        </Tabs.Tab>
        <Tabs.Tab value="rsvps" leftSection={<IconUsers size={14} />}>
          RSVPs
        </Tabs.Tab>
      </Tabs.List>

      <Tabs.Panel value="details">
        {children}
      </Tabs.Panel>

      <Tabs.Panel value="rsvps" pt="md">
        <EventRsvpsTab
          storeRef={storeRef}
          eventDocumentId={eventDocumentId}
          eventNumericId={eventNumericId}
        />
      </Tabs.Panel>
    </Tabs>
  );
}
