'use client';

import { Avatar, Menu, UnstyledButton } from '@mantine/core';
import { IconDashboard, IconLogin, IconLogout, IconUser } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/providers/auth.provider';
import { markketColors } from '@/markket/colors.config';

interface AccountButtonProps {
  size?: number;
}

export default function AccountButton({ size = 32 }: AccountButtonProps) {
  const { user, logout, maybe } = useAuth();
  const router = useRouter();
  const isLoggedIn = maybe();

  return (
    <Menu shadow="md" width={180} position="bottom-end">
      <Menu.Target>
        <UnstyledButton
          aria-label="Account"
          style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}
        >
          <Avatar
            src={user?.avatar?.url}
            size={size}
            radius="xl"
            style={{
              cursor: 'pointer',
              border: `2px solid ${isLoggedIn ? markketColors.rosa.main : markketColors.neutral.lightGray}`,
              background: isLoggedIn ? markketColors.rosa.light : undefined,
            }}
          >
            <IconUser size={size * 0.5} color={isLoggedIn ? markketColors.rosa.main : markketColors.neutral.darkGray} />
          </Avatar>
        </UnstyledButton>
      </Menu.Target>

      <Menu.Dropdown>
        {isLoggedIn && user ? (
          <>
            <Menu.Label style={{ maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user.displayName || user.username || user.email}
            </Menu.Label>
            <Menu.Item leftSection={<IconDashboard size={14} />} onClick={() => router.push('/me')}>
              Dashboard
            </Menu.Item>
            <Menu.Divider />
            <Menu.Item color="red" leftSection={<IconLogout size={14} />} onClick={() => logout()}>
              Sign out
            </Menu.Item>
          </>
        ) : (
          <Menu.Item leftSection={<IconLogin size={14} />} onClick={() => router.push('/auth/magic')}>
            Sign in
          </Menu.Item>
        )}
      </Menu.Dropdown>
    </Menu>
  );
}
