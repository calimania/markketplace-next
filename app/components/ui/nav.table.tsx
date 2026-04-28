"use client";

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Group, Stack, Text, ThemeIcon } from '@mantine/core';
import { IconChevronRight, IconFileText, IconNews, IconPhoto, IconShoppingCart, IconCalendarEvent, IconMusic } from '@tabler/icons-react';
import { appendEmbedParamsToHref } from '@/app/utils/embed.query';

type NavIcon = 'article' | 'page' | 'store' | 'product' | 'event' | 'album';

type NavTableItem = {
  key: string;
  title: string;
  subtitle?: string;
  href: string;
  icon?: NavIcon;
  thumbnailUrl?: string;
  thumbnailAlt?: string;
  ctaLabel?: string;
};

type NavTableProps = {
  items: NavTableItem[];
  emptyText?: string;
};

function getIcon(icon?: NavIcon) {
  if (icon === 'article') return <IconNews size={14} />;
  if (icon === 'page') return <IconFileText size={14} />;
  if (icon === 'product') return <IconShoppingCart size={14} />;
  if (icon === 'event') return <IconCalendarEvent size={14} />;
  if (icon === 'album') return <IconMusic size={14} />;
  return <IconPhoto size={14} />;
}

export default function NavTable({ items, emptyText = 'No items yet.' }: NavTableProps) {
  const router = useRouter();
  const [pressedKey, setPressedKey] = useState<string | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const navTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (navTimerRef.current) {
        window.clearTimeout(navTimerRef.current);
      }
    };
  }, []);

  const handleClick = (event: React.MouseEvent<HTMLAnchorElement>, item: NavTableItem) => {
    if (event.defaultPrevented) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) {
      return;
    }

    event.preventDefault();
    setPressedKey(item.key);
    setIsNavigating(true);

    if (navTimerRef.current) {
      window.clearTimeout(navTimerRef.current);
    }

    navTimerRef.current = window.setTimeout(() => {
      router.push(appendEmbedParamsToHref(item.href));
    }, 170);
  };

  if (items.length === 0) {
    return <Text c="dimmed">{emptyText}</Text>;
  }

  return (
    <Stack gap={0} className={`ui-nav-table${isNavigating ? ' is-exiting' : ''}`}>
      {items.map((item, index) => (
        <Link
          key={`${item.key}-${index}`}
          href={item.href}
          className={`ui-nav-row${pressedKey === item.key ? ' is-pressed' : ''}`}
          onPointerDown={() => setPressedKey(item.key)}
          onPointerCancel={() => setPressedKey(null)}
          onBlur={() => setPressedKey(null)}
          onClick={(event) => handleClick(event, item)}
        >
          <Group justify="space-between" align="center" wrap="nowrap" gap="sm">
            <Group wrap="nowrap" gap="sm" style={{ minWidth: 0 }}>
              {item.thumbnailUrl ? (
                <img
                  src={item.thumbnailUrl}
                  alt={item.thumbnailAlt || item.title}
                  width={36}
                  height={36}
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 8,
                    objectFit: 'cover',
                    border: '1px solid rgba(15, 23, 42, 0.12)',
                    flexShrink: 0,
                  }}
                />
              ) : (
                  <ThemeIcon variant="light" size="sm" radius="xl" color="gray">
                    {getIcon(item.icon)}
                  </ThemeIcon>
              )}
              <div style={{ minWidth: 0 }}>
                <Text fw={600} size="sm" truncate>
                  {item.title}
                </Text>
                {!!item.subtitle && (
                  <Text size="xs" c="dimmed" truncate>
                    {item.subtitle}
                  </Text>
                )}
              </div>
            </Group>
            <Group gap={4} wrap="nowrap" className="ui-nav-row-cta" aria-hidden="true">
              <Text size="xs" c="dimmed" fw={600}>
                {item.ctaLabel || 'Open'}
              </Text>
              <IconChevronRight size={14} />
            </Group>
          </Group>
        </Link>
      ))}
    </Stack>
  );
}