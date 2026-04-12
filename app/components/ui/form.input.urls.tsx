import { useState, useEffect } from 'react';
import {
  TextInput,
  Button,
  Group,
  Paper,
  ActionIcon,
  Stack,
  Text,
  Box,
  ThemeIcon,
  Tooltip,
} from '@mantine/core';
import {
  IconPlus,
  IconTrash,
  IconLink,
  IconWorldUpload,
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
} from '@tabler/icons-react';
import { UseFormReturnType } from '@mantine/form';

export interface URLItem {
  id?: number;
  Label: string;
  URL: string;
}

interface URLsInputProps {
  label?: string;
  description?: string;
  value: URLItem[];
  onChange: (urls: URLItem[]) => void;
  form?: UseFormReturnType<any>;
  field?: string;
  readOnly?: boolean;
}

type LinkProfile = {
  Icon: React.FC<{ size?: number; color?: string }>;
  color: string;
  suggestedLabel: string;
};

function detectLinkProfile(url: string): LinkProfile {
  if (!url) return { Icon: IconWorld, color: '#00BCD4', suggestedLabel: 'Website' };
  const lower = url.toLowerCase();
  if (lower.includes('instagram.com')) return { Icon: IconBrandInstagram, color: '#E4007C', suggestedLabel: 'Instagram' };
  if (lower.includes('twitter.com') || lower.includes('x.com')) return { Icon: IconBrandX, color: '#424242', suggestedLabel: 'X' };
  if (lower.includes('youtube.com') || lower.includes('youtu.be')) return { Icon: IconBrandYoutube, color: '#F44336', suggestedLabel: 'YouTube' };
  if (lower.includes('facebook.com') || lower.includes('fb.com')) return { Icon: IconBrandFacebook, color: '#1877F2', suggestedLabel: 'Facebook' };
  if (lower.includes('linkedin.com')) return { Icon: IconBrandLinkedin, color: '#0A66C2', suggestedLabel: 'LinkedIn' };
  if (lower.includes('github.com')) return { Icon: IconBrandGithub, color: '#333333', suggestedLabel: 'GitHub' };
  if (lower.includes('tiktok.com')) return { Icon: IconBrandTiktok, color: '#212121', suggestedLabel: 'TikTok' };
  if (lower.includes('spotify.com')) return { Icon: IconBrandSpotify, color: '#1DB954', suggestedLabel: 'Spotify' };
  if (lower.includes('discord.com') || lower.includes('discord.gg')) return { Icon: IconBrandDiscord, color: '#5865F2', suggestedLabel: 'Discord' };
  if (lower.includes('whatsapp.com') || lower.includes('wa.me')) return { Icon: IconBrandWhatsapp, color: '#25D366', suggestedLabel: 'WhatsApp' };
  if (lower.includes('twitch.tv')) return { Icon: IconBrandTwitch, color: '#9146FF', suggestedLabel: 'Twitch' };
  if (lower.includes('pinterest.com')) return { Icon: IconBrandPinterest, color: '#E60023', suggestedLabel: 'Pinterest' };
  if (lower.includes('apple.com') || lower.includes('music.apple') || lower.includes('podcasts.apple')) return { Icon: IconBrandApple, color: '#424242', suggestedLabel: 'Apple' };
  if (lower.includes('soundcloud.com')) return { Icon: IconBrandSoundcloud, color: '#FF5500', suggestedLabel: 'SoundCloud' };
  return { Icon: IconWorld, color: '#00BCD4', suggestedLabel: 'Website' };
}

function extractDomain(url: string): string {
  try {
    const u = new URL(url);
    return u.hostname.replace('www.', '');
  } catch {
    return '';
  }
}

