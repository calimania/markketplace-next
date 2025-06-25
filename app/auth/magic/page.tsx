'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Container, Paper, Title, Text, Button, Group } from '@mantine/core';
import { IconCheck, IconX } from '@tabler/icons-react';
import { markketClient  } from '@/markket/api.markket';

import MagicLinkPage from '../../components/auth/magic.page';

export default function MagicPage() {
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

          setTimeout(() => {
            router.push('/dashboard/store');
          }, 33);
        }

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
      <Paper withBorder shadow="md" p={30} radius="md" className="auth-layout-neobrutal">
        <Group justify="center" mb="md">
          {status === 'success' && <IconCheck size={40} color="#0ea5e9" />}
          {status === 'error' && <IconX size={40} color="#f472b6" />}
        </Group>
        <Title ta="center" fw={900} mb="xs">
          {status === 'loading' && 'Logging you in...'}
          {status === 'success' && 'Welcome!'}
          {status === 'error' && 'Oops, error!'}
        </Title>
        <Text ta="center" c="dimmed" mb="lg">
          {status === 'loading' && 'Please wait while we log you in.'}
          {status !== 'loading' && message}
        </Text>
        {status === 'error' && (
          <Button fullWidth mt="md" onClick={() => router.push('/auth/login')}>
            Try again
          </Button>
        )}
      </Paper>
    </Container>
  );
}
