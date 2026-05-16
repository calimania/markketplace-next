'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Container, Paper, Title, Text, Button, Group, ThemeIcon } from '@mantine/core';
import { IconCheck, IconX, IconMailStar, IconExternalLink } from '@tabler/icons-react';
import { markketClient } from '@/markket/api.markket';
import { markketColors } from '@/markket/colors.config';
import { getNonEmbedHref } from '@/app/utils/embed.query';

type Props = {
  code: string;
};

export default function MagicCodeHandler({ code }: Props) {
  const router = useRouter();
  const verifyRequestedRef = useRef(false);
  const [status, setStatus] = useState<'loading' | 'error'>('loading');
  const [message, setMessage] = useState('Please wait while we verify your magic link.');

  const openInBrowser = () => {
    if (typeof window === 'undefined') return;
    const cleanHref = getNonEmbedHref(window.location.href);
    window.open(cleanHref, '_blank', 'noopener,noreferrer');
  };

  useEffect(() => {
    if (!code || verifyRequestedRef.current) return;
    verifyRequestedRef.current = true;
    void handleMagicLogin();
  }, [code]);

  async function handleMagicLogin() {
    const markket = new markketClient();
    setStatus('loading');
    setMessage('Please wait while we verify your magic link.');

    try {
      const result = await markket.verifyMagicCode(code);
      const { jwt, user } = result;

      if (jwt && user?.id) {
        localStorage.setItem('markket.auth', JSON.stringify({
          jwt, id: user.id, username: user.username, email: user.email,
        }));
        router.replace('/me');
        return;
      }

      setStatus('error');
      setMessage('Login did not return a valid session. Please request a new magic link.');
    } catch (err) {
      setStatus('error');
      setMessage(
        err && typeof err === 'object' && 'message' in err
          ? (err.message as string)
          : 'This magic link could not be verified. Please request a new one.',
      );
    }
  }

  return (
    <Container size={420} py={80}>
      <Paper
        withBorder
        p={30}
        radius="xl"
        style={{ boxShadow: '0 16px 32px rgba(0,0,0,0.08)' }}
      >
        <Group justify="center" mb="md">
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
          {status === 'error' && 'Something went wrong'}
        </Title>
        <Text ta="center" c="dimmed" mb="lg">
          {message}
        </Text>

        <Button
          fullWidth
          size="md"
          h={44}
          fw={600}
          radius="xl"
          mb="md"
          variant="outline"
          leftSection={<IconExternalLink size={16} />}
          onClick={openInBrowser}
        >
          Open in Safari or your default browser
        </Button>

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
            onClick={() => router.replace('/auth/magic')}
          >
            Back to Magic Link
          </Button>
        )}
      </Paper>
    </Container>
  );
}
