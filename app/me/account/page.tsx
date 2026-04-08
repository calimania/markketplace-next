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
  const { confirmed } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    if (!confirmed()) {
      router.replace('/auth');
    }
  }, [confirmed, router]);

  return (
    <Container size="md" py="xl">
      <Group justify="space-between" mb="lg">
        <Stack gap={2}>
          <Title order={1}>Account</Title>
          <Text c="dimmed">Profile and security settings in one place.</Text>
        </Stack>
        <Button variant="default" component={Link} href="/me" leftSection={<IconArrowLeft size={16} />}>
          Back to Me
        </Button>
      </Group>

      <Paper withBorder radius="md">
        <Tabs value={activeTab} onChange={(value) => setActiveTab(value || 'profile')}>
          <Tabs.List>
            <Tabs.Tab value="profile" leftSection={<IconUserCircle size={16} />}>
              Profile
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
