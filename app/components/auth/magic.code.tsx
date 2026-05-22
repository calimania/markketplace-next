'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Container, Paper, Title, Text, Button, Group, ThemeIcon, Anchor } from '@mantine/core';
import { IconCheck, IconX, IconMailStar } from '@tabler/icons-react';
import { markketClient } from '@/markket/api.markket';
import { markketColors } from '@/markket/colors.config';
import { getNonEmbedHref } from '@/app/utils/embed.query';
import { useAuth } from '@/app/providers/auth.provider';

type Props = {
  code: string;
};

export default function MagicCodeHandler({ code }: Props) {
  const router = useRouter();
  const { refreshUser } = useAuth();
  const [status, setStatus] = useState<'ready' | 'loading' | 'success' | 'error'>('ready');
  const [message, setMessage] = useState('Click below to confirm and sign in.');
  const [continuePath, setContinuePath] = useState('/me');
  const [continueLabel, setContinueLabel] = useState('Continue to my account');

  const openInBrowser = () => {
    if (typeof window === 'undefined') return;
    const cleanHref = getNonEmbedHref(window.location.href);
    window.open(cleanHref, '_blank', 'noopener,noreferrer');
  };

  async function handleMagicLogin() {
    const markket = new markketClient();
    setStatus('loading');
    setMessage('Verifying your link, one moment…');

    try {
      const preview = await markket.previewMagicCode(code);
      const purpose = preview?.data?.purpose;
      const inviteStoreTitle = preview?.data?.meta?.storeTitle?.trim();
      const isStoreInvite = purpose === 'store_invite';

      const result = await markket.verifyMagicCode(code);
      const { jwt, user } = result;
      const userId = user?.id || user?.documentId;

      if (jwt && userId) {
        localStorage.setItem('markket.auth', JSON.stringify({
          jwt, id: userId, username: user?.username, email: user?.email,
        }));
        try {
          await refreshUser();
        } catch {
          // Continue; auth will eventually rehydrate from storage and protected calls.
        }
        setStatus('success');
        if (isStoreInvite) {
          setContinuePath('/tienda');
          setContinueLabel('Continue to my stores');
          setMessage(`Invite accepted${inviteStoreTitle ? ` for ${inviteStoreTitle}` : ''}. Continue when you're ready.`);
        } else {
          setContinuePath('/me');
          setContinueLabel('Continue to my account');
          setMessage(`Welcome ${user?.email || user?.username || ''}. Continue when you're ready.`);
        }
        return;
      }

      setStatus('error');
      setMessage('We could not start your session. Please request a new magic link.');
    } catch (err) {
      const status =
        err && typeof err === 'object' && 'status' in err && typeof (err as { status?: unknown }).status === 'number'
          ? (err as { status: number }).status
          : undefined;
      const msg = err instanceof Error ? err.message : '';
      setStatus('error');
      setMessage(
        status === 401 || msg.includes('INVALID_CODE')
          ? 'This magic link has already been used or has expired. Request a new one below.'
          : msg || 'We could not verify this link. Please request a new one.',
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
          {status === 'ready' && (
            <ThemeIcon size={64} radius="xl" variant="gradient" gradient={{ from: markketColors.sections.shop.main, to: markketColors.rosa.main, deg: 135 }}>
              <IconMailStar size={32} />
            </ThemeIcon>
          )}
          {status === 'loading' && (
            <ThemeIcon size={64} radius="xl" variant="gradient" gradient={{ from: markketColors.rosa.main, to: markketColors.sections.blog.main, deg: 135 }}>
              <IconCheck size={32} />
            </ThemeIcon>
          )}
        </Group>
        <Title ta="center" fw={900} mb="xs">
          {status === 'ready' && 'Almost there'}
          {status === 'loading' && 'Signing you in…'}
          {status === 'success' && 'Signed in'}
          {status === 'error' && 'Link unavailable'}
        </Title>
        <Text ta="center" c="dimmed" mb="lg">
          {message}
        </Text>

        {(status === 'ready' || status === 'error') && (
          <Button
            fullWidth
            size="lg"
            h={52}
            fw={700}
            radius="xl"
            mb="md"
            leftSection={<IconCheck size={18} />}
            variant="gradient"
            gradient={{ from: markketColors.rosa.main, to: markketColors.sections.blog.main, deg: 135 }}
            onClick={() => void handleMagicLogin()}
          >
            Continue and sign in
          </Button>
        )}

        {status === 'success' && (
          <Button
            fullWidth
            size="lg"
            h={52}
            fw={700}
            radius="xl"
            mb="md"
            leftSection={<IconCheck size={18} />}
            variant="gradient"
            gradient={{ from: 'green', to: 'teal', deg: 135 }}
            onClick={() => router.replace(continuePath)}
          >
            {continueLabel}
          </Button>
        )}

        <Group justify="center" mb="md">
          <Anchor size="xs" c="dimmed" onClick={openInBrowser} style={{ cursor: 'pointer' }}>
            Open in browser
          </Anchor>
        </Group>

        {status === 'error' && (
          <Button
            fullWidth
            size="md"
            h={44}
            fw={600}
            radius="xl"
            mt="sm"
            leftSection={<IconMailStar size={16} />}
            variant="light"
            color="gray"
            onClick={() => router.replace('/auth/magic')}
          >
            Back to magic link
          </Button>
        )}
      </Paper>
    </Container>
  );
}
