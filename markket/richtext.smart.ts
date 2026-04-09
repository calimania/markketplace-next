import type { RichTextValue, StoredRichText } from '@/markket/richtext';
import { richTextToHtml } from '@/markket/richtext.utils';

export type EmbedProvider = 'youtube' | 'vimeo';

export type EmbedDescriptor = {
  provider: EmbedProvider;
  id: string;
  url: string;
  embedUrl: string;
};

export type RichTextSignals = {
  html: string;
  plainText: string;
  urls: string[];
  images: Array<{ src: string; alt?: string }>;
  embeds: EmbedDescriptor[];
};

const YOUTUBE_HOST_RE = /(^|\.)youtube\.com$|(^|\.)youtu\.be$/i;
const VIMEO_HOST_RE = /(^|\.)vimeo\.com$/i;

const uniq = <T,>(items: T[]): T[] => Array.from(new Set(items));

const decodeHtml = (value: string): string => {
  return value
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
};

const htmlToPlainText = (html: string): string => {
  return decodeHtml(html.replace(/<[^>]*>/g, ' ')).replace(/\s+/g, ' ').trim();
};

const parseYouTubeId = (url: URL): string | null => {
  const host = url.hostname.toLowerCase();

  if (!YOUTUBE_HOST_RE.test(host)) return null;

  if (host.includes('youtu.be')) {
    const id = url.pathname.replace(/^\//, '').split('/')[0];
    return id || null;
  }

  const fromQuery = url.searchParams.get('v');
  if (fromQuery) return fromQuery;

  const segments = url.pathname.split('/').filter(Boolean);
  const idx = segments.findIndex((segment) => segment === 'embed' || segment === 'shorts' || segment === 'live');

  if (idx >= 0 && segments[idx + 1]) return segments[idx + 1];
  return null;
};

const parseVimeoId = (url: URL): string | null => {
  const host = url.hostname.toLowerCase();
  if (!VIMEO_HOST_RE.test(host)) return null;

  const segments = url.pathname.split('/').filter(Boolean);
  const id = [...segments].reverse().find((segment) => /^\d+$/.test(segment));
  return id || null;
};

export const parseEmbedUrl = (rawUrl: string): EmbedDescriptor | null => {
  try {
    const url = new URL(rawUrl);
    const youtubeId = parseYouTubeId(url);

    if (youtubeId) {
      return {
        provider: 'youtube',
        id: youtubeId,
        url: rawUrl,
        embedUrl: `https://www.youtube.com/embed/${youtubeId}`,
      };
    }

    const vimeoId = parseVimeoId(url);
    if (vimeoId) {
      return {
        provider: 'vimeo',
        id: vimeoId,
        url: rawUrl,
        embedUrl: `https://player.vimeo.com/video/${vimeoId}`,
      };
    }

    return null;
  } catch {
    return null;
  }
};

const extractUrlsFromHtml = (html: string): string[] => {
  const hrefMatches = [...html.matchAll(/href\s*=\s*['"]([^'"]+)['"]/gi)].map((match) => match[1]);
  const bareUrlMatches = [...html.matchAll(/https?:\/\/[^\s<>'"]+/gi)].map((match) => match[0]);
  return uniq([...hrefMatches, ...bareUrlMatches]);
};

const extractImagesFromHtml = (html: string): Array<{ src: string; alt?: string }> => {
  const imageMatches = [...html.matchAll(/<img\s+[^>]*>/gi)].map((match) => match[0]);

  return imageMatches
    .map((tag) => {
      const src = tag.match(/src\s*=\s*['"]([^'"]+)['"]/i)?.[1] || '';
      const alt = tag.match(/alt\s*=\s*['"]([^'"]*)['"]/i)?.[1];
      return { src, alt };
    })
    .filter((item) => !!item.src);
};

export const extractRichTextSignals = (content: RichTextValue | StoredRichText): RichTextSignals => {
  const html = richTextToHtml(content);
  const urls = extractUrlsFromHtml(html);
  const embeds = urls.map(parseEmbedUrl).filter((embed): embed is EmbedDescriptor => !!embed);
  const images = extractImagesFromHtml(html);
  const plainText = htmlToPlainText(html);

  return {
    html,
    plainText,
    urls,
    images,
    embeds,
  };
};

export const buildEditorMediaPreview = (content: RichTextValue | StoredRichText) => {
  const signals = extractRichTextSignals(content);

  return {
    excerpt: signals.plainText.slice(0, 180),
    imageThumbnails: signals.images.slice(0, 6),
    embeds: signals.embeds.slice(0, 4),
    urlCount: signals.urls.length,
  };
};

export const injectVideoEmbeds = (html: string): string => {
  if (!html?.trim()) return html;

  return html.replace(/<a\s+[^>]*href=['"]([^'"]+)['"][^>]*>(.*?)<\/a>/gi, (full, href) => {
    const embed = parseEmbedUrl(href);
    if (!embed) return full;

    return [
      '<div class="markket-rich-embed" style="position:relative;padding-top:56.25%;margin:1rem 0;border-radius:12px;overflow:hidden;">',
      `<iframe src="${embed.embedUrl}" title="${embed.provider} video"`,
      ' loading="lazy"',
      ' style="position:absolute;inset:0;width:100%;height:100%;border:0;"',
      ' allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"',
      ' allowfullscreen></iframe>',
      '</div>',
    ].join('');
  });
};
