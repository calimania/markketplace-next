'use client';

import { useEffect, useState } from 'react';
import {
  ActionIcon, Avatar, Badge, Button, Center, Group, Loader, Paper,
  ScrollArea, Skeleton, Stack, Table, Text, TextInput, Tooltip,
} from '@mantine/core';
import {
  IconCheck, IconClock, IconMail, IconRefresh,
  IconSearch, IconUserCheck, IconUserPlus, IconUsers, IconX,
} from '@tabler/icons-react';

type Invite = {
  email: string;
  status: 'pending' | 'accepted' | 'expired';
  sentAt: string;
  acceptedAt: string | null;
  expiresAt: string;
};

type InvitesResponse = {
  store?: { documentId: string; slug: string };
  invites?: Invite[];
  total?: number;
};

type SendInviteResponse = {
  ok?: boolean;
  message?: string;
  error?: string;
  inviteUrl?: string;
  invite?: {
    link?: string;
    url?: string;
  };
};

type DashboardUser = {
  id: number;
  username: string | null;
  email: string | null;
  displayName: string | null;
  confirmed: boolean | null;
};

type StoreMemberRecord = {
  user: DashboardUser;
  role: string;
  status: string;
  joinedAt: string | null;
  invitedBy: DashboardUser | null;
  source: 'membership' | 'legacy_users' | 'owner_relation';
};

type StoreMembersResponse = {
  ok?: boolean;
  store?: {
    documentId: string;
    slug: string | null;
    title: string | null;
  };
  owner?: StoreMemberRecord | null;
  members?: StoreMemberRecord[];
  total?: number;
  counts?: {
    memberships?: number;
    legacyUsers?: number;
  };
  message?: string;
};

type LocalAuthSession = {
  id?: number | string;
  username?: string;
  email?: string;
};

const STATUS_COLOR: Record<Invite['status'], string> = {
  pending: 'yellow',
  accepted: 'green',
  expired: 'gray',
};

const STATUS_ICON: Record<Invite['status'], React.ElementType> = {
  pending: IconClock,
  accepted: IconUserCheck,
  expired: IconX,
};

function readAuthToken() {
  if (typeof window === 'undefined') return '';
  try {
    const raw = localStorage.getItem('markket.auth');
    const parsed = raw ? JSON.parse(raw) : null;
    return parsed?.jwt || '';
  } catch {
    return '';
  }
}

function readAuthSession(): LocalAuthSession | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('markket.auth');
    const parsed = raw ? JSON.parse(raw) : null;
    if (!parsed) return null;
    return {
      id: parsed?.id,
      username: parsed?.username,
      email: parsed?.email,
    };
  } catch {
    return null;
  }
}

function toLocalDate(value?: string | null) {
  if (!value) return '—';
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleDateString();
}

