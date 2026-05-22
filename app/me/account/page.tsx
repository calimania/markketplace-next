'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Container, Group, Title, Text, Paper, Tabs, Stack, Button } from '@mantine/core';
import { IconArrowLeft, IconUserCircle, IconKey } from '@tabler/icons-react';
import { useAuth } from '@/app/providers/auth.provider';
import ProfileForm from '@/app/components/ui/profile.form';
import SecuritySettings from '@/app/components/dashboard/settings.security';

export default function MeAccountPage() {
  const router = useRouter();
  const { confirmed, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    if (isLoading) return;
    if (!confirmed()) {
      router.replace('/auth/magic?next=/me/account');
    }
  }, [confirmed, isLoading, router]);

  if (isLoading) {
    return (
      <Container size="md" py="xl" className="tech-vhs-surface">
        <Text c="dimmed">Just a moment…</Text>
      </Container>
    );
  }

  if (!confirmed()) {
    return null;
  }

  return (
    <Container size="md" py="xl" className="tech-vhs-surface">
      <Group justify="space-between" mb="lg">
        <Stack gap={2}>
          <Title order={1}>My Settings</Title>
          <Text c="dimmed">Manage your identity and login security from one screen.</Text>
        </Stack>
        <Button variant="default" component={Link} href="/me" leftSection={<IconArrowLeft size={16} />}>
          Back to dashboard
        </Button>
      </Group>

      <Paper withBorder radius="md">
        <Tabs value={activeTab} onChange={(value) => setActiveTab(value || 'profile')}>
          <Tabs.List>
            <Tabs.Tab value="profile" leftSection={<IconUserCircle size={16} />}>
              Identity
            </Tabs.Tab>
            <Tabs.Tab value="security" leftSection={<IconKey size={16} />}>
              Security
            </Tabs.Tab>
          </Tabs.List>

          <Paper p="md">
            <Tabs.Panel value="profile">
              <ProfileForm />
            </Tabs.Panel>
            <Tabs.Panel value="security">
              <SecuritySettings />
            </Tabs.Panel>
          </Paper>
        </Tabs>
      </Paper>
    </Container>
  );
}
