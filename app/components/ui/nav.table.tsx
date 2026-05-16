"use client";

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Group, Skeleton, Stack, Text, ThemeIcon } from '@mantine/core';
import { IconChevronRight, IconFileText, IconNews, IconPhoto, IconShoppingCart, IconCalendarEvent, IconMusic, IconExternalLink } from '@tabler/icons-react';
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
  previewHref?: string;
};

type NavTableProps = {
  items: NavTableItem[];
  emptyText?: string;
  loading?: boolean;
};

function getIcon(icon?: NavIcon) {
  if (icon === 'article') return <IconNews size={14} />;
  if (icon === 'page') return <IconFileText size={14} />;
  if (icon === 'product') return <IconShoppingCart size={14} />;
  if (icon === 'event') return <IconCalendarEvent size={14} />;
  if (icon === 'album') return <IconMusic size={14} />;
  return <IconPhoto size={14} />;
}

export default function NavTable({ items, emptyText = 'No items yet.', loading = false }: NavTableProps) {
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

  const handleClick = (event: React.MouseEvent<HTMLDivElement>, item: NavTableItem) => {
    if (event.defaultPrevented) return;
    if (event.metaKey || event.ctrlKey) {
      window.open(appendEmbedParamsToHref(item.href), '_blank', 'noopener,noreferrer');
      return;
    }
    if (event.shiftKey || event.altKey || event.button !== 0) {
      return;
    }

    setPressedKey(item.key);
    setIsNavigating(true);

    if (navTimerRef.current) {
      window.clearTimeout(navTimerRef.current);
    }

    navTimerRef.current = window.setTimeout(() => {
      router.push(appendEmbedParamsToHref(item.href));
    }, 170);
  };

  if (loading) {
    return (
      <>
        <Skeleton height={58} radius="xl" />
        <Skeleton height={58} radius="xl" />
      </>
    )
  }

  if (!items.length) {
    return <Text c="dimmed">{emptyText}</Text>;
  }

  return (
    <Stack gap={0} className={`ui-nav-table${isNavigating ? ' is-exiting' : ''}`}>
      {items.map((item, index) => (
        <div
          key={`${item.key}-${index}`}
          className={`ui-nav-row${pressedKey === item.key ? ' is-pressed' : ''}`}
          data-nav-icon={item.icon || 'store'}
          role="link"
          tabIndex={0}
          onPointerDown={() => setPressedKey(item.key)}
          onPointerCancel={() => setPressedKey(null)}
          onBlur={() => setPressedKey(null)}
          onClick={(event) => handleClick(event, item)}
          onKeyDown={(event) => {
            if (event.key !== 'Enter' && event.key !== ' ') return;
            event.preventDefault();
            setPressedKey(item.key);
            setIsNavigating(true);

            if (navTimerRef.current) {
              window.clearTimeout(navTimerRef.current);
            }

            navTimerRef.current = window.setTimeout(() => {
              router.push(appendEmbedParamsToHref(item.href));
            }, 170);
          }}
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
                  <Text size="xs" c="dimmed" truncate className="ui-nav-subtitle">
                    {item.subtitle}
                  </Text>
                )}
              </div>
            </Group>
            <Group gap={8} wrap="nowrap" align="center">
              {item.previewHref && (
                <button
                  type="button"
                  title={`Preview ${item.title} in Markket`}
                  aria-label={`Preview ${item.title} in Markket`}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    window.open(item.previewHref, '_blank', 'noopener,noreferrer');
                  }}
                  style={{ display: 'flex', alignItems: 'center', color: 'var(--mantine-color-dimmed)', padding: '4px 6px', borderRadius: 6, lineHeight: 1, background: 'transparent', border: 'none', cursor: 'pointer' }}
                  className="ui-nav-preview-btn"
                >
                  <IconExternalLink size={14} />
                </button>
              )}
              <Group gap={4} wrap="nowrap" className="ui-nav-row-cta">
                <Text size="xs" c="dimmed" fw={600}>
                  {item.ctaLabel || 'Open'}
                </Text>
                <IconChevronRight size={14} />
              </Group>
            </Group>
          </Group>
        </div>
      ))}
    </Stack>
  );
}