export default function StoreTeamClient({
  storeRef,
  storeSlug,
  storeTitle,
  storeLogoUrl,
}: {
  storeRef: string;
  storeSlug: string;
  storeTitle: string;
  storeLogoUrl?: string | null;
}) {
  const [invites, setInvites] = useState<Invite[]>([]);
  const [members, setMembers] = useState<StoreMemberRecord[]>([]);
  const [owner, setOwner] = useState<StoreMemberRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [missingAuth, setMissingAuth] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviting, setInviting] = useState(false);
  const [inviteError, setInviteError] = useState('');
  const [inviteSuccess, setInviteSuccess] = useState('');
  const [sendingReminder, setSendingReminder] = useState<string | null>(null);
  const [sessionAccount, setSessionAccount] = useState<LocalAuthSession | null>(null);

  const loadTeamData = async (token: string) => {
    setError('');
    setLoading(true);

    try {
      const [invitesRes, membersRes] = await Promise.all([
        fetch(`/api/tienda/stores/${encodeURIComponent(storeRef)}/invites`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`/api/tienda/stores/${encodeURIComponent(storeRef)}/members`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const invitesPayload = (await invitesRes.json()) as InvitesResponse;
      const membersPayload = (await membersRes.json()) as StoreMembersResponse;

      if (!invitesRes.ok) {
        throw new Error((invitesPayload as { message?: string })?.message || `Invites request failed (${invitesRes.status})`);
      }

      if (!membersRes.ok) {
        throw new Error((membersPayload as { message?: string })?.message || `Members request failed (${membersRes.status})`);
      }

      setInvites(Array.isArray(invitesPayload?.invites) ? invitesPayload.invites : []);
      setMembers(Array.isArray(membersPayload?.members) ? membersPayload.members : []);
      setOwner(membersPayload?.owner || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load team data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = readAuthToken();
    setSessionAccount(readAuthSession());
    if (!token) {
      setMissingAuth(true);
      setLoading(false);
      return;
    }
    void loadTeamData(token);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storeRef]);

  const handleInvite = async () => {
    const email = inviteEmail.trim();
    if (!email) return;
    setInviteError('');
    setInviteSuccess('');
    setInviting(true);

    const token = readAuthToken();
    if (!token) {
      setInviteError('You must be signed in to send invites.');
      setInviting(false);
      return;
    }

    try {
      const inviteLinkBase = typeof window !== 'undefined'
        ? `${window.location.origin}/${storeSlug}/invite`
        : '/invite';

      const res = await fetch(`/api/tienda/stores/${encodeURIComponent(storeRef)}/invite`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          storeSlug,
          nextPath: `/${storeSlug}/invite`,
          inviteLinkBase,
        }),
      });
      const payload = (await res.json()) as SendInviteResponse;
      if (!res.ok) {
        throw new Error(
          res.status === 429
            ? 'Too many invites sent recently. Please wait before trying again.'
            : payload?.message || payload?.error || `Request failed (${res.status})`,
        );
      }
      setInviteEmail('');
      const inviteLink = payload?.inviteUrl || payload?.invite?.link || payload?.invite?.url;
      const friendlyMessage = payload?.message || `Invitation sent to ${email}. They can confirm and join ${storeTitle}.`;
      setInviteSuccess(inviteLink ? `${friendlyMessage} Link ready.` : friendlyMessage);
      await loadTeamData(token);
    } catch (err) {
      setInviteError(err instanceof Error ? err.message : 'Could not send invite.');
    } finally {
      setInviting(false);
    }
  };

  const handleSendReminder = async (email: string) => {
    setSendingReminder(email);
    const token = readAuthToken();
    if (!token) {
      setSendingReminder(null);
      return;
    }

    try {
      const inviteLinkBase = typeof window !== 'undefined'
        ? `${window.location.origin}/${storeSlug}/invite`
        : '/invite';

      const res = await fetch(`/api/tienda/stores/${encodeURIComponent(storeRef)}/invite`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          storeSlug,
          nextPath: `/${storeSlug}/invite`,
          inviteLinkBase,
          reminder: true,
        }),
      });
      if (!res.ok) {
        const payload = (await res.json()) as SendInviteResponse;
        throw new Error(
          res.status === 429
            ? 'Too many reminders sent recently. Please wait before trying again.'
            : payload?.message || payload?.error || `Request failed (${res.status})`,
        );
      }
      setInviteSuccess(`Reminder sent to ${email}.`);
      await loadTeamData(token);
    } catch (err) {
      setInviteError(err instanceof Error ? err.message : 'Could not send reminder.');
    } finally {
      setSendingReminder(null);
    }
  };

  const actionableInvites = invites.filter((invite) => invite.status !== 'accepted');

  const filtered = search.trim()
    ? actionableInvites.filter((i) => i.email?.toLowerCase().includes(search.toLowerCase()))
    : actionableInvites;

  const byStatus = {
    pending: filtered.filter((i) => i.status === 'pending'),
    expired: filtered.filter((i) => i.status === 'expired'),
  };

  const fallbackOwnerMember: StoreMemberRecord[] =
    members.length === 0 && (sessionAccount?.email || sessionAccount?.username)
      ? [{
          user: {
            id: Number(sessionAccount?.id || 0),
            email: sessionAccount?.email || null,
            username: sessionAccount?.username || null,
            displayName: sessionAccount?.username || sessionAccount?.email || null,
            confirmed: null,
          },
          role: 'owner',
          status: 'active',
          joinedAt: null,
          invitedBy: null,
          source: 'owner_relation',
        }]
      : [];

  const rosterMembers = members.length > 0 ? members : fallbackOwnerMember;
  const headerOwner = owner || rosterMembers.find((member) => member.role === 'owner') || null;
  const visibleMembers = headerOwner
    ? [headerOwner, ...rosterMembers.filter((member) => member.user.id !== headerOwner.user.id)]
    : rosterMembers;
  const showingFallbackOwner = members.length === 0 && visibleMembers.length > 0;

  if (loading) {
    return (
      <Paper withBorder radius="xl" p="md">
        <Stack gap="sm">
          <Center py={4}><Loader size="sm" /></Center>
          {[1, 2, 3].map((i) => <Skeleton key={i} height={44} radius="md" />)}
        </Stack>
      </Paper>
    );
  }

  if (missingAuth) {
    return (
      <Paper withBorder radius="xl" p="md">
        <Stack gap={4} align="center">
          <Text c="dimmed" size="sm" fw={600}>You need to be signed in</Text>
          <Text c="dimmed" size="xs" ta="center">Sign in to invite and manage your team members.</Text>
        </Stack>
      </Paper>
    );
  }

  return (
    <Stack gap="md">
      <Paper withBorder radius="xl" p="md">
        <Group justify="space-between" align="flex-start" wrap="wrap" gap="md">
          <Group gap="sm" wrap="nowrap" align="center">
            <Avatar src={storeLogoUrl || undefined} radius="xl" size={44}>
              {storeTitle.charAt(0).toUpperCase()}
            </Avatar>
            <div>
              <Text fw={700} size="sm">{storeTitle}</Text>
              <Text c="dimmed" size="xs">Manage access and invites.</Text>
            </div>
          </Group>
          {visibleMembers.length > 0 && (
            <Badge variant="light" color="blue" leftSection={<IconUsers size={12} />}>
              {showingFallbackOwner ? '1 current account' : `${visibleMembers.length} active`}
            </Badge>
          )}
        </Group>

        {visibleMembers.length > 0 && (
          <Stack gap="xs" mt="md">
            <Group gap="xs" align="center">
              <IconUsers size={16} />
              <Text fw={600} size="sm">Current team</Text>
            </Group>
            {showingFallbackOwner && (
              <Text c="dimmed" size="xs">
                Showing your signed-in account while member data syncs.
              </Text>
            )}
            <Group gap="sm" wrap="wrap">
              {visibleMembers.map((member) => {
                const label = member.user.displayName || member.user.username || member.user.email || 'Store member';
                const isOwner = member.role === 'owner';
                return (
                  <Paper
                    key={String(member.user.id || label)}
                    withBorder
                    radius="xl"
                    p="xs"
                  >
                    <Group gap="sm" wrap="nowrap">
                      <Avatar radius="xl" size={34}>
                        {label.charAt(0).toUpperCase()}
                      </Avatar>
                      <div>
                        <Group gap={6} align="center">
                          <Text size="sm" fw={600}>{label}</Text>
                          {isOwner && <Badge color="grape" variant="light" size="xs">Owner</Badge>}
                        </Group>
                        <Text size="xs" c="dimmed">
                          {showingFallbackOwner
                            ? 'Owner (current session)'
                            : member.user.email || member.user.username || `${member.role} · ${member.status}`}
                        </Text>
                      </div>
                    </Group>
                  </Paper>
                );
              })}
            </Group>
          </Stack>
        )}
      </Paper>

      {/* Invite form */}
      <Paper withBorder radius="xl" p="md">
        <Stack gap="xs">
          <Group align="center" gap="xs">
            <IconUserPlus size={18} />
            <Text fw={600} size="sm">Invite collaborator</Text>
          </Group>
          <Text c="dimmed" size="xs">
            We&apos;ll email an invite link. It expires in 24 hours.
          </Text>
          <Group align="flex-end" gap="sm">
            <TextInput
              flex={1}
              label="Email address"
              type="email"
              placeholder="collaborator@example.com"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.currentTarget.value)}
              leftSection={<IconMail size={14} />}
              onKeyDown={(e) => { if (e.key === 'Enter') handleInvite(); }}
              error={inviteError || undefined}
            />
            <Button
              onClick={handleInvite}
              loading={inviting}
              leftSection={<IconUserPlus size={16} />}
              mb={inviteError ? 20 : undefined}
            >
              Send Invite
            </Button>
          </Group>
          {inviteSuccess && (
            <Group gap="xs">
              <IconCheck size={14} color="var(--mantine-color-green-6)" />
              <Text size="xs" c="green">{inviteSuccess}</Text>
            </Group>
          )}
        </Stack>
      </Paper>

      {/* Search + refresh */}
      {actionableInvites.length > 0 && (
        <Group gap="sm">
          <TextInput
            flex={1}
            placeholder="Filter by email…"
            leftSection={<IconSearch size={14} />}
            value={search}
            onChange={(e) => setSearch(e.currentTarget.value)}
            rightSection={
              search ? (
                <ActionIcon variant="subtle" size="sm" onClick={() => setSearch('')} aria-label="Clear search">
                  <IconX size={12} />
                </ActionIcon>
              ) : null
            }
          />
          <Tooltip label="Refresh">
            <ActionIcon
              variant="default"
              size="lg"
              onClick={() => {
                const token = readAuthToken();
                if (token) void loadTeamData(token);
              }}
              aria-label="Refresh invite list"
            >
              <IconRefresh size={16} />
            </ActionIcon>
          </Tooltip>
        </Group>
      )}

      {error && (
        <Paper withBorder radius="md" p="sm">
          <Text c="red" size="sm">{error}</Text>
        </Paper>
      )}

      {byStatus.pending.length > 0 && (
        <InviteTable title="Pending" color="yellow" rows={byStatus.pending} showAcceptedAt={false} onSendReminder={handleSendReminder} sendingReminder={sendingReminder} />
      )}
      {byStatus.expired.length > 0 && (
        <InviteTable title="Expired" color="gray" rows={byStatus.expired} showAcceptedAt={false} />
      )}

      {actionableInvites.length === 0 && !error && (
        <Paper withBorder radius="xl" p="xl">
          <Stack align="center" gap="xs">
            <IconUserPlus size={32} color="var(--mantine-color-dimmed)" />
            <Text c="dimmed" size="sm" ta="center">
              No pending invites.
            </Text>
          </Stack>
        </Paper>
      )}

      {actionableInvites.length > 0 && filtered.length === 0 && (
        <Text c="dimmed" size="sm" ta="center" py="sm">
          No invites match &ldquo;{search}&rdquo;.
        </Text>
      )}
    </Stack>
  );
}

