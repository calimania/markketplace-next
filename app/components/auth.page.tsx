'use client';

import { Anchor, Button, Divider, Stack, Text, Title } from '@mantine/core';
import { IconDashboard, IconGhost2, IconHomeHeart, IconLogin, IconLogout, IconWand } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/providers/auth.provider';
import { strapiClient } from '@/markket/api.strapi';
import { useEffect, useState } from 'react';
import { Store } from '@/markket/store';
import { markketplace } from '@/markket/config';
import { Page } from '@/markket/page';

export default function AuthPage() {
  const router = useRouter();
  const { logout } = useAuth();
  const [store, setStore] = useState({} as Store);
  const { maybe } = useAuth();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [page, setPage] = useState({} as Page);

  useEffect(() => {
    const fetchData = async () => {
      const { data: [_store] } = await strapiClient.getStore();
      setStore(_store as Store);
      const { data } = await strapiClient.getPage('auth', markketplace.slug);
      setPage(data[0] as Page);
    };

    setIsLoggedIn(maybe());
    fetchData();
  }, [maybe]);

  const storeName = store?.title || 'Markketplace'
  const title = page?.Title || page?.SEO?.metaTitle || storeName;

  return (
    <Stack gap="md" w="100%" maw={420}>
      <Stack gap={8} ta="left">
        <IconGhost2 size={48} style={{ color: '#E4007C' }} />
        <Text size="sm" c="dimmed" tt="uppercase" fw={600} style={{ letterSpacing: '0.1em' }}>
          401 – Unauthorized
        </Text>
        <Title order={2} fw={700} size="h2">
          {title}
        </Title>
        <Text c="dimmed" size="md">
          {isLoggedIn ? "You're in. Now what?" : 'Did you try turning your login off and on again?'}
        </Text>
      </Stack>

      {isLoggedIn ? (
        <Stack gap="sm">
          <Button
            size="md"
            fullWidth
            leftSection={<IconDashboard size={18} />}
            onClick={() => router.push('/me')}
            color="cyan"
          >
            Let's go
          </Button>
          <Button
            size="md"
            fullWidth
            variant="light"
            leftSection={<IconHomeHeart size={18} />}
            onClick={() => router.push('/')}
            color="pink"
          >
            Back to Homepage
          </Button>
          <Divider my={4} />
          <Button
            size="sm"
            fullWidth
            variant="subtle"
            leftSection={<IconLogout size={16} />}
            onClick={() => logout()}
            color="gray"
          >
            Sign out
          </Button>
        </Stack>
      ) : (
        <Stack gap="sm">
          <Button
              size="md"
              fullWidth
              leftSection={<IconWand size={18} />}
              onClick={() => router.push('/auth/magic')}
              style={{ background: '#E4007C' }}
            >
              Send Magic Link
            </Button>
          <Button
            size="md"
            fullWidth
            variant="default"
            leftSection={<IconLogin size={18} />}
            onClick={() => router.push('/auth/login')}
          >
            Sign in with password
          </Button>
          <Text ta="left" size="xs" c="dimmed" mt={4}>
            <Anchor href="/" c="dimmed" size="xs">← Back to homepage</Anchor>
          </Text>
        </Stack>
      )}
    </Stack>
  );
};
