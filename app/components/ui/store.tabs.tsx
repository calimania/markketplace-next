"use client";

import { Tooltip, ActionIcon, Group, Text, Anchor } from "@mantine/core";
import {
  IconBrandInstagram,
  IconBrandX,
  IconBrandYoutube,
  IconBrandFacebook,
  IconBrandLinkedin,
  IconBrandGithub,
  IconBrandTiktok,
  IconBrandSpotify,
  IconBrandDiscord,
  IconBrandWhatsapp,
  IconBrandTwitch,
  IconBrandPinterest,
  IconBrandApple,
  IconBrandSoundcloud,
  IconWorld,
} from "@tabler/icons-react";

interface StoreTabProps {
  urls?: { id: number; Label: string; URL: string }[];
  basePath?: string;
}

type LinkProfile = {
  Icon: React.FC<{ size?: number; color?: string }>;
  color: string;
};

function detectLinkProfile(url: string): LinkProfile {
  if (!url) return { Icon: IconWorld, color: '#00BCD4' };
  const lower = url.toLowerCase();
  if (lower.includes('instagram.com')) return { Icon: IconBrandInstagram, color: '#E4007C' };
  if (lower.includes('twitter.com') || lower.includes('x.com')) return { Icon: IconBrandX, color: '#424242' };
  if (lower.includes('youtube.com') || lower.includes('youtu.be')) return { Icon: IconBrandYoutube, color: '#F44336' };
  if (lower.includes('facebook.com') || lower.includes('fb.com')) return { Icon: IconBrandFacebook, color: '#1877F2' };
  if (lower.includes('linkedin.com')) return { Icon: IconBrandLinkedin, color: '#0A66C2' };
  if (lower.includes('github.com')) return { Icon: IconBrandGithub, color: '#333333' };
  if (lower.includes('tiktok.com')) return { Icon: IconBrandTiktok, color: '#212121' };
  if (lower.includes('spotify.com')) return { Icon: IconBrandSpotify, color: '#1DB954' };
  if (lower.includes('discord.com') || lower.includes('discord.gg')) return { Icon: IconBrandDiscord, color: '#5865F2' };
  if (lower.includes('whatsapp.com') || lower.includes('wa.me')) return { Icon: IconBrandWhatsapp, color: '#25D366' };
  if (lower.includes('twitch.tv')) return { Icon: IconBrandTwitch, color: '#9146FF' };
  if (lower.includes('pinterest.com')) return { Icon: IconBrandPinterest, color: '#E60023' };
  if (lower.includes('apple.com') || lower.includes('music.apple') || lower.includes('podcasts.apple')) return { Icon: IconBrandApple, color: '#424242' };
  if (lower.includes('soundcloud.com')) return { Icon: IconBrandSoundcloud, color: '#FF5500' };
  return { Icon: IconWorld, color: '#00BCD4' };
}

function resolveStoreHref(url: string, basePath = ''): string {
  if (!url) return basePath || '/';

  const lower = url.toLowerCase();
  if (
    lower.startsWith('http://') ||
    lower.startsWith('https://') ||
    lower.startsWith('mailto:') ||
    lower.startsWith('tel:')
  ) {
    return url;
  }

  const normalizedBase = basePath.endsWith('/') ? basePath.slice(0, -1) : basePath;
  if (url.startsWith('/')) {
    return `${normalizedBase}${url}`;
  }

  return `${normalizedBase}/${url.replace(/^\.?\//, '')}`;
}

export function StoreTabs({ urls = [], basePath = '' }: StoreTabProps) {
  if (!urls.length) return null;

  return (
    <Group gap="sm" wrap="wrap" justify="center">
      {urls.map((link) => {
        const { Icon, color } = detectLinkProfile(link.URL);
        const resolvedHref = resolveStoreHref(link.URL, basePath);
        const isExternal = resolvedHref?.startsWith('https') || resolvedHref?.startsWith('http');
        return (
          <Tooltip key={link.id} label={link.Label || link.URL} position="top" withArrow>
            <Anchor
              href={resolvedHref}
              target={isExternal ? '_blank' : '_self'}
              rel={isExternal ? 'noopener noreferrer' : undefined}
              underline="never"
            >
              <ActionIcon
                size={44}
                radius="xl"
                variant="light"
                style={{
                  background: `${color}15`,
                  border: `1.5px solid ${color}30`,
                  boxShadow: `0 3px 10px ${color}18`,
                  transition: 'transform 0.15s ease, box-shadow 0.15s ease, background 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.12)';
                  (e.currentTarget as HTMLButtonElement).style.boxShadow = `0 6px 20px ${color}40`;
                  (e.currentTarget as HTMLButtonElement).style.background = `${color}1f`;
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)';
                  (e.currentTarget as HTMLButtonElement).style.boxShadow = `0 3px 10px ${color}18`;
                  (e.currentTarget as HTMLButtonElement).style.background = `${color}15`;
                }}
              >
                <Icon size={22} color={color} />
              </ActionIcon>
            </Anchor>
          </Tooltip>
        );
      })}
      {urls.length > 4 && (
        <Text size="xs" style={{ alignSelf: 'center', color: '#616161' }}>
          {urls.length} links
        </Text>
      )}
    </Group>
  );
}

