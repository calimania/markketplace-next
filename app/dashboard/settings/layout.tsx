'use client';

import { Tabs } from '@mantine/core';
import {
  IconUserCircle,
  IconBuildingStore,
  IconBell,
  IconKey
} from '@tabler/icons-react';
import { usePathname, useRouter } from 'next/navigation';

const settingsTabs = [
  {
    value: 'profile',
    label: 'Profile',
    icon: IconUserCircle,
    description: 'Manage your personal information'
  },
  {
    value: 'store',
    label: 'Store Settings',
    icon: IconBuildingStore,
    description: 'Configure your store preferences'
  },
  {
    value: 'notifications',
    label: 'Notifications',
    icon: IconBell,
    description: 'Control your notification settings'
  },
  {
    value: 'security',
    label: 'Security',
    icon: IconKey,
    description: 'Manage your account security'
  },
];

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const activeTab = pathname.split('/').pop() || 'profile';

  return (
    <div className="p-4">
      <Tabs
        value={activeTab}
        onChange={(value) => router.push(`/dashboard/settings/${value}`)}
        defaultValue={activeTab}
        variant="outline"
      >
        <Tabs.List>
          {settingsTabs.map((tab) => (
            <Tabs.Tab
              key={tab.value}
              value={tab.value}
              leftSection={<tab.icon size="0.8rem" />}
            >
              {tab.label}
            </Tabs.Tab>
          ))}
        </Tabs.List>

        <div className="mt-6">
          {children}
        </div>
      </Tabs>
    </div>
  );
};
