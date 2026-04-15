'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Container, Paper, Title, Text, Button, Group, ThemeIcon } from '@mantine/core';
import { IconCheck, IconX, IconMailStar, IconHome } from '@tabler/icons-react';
import { markketClient  } from '@/markket/api.markket';
import { Suspense } from 'react';

import MagicLinkPage from '../../components/auth/magic.page';

function MagicPage() {
  const router = useRouter();
  const params = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  const code = params.get('code');

  useEffect(() => {
    const markket = new markketClient();

    async function handleMagicLogin() {
      if (!code) {
        setStatus('error');
        setMessage('Missing code or email.');
        return;
      }

      setStatus('loading');
      setMessage('Please wait while we log you in.');

      try {
        const result = await markket.verifyMagicCode(code);

        const { jwt , user} = result;

        if (jwt && user?.id) {
          localStorage.setItem('markket.auth', JSON.stringify({
            jwt, id: user.id, username: user.username, email: user.email
          }));

          setStatus('success');
          setMessage('You are logged in. Taking you to your workspace...');

          // Hard navigate so the auth provider re-initializes with the fresh JWT
          // instead of showing an empty /me because the provider already ran before confirm.
          window.location.replace('/me');
          return;
        }

        setStatus('error');
        setMessage('Login did not return a valid session. Please try again.');

      } catch (err) {
        setStatus('error');
        setMessage(
          err && typeof err === 'object' && 'message' in err
            ? (err.message as string)
            : 'Oops! Something went wrong.'
        );
      }
    }
    handleMagicLogin();
  }, [params, router, code]);

  if (!code ) {
    return <MagicLinkPage />;
  }

  return (
    <Container size={420} py={80}>
      <Paper
        withBorder
        shadow="md"
        p={30}
        radius="xl"
        style={{
          boxShadow: '0 16px 32px rgba(0,0,0,0.08)',
          background: 'white',
        }}
      >
        <Group justify="center" mb="md">
          {status === 'success' && (
            <ThemeIcon size={64} radius="xl" variant="light" color="cyan">
              <IconMailStar size={32} />
            </ThemeIcon>
          )}
          {status === 'error' && (
            <ThemeIcon size={64} radius="xl" variant="light" color="pink">
              <IconX size={32} />
            </ThemeIcon>
          )}
          {status === 'loading' && (
            <ThemeIcon size={64} radius="xl" variant="light" color="blue">
              <IconCheck size={32} />
            </ThemeIcon>
          )}
        </Group>
        <Title ta="center" fw={900} mb="xs">
          {status === 'loading' && 'Logging you in...'}
          {status === 'success' && 'Welcome!'}
          {status === 'error' && 'Something went wrong'}
        </Title>
        <Text ta="center" c="dimmed" mb="lg">
          {status === 'loading' && 'Please wait while we verify your magic link.'}
          {status !== 'loading' && message}
        </Text>
        {status === 'error' && (
          <Button
            fullWidth
            size="md"
            leftSection={<IconMailStar size={18} />}
            onClick={() => router.push('/auth/login')}
            style={{
              background: 'linear-gradient(135deg, #E4007C 0%, #E91E63 100%)',
            }}
          >
            Try again
          </Button>
        )}
        {status === 'success' && (
          <Group grow mt="md">
            <Button
              variant="light"
              color="cyan"
              leftSection={<IconHome size={16} />}
              onClick={() => router.push('/me')}
            >
              My Profile
            </Button>
            <Button
              leftSection={<IconCheck size={16} />}
              onClick={() => router.push('/tienda/new')}
              style={{
                background: 'linear-gradient(135deg, #00BCD4 0%, #E4007C 100%)',
              }}
            >
              Create Store
            </Button>
          </Group>
        )}
      </Paper>
    </Container>
  );
}

export default function MagicPageWrapper() {
  return (
    <Suspense fallback={<div>...</div>}>
      <MagicPage />
    </Suspense>
  );
};
