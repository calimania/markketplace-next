'use client';

import { useEffect, useState } from 'react';
import { Box, Group, Paper, Stack, Tabs, Text } from '@mantine/core';
import {
  IconMail,
  IconMessageCircle,
  IconShoppingBag,
  IconUsers,
} from '@tabler/icons-react';
import CrmOrdersTableClient from './crm.orders.table.client';
import CrmOrdersListClient from './crm.orders.list.client';
import CrmSubscribersListClient from './crm.subscribers.list.client';
import CrmInboxListClient from './crm.inbox.list.client';

type CrmTab = 'customers' | 'orders' | 'subscribers' | 'inbox';

type CrmSection = {
  id: CrmTab;
  label: string;
  icon: React.ElementType;
  accent: string;
};

const CRM_SECTIONS: CrmSection[] = [
  {
    id: 'customers',
    label: 'Customers',
    icon: IconUsers,
    accent: '#0ea5e9',
  },
  {
    id: 'orders',
    label: 'Orders',
    icon: IconShoppingBag,
    accent: '#8b5cf6',
  },
  {
    id: 'subscribers',
    label: 'Subscribers',
    icon: IconMail,
    accent: '#ec4899',
  },
  {
    id: 'inbox',
    label: 'Inbox',
    icon: IconMessageCircle,
    accent: '#f59e0b',
  },
];

function hashToTab(hash: string): CrmTab | null {
  const value = hash.replace(/^#crm-/, '').trim().toLowerCase();
  if (value === 'customers' || value === 'orders' || value === 'subscribers' || value === 'inbox') {
    return value;
  }
  return null;
}

export default function CrmWorkspaceClient({
  storeRef,
  storeSlug,
}: {
  storeRef: string;
  storeSlug: string;
}) {
  const [activeTab, setActiveTab] = useState<CrmTab>('inbox');
  const [unreadInboxCount, setUnreadInboxCount] = useState(0);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const fromHash = hashToTab(window.location.hash);
    if (fromHash) {
      setActiveTab(fromHash);
    }
  }, []);

  useEffect(() => {
    const token = readAuthToken();
    if (!token) {
      setUnreadInboxCount(0);
      return;
    }

    const loadUnread = async () => {
      try {
        const params = new URLSearchParams();
        params.set('storeId', storeRef);
        params.set('store', storeSlug);
        params.set('includeMessages', 'false');
        params.set('page', '1');
        params.set('pageSize', '100');
        params.set('sortBy', 'latestMessageAt');
        params.set('sortOrder', 'desc');

        const response = await fetch(`/api/crm/inbox?${params.toString()}`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          setUnreadInboxCount(0);
          return;
        }

        const payload = (await response.json()) as {
          data?: Array<{ estado?: string; Archived?: boolean }>;
          items?: Array<{ estado?: string; Archived?: boolean }>;
          threads?: Array<{ estado?: string; Archived?: boolean }>;
        };

        const list = Array.isArray(payload?.data)
          ? payload.data
          : Array.isArray(payload?.items)
            ? payload.items
            : Array.isArray(payload?.threads)
              ? payload.threads
              : [];

        const unreadCount = list.filter((row) => {
          if (row.Archived) return false;
          const estado = (row.estado || '').toLowerCase().trim();
          return !estado || estado === 'open' || estado === 'new' || estado === 'unread';
        }).length;

        setUnreadInboxCount(unreadCount);
      } catch {
        setUnreadInboxCount(0);
      }
    };

    void loadUnread();
  }, [storeRef, storeSlug, activeTab]);

  const handleTabChange = (next: string | null) => {
    if (!next) return;
    const normalized = hashToTab(`#crm-${next}`);
    if (!normalized) return;

    setActiveTab(normalized);

    if (typeof window !== 'undefined') {
      const nextHash = `crm-${normalized}`;
      if (window.location.hash !== `#${nextHash}`) {
        window.history.replaceState(null, '', `#${nextHash}`);
      }
    }
  };

  return (
    <Stack gap="sm">
      <Tabs value={activeTab} onChange={handleTabChange} keepMounted={false}>
        <Tabs.List
          style={{
            borderRadius: 12,
            padding: 4,
            gap: 4,
            flexWrap: 'nowrap',
            overflowX: 'auto',
            WebkitOverflowScrolling: 'touch',
            background: 'linear-gradient(180deg, rgba(255,255,255,0.96) 0%, rgba(248,250,252,0.96) 100%)',
            border: '1px solid rgba(148, 163, 184, 0.22)',
            boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)',
          }}
        >
          {CRM_SECTIONS.map((section) => {
            const Icon = section.icon;
            const isActive = activeTab === section.id;

            return (
              <Tabs.Tab
                key={section.id}
                value={section.id}
                leftSection={<Icon size={14} color={isActive ? section.accent : 'rgba(55,65,81,0.8)'} />}
                style={{
                  flex: '0 0 auto',
                  borderRadius: 10,
                  fontWeight: 700,
                  letterSpacing: '0.01em',
                  border: isActive ? `1px solid ${section.accent}66` : '1px solid rgba(148, 163, 184, 0.2)',
                  transition: 'all 140ms ease',
                  color: isActive ? '#1f2937' : 'rgba(31, 41, 55, 0.9)',
                  background: isActive
                    ? `linear-gradient(180deg, ${section.accent}1f 0%, rgba(255,255,255,0.98) 100%)`
                    : 'rgba(255,255,255,0.72)',
                  boxShadow: isActive
                    ? `0 2px 8px rgba(31, 41, 55, 0.08), inset 0 -2px 0 ${section.accent}`
                    : 'none',
                }}
              >
                <Group gap={5} wrap="nowrap">
                  <Box style={{ width: 6, height: 6, borderRadius: 999, background: section.accent, opacity: isActive ? 1 : 0.5 }} />
                  <Text size="xs" fw={700}>{section.label}</Text>
                  {section.id === 'inbox' && unreadInboxCount > 0 ? (
                    <Group gap={4} wrap="nowrap" align="center">
                      <Box
                        style={{
                          width: 7,
                          height: 7,
                          borderRadius: 999,
                          background: '#ef4444',
                          boxShadow: '0 0 0 2px rgba(255, 255, 255, 0.9)',
                        }}
                      />
                      <Text size="xs" fw={700} c="#b91c1c">
                        {unreadInboxCount > 99 ? '99+' : unreadInboxCount}
                      </Text>
                    </Group>
                  ) : null}
                </Group>
              </Tabs.Tab>
            );
          })}
        </Tabs.List>

        <Tabs.Panel value="customers">
          <Paper withBorder radius="md" p="sm">
            <CrmOrdersTableClient storeRef={storeRef} />
          </Paper>
        </Tabs.Panel>

        <Tabs.Panel value="orders">
          <Paper withBorder radius="md" p="sm">
            <CrmOrdersListClient storeRef={storeRef} />
          </Paper>
        </Tabs.Panel>

        <Tabs.Panel value="subscribers">
          <Paper withBorder radius="md" p="sm">
            <CrmSubscribersListClient storeRef={storeRef} />
          </Paper>
        </Tabs.Panel>

        <Tabs.Panel value="inbox">
          <Paper withBorder radius="md" p="sm">
            <CrmInboxListClient storeRef={storeRef} storeSlug={storeSlug} />
          </Paper>
        </Tabs.Panel>
      </Tabs>
    </Stack>
  );
}

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
