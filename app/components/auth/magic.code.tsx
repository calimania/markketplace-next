'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Container, Paper, Title, Text, Button, Group, ThemeIcon } from '@mantine/core';
import { IconCheck, IconX, IconMailStar, IconHome } from '@tabler/icons-react';
import { markketClient } from '@/markket/api.markket';
import { markketColors } from '@/markket/colors.config';

type Props = {
  code: string;
};

export default function MagicCodeHandler({ code }: Props) {
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const markket = new markketClient();

    async function handleMagicLogin() {
      setStatus('loading');
      setMessage('Please wait while we log you in.');

      try {
        const result = await markket.verifyMagicCode(code);
        const { jwt, user } = result;

        if (jwt && user?.id) {
          localStorage.setItem('markket.auth', JSON.stringify({
            jwt, id: user.id, username: user.username, email: user.email,
          }));

          setStatus('success');
          setMessage('You are logged in. Taking you to your workspace...');
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
            : 'Oops! Something went wrong.',
        );
      }
    }

    handleMagicLogin();
  }, [code]);

  return (
    <Container size={420} py={80}>
      <Paper
        withBorder
        p={30}
        radius="xl"
        style={{ boxShadow: '0 16px 32px rgba(0,0,0,0.08)' }}
      >
        <Group justify="center" mb="md">
          {status === 'success' && (
            <ThemeIcon size={64} radius="xl" variant="gradient" gradient={{ from: markketColors.sections.shop.main, to: markketColors.rosa.main, deg: 135 }}>
              <IconMailStar size={32} />
            </ThemeIcon>
          )}
          {status === 'error' && (
            <ThemeIcon size={64} radius="xl" variant="light" color="pink">
              <IconX size={32} />
            </ThemeIcon>
          )}
          {status === 'loading' && (
            <ThemeIcon size={64} radius="xl" variant="gradient" gradient={{ from: markketColors.rosa.main, to: markketColors.sections.blog.main, deg: 135 }}>
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
            size="lg"
            h={52}
            fw={700}
            radius="xl"
            leftSection={<IconMailStar size={18} />}
            variant="gradient"
            gradient={{ from: markketColors.rosa.main, to: markketColors.sections.blog.main, deg: 135 }}
            onClick={() => router.push('/auth/login')}
          >
            Try again
          </Button>
        )}
        {status === 'success' && (
          <Group grow mt="md">
            <Button
              variant="light"
              radius="xl"
              style={{ color: markketColors.sections.shop.main, background: markketColors.sections.shop.light }}
              leftSection={<IconHome size={16} />}
              onClick={() => router.push('/me')}
            >
              My Profile
            </Button>
            <Button
              leftSection={<IconCheck size={16} />}
              radius="xl"
              variant="gradient"
              gradient={{ from: markketColors.sections.shop.main, to: markketColors.rosa.main, deg: 135 }}
              onClick={() => router.push('/tienda/new')}
            >
              Create Store
            </Button>
          </Group>
        )}
      </Paper>
    </Container>
  );
}