export default function URLsInput({
  label = 'URLs',
  description,
  value = [],
  onChange,
  form,
  field = 'URLS',
  readOnly = false,
}: URLsInputProps) {
  const [urls, setUrls] = useState<URLItem[]>(value || []);

  useEffect(() => {
    setUrls(value || []);
  }, [value]);

  const handleAddUrl = () => {
    const newUrls = [...urls, { Label: '', URL: '', id: -Date.now() }];
    setUrls(newUrls);
    onChange(newUrls);
    if (form && field) {
      form.setFieldValue(field, newUrls);
    }
  };

  const handleRemoveUrl = (index: number) => {
    const newUrls = [...urls];
    newUrls.splice(index, 1);
    setUrls(newUrls);
    onChange(newUrls);
    if (form && field) {
      form.setFieldValue(field, newUrls);
    }
  };

  const handleChangeUrl = (index: number, key: 'Label' | 'URL', val: string) => {
    const newUrls = [...urls];
    newUrls[index][key] = val;

    // Auto-suggest label when pasting a URL if label is empty
    if (key === 'URL' && !newUrls[index].Label) {
      const profile = detectLinkProfile(val);
      if (profile.suggestedLabel !== 'Website') {
        newUrls[index].Label = profile.suggestedLabel;
      } else {
        const domain = extractDomain(val);
        if (domain) newUrls[index].Label = domain;
      }
    }

    setUrls(newUrls);
    onChange(newUrls);
    if (form && field) {
      form.setFieldValue(field, newUrls);
    }
  };

  return (
    <Stack gap="xs">
      <Group justify="space-between">
        <div>
          <Text fw={500} size="sm">{label}</Text>
          {description && <Text size="xs" c="dimmed">{description}</Text>}
        </div>
        <Button
          leftSection={<IconPlus size={14} />}
          size="xs"
          variant="light"
          color="cyan"
          onClick={handleAddUrl}
          disabled={readOnly}
        >
          Add Link
        </Button>
      </Group>

      {urls.length === 0 ? (
        <Paper
          withBorder
          p="lg"
          ta="center"
          c="dimmed"
          style={{
            borderStyle: 'dashed',
            backgroundColor: 'var(--mantine-color-gray-0)',
          }}
        >
          <IconWorldUpload size={28} opacity={0.4} style={{ marginBottom: 6 }} />
          <Text size="sm" c="dimmed">No links yet — add your website, social profiles, or any URL</Text>
        </Paper>
      ) : (
        <Stack gap="xs">
            {urls.map((url, index) => {
              const profile = detectLinkProfile(url.URL);
              return (
                <Paper key={url.id || index} withBorder p="sm" radius="md"
                  style={{ borderLeft: `3px solid ${profile.color}` }}
                >
                  <input type="hidden" name={`${field}[${index}].id`} value={url.id || ''} />
                  <Group align="center" wrap="nowrap" gap="sm">
                    <Tooltip label={profile.suggestedLabel} position="top">
                      <ThemeIcon
                        radius="xl"
                        size={36}
                        style={{ background: `${profile.color}18`, flexShrink: 0 }}
                      >
                        <profile.Icon size={18} color={profile.color} />
                      </ThemeIcon>
                    </Tooltip>
                    <Group grow align="flex-start" style={{ flex: 1 }}>
                      <TextInput
                        placeholder="Label  (e.g. Instagram)"
                        value={url.Label}
                        onChange={(e) => handleChangeUrl(index, 'Label', e.target.value)}
                        radius="md"
                        size="sm"
                        readOnly={readOnly}
                      />
                      <Box style={{ flex: 1.5 }}>
                        <TextInput
                          placeholder="https://..."
                          value={url.URL}
                          onChange={(e) => handleChangeUrl(index, 'URL', e.target.value)}
                          radius="md"
                          size="sm"
                          leftSection={<IconLink size={13} color={profile.color} />}
                          readOnly={readOnly}
                        />
                      </Box>
                    </Group>
                    <ActionIcon
                      color="red"
                      variant="subtle"
                      onClick={() => handleRemoveUrl(index)}
                      style={{ flexShrink: 0 }}
                      disabled={readOnly}
                    >
                      <IconTrash size={15} />
                    </ActionIcon>
                  </Group>
                </Paper>
              );
            })}
        </Stack>
      )}
    </Stack>
  );
}
