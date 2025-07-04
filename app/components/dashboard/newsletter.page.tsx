'use client';

import { useContext, useState } from 'react';
import { DashboardContext } from '@/app/providers/dashboard.provider';
import {
  Container,
  Title,
  Text,
  Paper,
  Group,
  Button,
  Stack,
  ThemeIcon,
  Tabs,
  Menu,
} from '@mantine/core';
import {
  IconMail,
  IconDownload,
  IconSettings,
  IconUsers,
  IconMailForward,
  IconMailbox,
  IconFileExport,
} from '@tabler/icons-react';
import { useCMSItems } from '@/app/hooks/dashboard.items.hook';
import { Subscriber } from '@/markket';

const NewsletterPage = () => {
  const { store } = useContext(DashboardContext);
  const { items: subscribers, loading } = useCMSItems<Subscriber>('subscribers', store);
  const [activeTab,] = useState<string>('subscribers');

  return (
    <Container size="lg" py="xl">
      <Stack gap="lg">
        {/* Header Section */}
        <Paper p="md" withBorder>
          <Group justify="space-between">
            <Group>
              <ThemeIcon size={44} radius="md" color="blue">
                <IconMail size={24} />
              </ThemeIcon>
              <div>
                <Title order={2} size="h3">Newsletter</Title>
                <Text size="sm" c="dimmed">
                  Manage your subscribers and email campaigns
                </Text>
              </div>
            </Group>
            <Group>
              <Button
                variant="light"
                disabled
                leftSection={<IconMailbox size={16} />}
                onClick={() => { }}
              >
                Sync with SendGrid
              </Button>
              <Menu position="bottom-end">
                <Menu.Target>
                  <Button leftSection={<IconDownload size={16} />} disabled>
                    Export List
                  </Button>
                </Menu.Target>
                <Menu.Dropdown>
                  <Menu.Item
                    disabled
                    leftSection={<IconFileExport size={14} />}
                    onClick={() => { }}
                  >
                    Export as CSV
                  </Menu.Item>
                  <Menu.Item
                    disabled
                    leftSection={<IconFileExport size={14} />}
                    onClick={() => { }}
                  >
                    Export as JSON
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
            </Group>
          </Group>
        </Paper>

        {/* Stats Overview */}
        <Group grow>
          <Paper p="md" withBorder>
            <Group>
              <ThemeIcon size="lg" color="blue" variant="light">
                <IconUsers size={20} />
              </ThemeIcon>
              <div>
                <Text size="xl" fw={500}>{subscribers.length}</Text>
                <Text size="sm" c="dimmed">Total Subscribers</Text>
              </div>
            </Group>
          </Paper>
          <Paper p="md" withBorder>
            <Group>
              <ThemeIcon size="lg" color="green" variant="light">
                <IconMailForward size={20} />
              </ThemeIcon>
              <div>
                <Text size="xl" fw={500} c="dimmed">N/A</Text>
                <Text size="sm" c="dimmed">Delivery Rate</Text>
              </div>
            </Group>
          </Paper>
        </Group>

        {/* Main Content */}
        <Paper withBorder>
          <Tabs value={activeTab} onChange={() => { }}>
            <Tabs.List>
              <Tabs.Tab value="subscribers" leftSection={<IconUsers size={14} />}>
                Subscribers
              </Tabs.Tab>
              <Tabs.Tab value="settings" leftSection={<IconSettings size={14} />}>
                <Text c="dimmed">
                  Settings
                </Text>
              </Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value="subscribers" p="md">
              <div className="overflow-x-auto">
                <table className="min-w-full border text-sm">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="p-2 border">Email</th>
                      <th className="p-2 border">Date Subscribed</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr><td colSpan={2} className="p-4 text-center">Loading...</td></tr>
                    ) : subscribers?.length ? subscribers.map((sub: any) => (
                      <tr key={sub.id} className="hover:bg-gray-50">
                        <td className="p-2 border">{sub.email || sub.Email || '—'}</td>
                        <td className="p-2 border">{sub.createdAt ? new Date(sub.createdAt).toLocaleString() : '—'}</td>
                      </tr>
                    )) : (
                      <tr><td colSpan={2} className="p-4 text-center">No subscribers found.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Tabs.Panel>

            <Tabs.Panel value="settings" p="md">
              <Stack>
                <Title order={3}>Newsletter Settings</Title>
                <Text c="dimmed">
                  Configure your newsletter preferences and integrations
                </Text>
                {/* Add settings form here */}
              </Stack>
            </Tabs.Panel>
          </Tabs>
        </Paper>
      </Stack>
    </Container >
  );
};

export default NewsletterPage;
