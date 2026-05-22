'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Container, Paper, Title, Text, Button, Group, ThemeIcon, Anchor } from '@mantine/core';
import { IconCheck, IconX, IconUsers } from '@tabler/icons-react';
import { markketClient } from '@/markket/api.markket';
import { markketColors } from '@/markket/colors.config';
import { getNonEmbedHref } from '@/app/utils/embed.query';
import { useAuth } from '@/app/providers/auth.provider';

type Props = {
  code: string;
  inviteContext?: {
    storeName?: string;
    storeSlug?: string;
    inviteEmail?: string;
    invitedBy?: string;
  };
};

function getExistingAuth(): { email?: string; username?: string } | null {
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem('markket.auth') : null;
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export default function InviteAcceptHandler({ code, inviteContext }: Props) {
  const router = useRouter();
  const { refreshUser } = useAuth();
  const [status, setStatus] = useState<'ready' | 'loading' | 'success' | 'error'>('ready');
  const storeName = inviteContext?.storeName?.trim() || 'this store';
  const storeSlug = inviteContext?.storeSlug?.trim();
  const inviteEmail = inviteContext?.inviteEmail?.trim().toLowerCase();
  const invitedBy = inviteContext?.invitedBy?.trim();
  const [activeAccount, setActiveAccount] = useState<{ email?: string; username?: string } | null>(null);
  const [message, setMessage] = useState(`Accept to join ${storeName}.`);

  useEffect(() => {
    const auth = getExistingAuth();
    setActiveAccount(auth);
    const signedInAs = auth?.email || auth?.username;

    if (signedInAs) {
      if (inviteEmail && auth?.email && auth.email.toLowerCase() !== inviteEmail) {
        setMessage(
          `This invite is for ${inviteEmail}, but you're signed in as ${auth.email}. Accepting will switch you into the invited account if the link is valid.`,
        );
        return;
      }

      setMessage(`You're signed in as ${signedInAs}. Click below to join ${storeName}.`);
      return;
    }

    if (inviteEmail) {
      setMessage(`This invite is for ${inviteEmail}. Accept to join ${storeName}.`);
      return;
    }

    setMessage(`Accept to join ${storeName}.`);
  }, [inviteEmail, storeName]);

  const activeIdentity = activeAccount?.email || activeAccount?.username;
  const isSwitchingAccount = Boolean(
    activeAccount?.email && inviteEmail && activeAccount.email.toLowerCase() !== inviteEmail,
  );

  const openInBrowser = () => {
    if (typeof window === 'undefined') return;
    const cleanHref = getNonEmbedHref(window.location.href);
    window.open(cleanHref, '_blank', 'noopener,noreferrer');
  };

  async function handleAccept() {
    const markket = new markketClient();
    setStatus('loading');
    setMessage('Verifying your invite…');

    try {
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
          // Navigation can still continue; header will refresh on next protected fetch.
        }
        setStatus('success');
        setMessage(`You're in. Continue when you're ready.`);
        return;
      }

      setStatus('error');
      setMessage('We could not accept this invite. The link may have already been used.');
    } catch (err) {
      const status =
        err && typeof err === 'object' && 'status' in err && typeof (err as { status?: unknown }).status === 'number'
          ? (err as { status: number }).status
          : undefined;
      const isExpired =
        status === 401 ||
        err && typeof err === 'object' && 'message' in err &&
        typeof (err as { message: unknown }).message === 'string' &&
        (err as { message: string }).message.includes('INVALID_CODE');

      setStatus('error');
      setMessage(
        isExpired
          ? 'This invite link has expired or already been used. Ask the store owner to send a new one.'
          : err && typeof err === 'object' && 'message' in err
            ? (err as { message: string }).message
            : 'Could not verify this invite. Please request a new link.',
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
          {status === 'success' && (
            <ThemeIcon size={64} radius="xl" variant="light" color="green">
              <IconCheck size={32} />
            </ThemeIcon>
          )}
          {(status === 'ready' || status === 'loading') && (
            <ThemeIcon
              size={64}
              radius="xl"
              variant="gradient"
              gradient={{ from: markketColors.sections.shop.main, to: markketColors.rosa.main, deg: 135 }}
            >
              <IconUsers size={32} />
            </ThemeIcon>
          )}
        </Group>

        <Title ta="center" fw={900} mb="xs">
          {status === 'ready' && "You're invited"}
          {status === 'loading' && 'Joining…'}
          {status === 'success' && 'Welcome!'}
          {status === 'error' && 'Link unavailable'}
        </Title>

        <Text ta="center" c="dimmed" mb="lg">
          {message}
        </Text>

        {(inviteEmail || invitedBy) && (
          <Paper withBorder radius="md" p="sm" mb="lg" bg="var(--mantine-color-gray-0)">
            {inviteEmail && (
              <Text size="xs" c="dimmed" mb={invitedBy ? 4 : 0}>
                Invitation email: <strong>{inviteEmail}</strong>
              </Text>
            )}
            {invitedBy && (
              <Text size="xs" c="dimmed">
                Invited by: <strong>{invitedBy}</strong>
              </Text>
            )}
          </Paper>
        )}

        {status === 'ready' && activeIdentity && (
          <Text size="xs" c="dimmed" ta="center" mb="md">
            Signed in as <strong>{activeIdentity}</strong>. {isSwitchingAccount
              ? 'Accepting this invite will switch your session to the invited account.'
              : 'Accepting this invite will continue with this account if it matches the invite.'}
          </Text>
        )}

        {(status === 'ready' || status === 'error') && (
          <Button
            fullWidth
            size="lg"
            h={52}
            fw={700}
            radius="xl"
            mb="md"
            leftSection={status === 'ready' ? <IconCheck size={18} /> : <IconX size={18} />}
            variant="gradient"
            gradient={{ from: markketColors.rosa.main, to: markketColors.sections.blog.main, deg: 135 }}
            onClick={() => void handleAccept()}
            disabled={status === 'error'}
          >
            {status === 'ready'
              ? isSwitchingAccount
                ? 'Accept invite and switch account'
                : 'Accept invite'
              : 'Invite unavailable'}
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
            onClick={() => router.replace(storeSlug ? `/tienda/${storeSlug}/team` : '/tienda')}
          >
            Open store team
          </Button>
        )}

        {status === 'loading' && (
          <Button fullWidth size="lg" h={52} radius="xl" mb="md" loading variant="light">
            Verifying…
          </Button>
        )}

        <Group justify="center">
          <Anchor size="xs" c="dimmed" onClick={openInBrowser} style={{ cursor: 'pointer' }}>
            Open in browser
          </Anchor>
        </Group>
      </Paper>
    </Container>
  );
}
