'use client';

import { useAuth } from '@/app/providers/auth.provider';
import { useEffect, useState, ReactElement } from 'react';
import {
  Container,
  Paper,
  Text,
  Group,
  Avatar,
  Title,
  Stack,
  Badge,
  Tabs,
  LoadingOverlay,
} from '@mantine/core';
import {
  IconUserCircle,
  IconBell,
  IconKey,
  IconWorldHeart,
} from '@tabler/icons-react';
// import { showNotification } from '@mantine/notifications';

import ProfileForm from '@/app/components/ui/profile.form';
import StoreSettingsList from '@/app/components/dashboard/settings/store.list';
import SecuritySettings from './settings.security';
import NotificationsSettingsTab from './notifications.settings';


const settingsTabs = [
  {
    value: 'profile',
    label: 'Profile',
    icon: IconUserCircle,
    description: 'Manage your personal information'
  },
  {
    value: 'store',
    label: 'Stores',
    icon: IconWorldHeart,
    description: 'Store settings & access'
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

/**
 * Dashboard/settings page
 * @returns {JSX.Element}
 */
export default function SettingsPage(): ReactElement {
  const { user, stores, } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    const hash = window.location.hash.replace('#', '');
    if (hash && settingsTabs.some(tab => tab.value === hash)) {
      setActiveTab(hash);
    }
  }, []);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    window.location.hash = value;
  };


  return (
    <Container size="md" py="xl">
      <Paper withBorder p="xl" radius="md" mb="xl">
        {!user && <LoadingOverlay visible />}
        <Group justify="space-between" align="flex-start">
          <Group>
            <Avatar
              src={user?.avatar?.url}
              size="xl"
              radius="md"
              color="blue"
            >
              {user?.username?.charAt(0).toUpperCase()}
            </Avatar>

            <Stack gap="xs">
              <div>
                <Title order={3}>{user?.displayName || user?.username}</Title>
                <Text size="sm" c="dimmed">{user?.email}</Text>
              </div>
              <Group gap="xs">
                <Badge variant="light" color="blue">
                  Store Owner
                </Badge>
                <Text size="sm" c="dimmed">·</Text>
                <Text size="sm" c="dimmed">
                  Member since {new Date(user?.createdAt as string).getFullYear()}
                </Text>
              </Group>
            </Stack>
          </Group>
        </Group>
      </Paper>

      {/* Settings Tabs */}
      <Paper withBorder radius="md">
        <Tabs value={activeTab} onChange={(value) => handleTabChange(value as string)} variant="outline">
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

          <Paper p="md">
            <Tabs.Panel value="profile">
              <Stack>
                <Title order={4}>Profile Information</Title>
                <ProfileForm />
              </Stack>
            </Tabs.Panel>

            <Tabs.Panel value="store">
              <Stack>
                <Title order={4}>Store Settings</Title>
                <StoreSettingsList stores={stores} />
              </Stack>
            </Tabs.Panel>

            <Tabs.Panel value="notifications">
              <Stack>
                <NotificationsSettingsTab />
              </Stack>
            </Tabs.Panel>

            <Tabs.Panel value="security">
              <Stack>
                <Title order={4}>Security Settings</Title>
                <SecuritySettings />
              </Stack>
            </Tabs.Panel>
          </Paper>
        </Tabs>
      </Paper>
    </Container>
  );
}
