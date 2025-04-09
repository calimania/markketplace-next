'use client'

import {
   Badge,  ActionIcon,  UnstyledButton, Group, Text,
} from '@mantine/core';
import {
 IconSettings,
  IconStarFilled,
} from '@tabler/icons-react';
import Link from 'next/link';

export function MainLink({
  icon: Icon,
  label,
  notifications,
  href,
  active,
  store_id,
  favorite,
  onFavorite,
}: {
  icon: typeof IconSettings;
  label: string;
  notifications?: number;
    store_id?: string;
  href?: string;
    active?: boolean;
  favorite?: boolean;
  onFavorite?: () => void;
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

          {onFavorite && (
            <ActionIcon
              variant="subtle"
              color={favorite ? "yellow" : "gray"}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onFavorite();
              }}
              size="xs"
              className="opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <IconStarFilled size={14} />
            </ActionIcon>
          )}
        </Group>
      </Group>
    </UnstyledButton>
  );
}
