'use client';

import { useAuth } from '@/app/providers/auth.provider';
import { useEffect, useState } from 'react';
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
  IconKey
} from '@tabler/icons-react';
import { showNotification } from '@mantine/notifications';

import ProfileForm from '@/app/components/ui/profile.form';
import StoreList from '@/app/components/ui/store.list';
import SecuritySettings from './settings.security';
import { useRouter } from 'next/navigation';


const settingsTabs = [
  {
    value: 'profile',
    label: 'Profile',
    icon: IconUserCircle,
    description: 'Manage your personal information'
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
export default function SettingsPage() {
  const { user, stores, fetchStores } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const router = useRouter();

  // Handle hash-based navigation
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
                <StoreList stores={stores} onCreate={(store) => {
                  showNotification({
                    title: 'Store Created',
                    message: `Store ${store?.title} created successfully, redirecting...`,
                    color: 'green',
                  });

                  fetchStores();
                  if (store?.id) {
                    router.push(`/dashboard/store/?store=${store.id}`);
                  }
                }} />
              </Stack>
            </Tabs.Panel>

            <Tabs.Panel value="notifications">
              <Stack>
                <Title order={4}>Notification Preferences</Title>
                <Text size="sm" c="dimmed" maw={600}>
                  Choose how you want to be notified about activity.
                </Text>
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
