'use client'

import {
   Badge,  UnstyledButton, Group, Text,
} from '@mantine/core';
import {
 IconSettings,
} from '@tabler/icons-react';
import Link from 'next/link';

export function MainLink({
  icon: Icon,
  label,
  notifications,
  href,
  active,
  store_id,
}: {
  icon: typeof IconSettings;
  label: string;
  notifications?: number;
    store_id?: string;
  href?: string;
    active?: boolean;

}) {
  return (
    <UnstyledButton
      component={Link}
      href={(!store_id ? href : `${href}?store=${store_id}`) as string}
      className={`
        transition-colors duration-200 rounded-md w-full group relative
        ${active
          ? 'bg-blue-50 text-blue-600 hover:bg-blue-100'
          : 'hover:bg-gray-100'
        }
      `}
    >
      <Group
        align="center"
        justify="space-between"
        py={8}
        px={12}
      >
        <Group gap="sm">
          <Icon
            size={20}
            className={active ? 'text-blue-600' : 'text-gray-600'}
          />
          <Text
            size="sm"
            fw={active ? 500 : 400}
            lineClamp={1}
          >
            {label}
          </Text>
        </Group>

        <Group gap={8}>
          {notifications !== undefined && notifications > 0 && (
            <Badge
              size="sm"
              variant={active ? "filled" : "light"}
              color="blue"
            >
              {notifications}
            </Badge>
          )}
        </Group>
      </Group>
    </UnstyledButton>
  );
}