function InviteTable({
  title,
  color,
  rows,
  showAcceptedAt,
  onSendReminder,
  sendingReminder,
}: {
  title: string;
  color: string;
  rows: Invite[];
  showAcceptedAt: boolean;
  onSendReminder?: (email: string) => void;
  sendingReminder?: string | null;
}) {
  return (
    <Paper withBorder radius="xl" p="md">
      <Stack gap="sm">
        <Group justify="space-between" align="center">
          <Text fw={600} size="sm">{title}</Text>
          <Badge variant="light" color={color}>{rows.length}</Badge>
        </Group>
        <ScrollArea>
          <Table highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Email</Table.Th>
                <Table.Th>Sent</Table.Th>
                {showAcceptedAt && <Table.Th>Accepted</Table.Th>}
                <Table.Th>Expires</Table.Th>
                <Table.Th>Status</Table.Th>
                {onSendReminder && <Table.Th>Actions</Table.Th>}
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {rows.map((invite) => {
                const Icon = STATUS_ICON[invite.status];
                return (
                  <Table.Tr key={`${invite.email}-${invite.sentAt}`}>
                    <Table.Td><Text size="sm">{invite.email}</Text></Table.Td>
                    <Table.Td><Text size="xs" c="dimmed">{toLocalDate(invite.sentAt)}</Text></Table.Td>
                    {showAcceptedAt && (
                      <Table.Td><Text size="xs" c="dimmed">{toLocalDate(invite.acceptedAt)}</Text></Table.Td>
                    )}
                    <Table.Td><Text size="xs" c="dimmed">{toLocalDate(invite.expiresAt)}</Text></Table.Td>
                    <Table.Td>
                      <Badge variant="light" color={STATUS_COLOR[invite.status]} size="sm" leftSection={<Icon size={10} />}>
                        {invite.status}
                      </Badge>
                    </Table.Td>
                    {onSendReminder && (
                      <Table.Td>
                        {invite.status === 'pending' ? (
                          <Tooltip label="Send a new invite link">
                            <ActionIcon
                              variant="light"
                              size="sm"
                              onClick={() => onSendReminder(invite.email)}
                              loading={sendingReminder === invite.email}
                              aria-label="Send reminder"
                            >
                              <IconMail size={14} />
                            </ActionIcon>
                          </Tooltip>
                        ) : (
                          <Text size="xs" c="dimmed">—</Text>
                        )}
                      </Table.Td>
                    )}
                  </Table.Tr>
                );
              })}
            </Table.Tbody>
          </Table>
        </ScrollArea>
      </Stack>
    </Paper>
  );
}
