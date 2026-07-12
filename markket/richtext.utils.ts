import { JSONDocToBlocks, blocksToHtml } from '@/markket/helpers.blocks';
import type { RichTextValue, StoredRichText, StrapiBlock, TiptapDoc } from '@/markket/richtext';

export const isTiptapDoc = (value: unknown): value is TiptapDoc => {
  return (
    typeof value === 'object' &&
    value !== null &&
    'type' in value &&
    (value as { type?: string }).type === 'doc'
  );
};

export const isStrapiBlocksArray = (value: unknown): value is StrapiBlock[] => {
  return Array.isArray(value);
};

export const isHtmlString = (value: string): boolean => {
  return /<\/?[a-z][\s\S]*>/i.test(value);
};

export const richTextToHtml = (value: RichTextValue | StoredRichText): string => {
  if (!value) return '';

  if (typeof value === 'string') {
    return value;
  }

  if (isStrapiBlocksArray(value)) {
    return blocksToHtml(value as any[]);
  }

  if (isTiptapDoc(value)) {
    return blocksToHtml(JSONDocToBlocks(value));
  }

  return '';
};

export const richTextToPlainText = (value: RichTextValue | StoredRichText): string => {
  const html = richTextToHtml(value);

  if (!html) {
    return '';
  }

  return html
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<\/p>/gi, ' ')
    .replace(/<\/h[1-6]>/gi, ' ')
    .replace(/<\/li>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ')
    .trim();
};

export const stripMarkdown = (text?: string): string =>
  text
    ?.replace(/!\[.*?\]\(.*?\)/g, '')
    .replace(/\[([^\]]+)\]\(.*?\)/g, '$1')
    .replace(/`{1,3}[^`]*`{1,3}/g, '')
    .replace(/#{1,6}\s*/g, '')
    .replace(/[*_~]{1,3}([^*_~]+)[*_~]{1,3}/g, '$1')
    .replace(/^\s*[-*+>]\s+/gm, '')
    .replace(/\n+/g, ' ')
    .trim() ?? '';

const normalizeImageUrl = (value: unknown): string | undefined => {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

const collectImageUrlsFromString = (value: string): string[] => {
  const urls: string[] = [];

  const markdownPattern = /!\[[^\]]*\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g;
  for (const match of value.matchAll(markdownPattern)) {
    const url = normalizeImageUrl(match[1]);
    if (url && !urls.includes(url)) urls.push(url);
  }

  const htmlPattern = /<img\b[^>]*\bsrc=["']([^"']+)["'][^>]*>/gi;
  for (const match of value.matchAll(htmlPattern)) {
    const url = normalizeImageUrl(match[1]);
    if (url && !urls.includes(url)) urls.push(url);
  }

  return urls;
};

const collectImageUrlsFromNode = (node: unknown, urls: string[]): void => {
  if (!node) return;

  if (typeof node === 'string') {
    collectImageUrlsFromString(node).forEach((url) => {
      if (!urls.includes(url)) urls.push(url);
    });
    return;
  }

  if (Array.isArray(node)) {
    node.forEach((child) => collectImageUrlsFromNode(child, urls));
    return;
  }

  if (typeof node !== 'object') return;

  const value = node as Record<string, any>;

  if (value.type === 'image') {
    const image = value.image as Record<string, any> | undefined;
    const candidates = [
      image?.formats?.large?.url,
      image?.formats?.medium?.url,
      image?.formats?.small?.url,
      image?.formats?.thumbnail?.url,
      image?.url,
      value.url,
      value.src,
      value.attrs?.src,
    ];

    candidates.forEach((candidate) => {
      const url = normalizeImageUrl(candidate);
      if (url && !urls.includes(url)) urls.push(url);
    });
  }

  if (Array.isArray(value.content)) {
    value.content.forEach((child: unknown) => collectImageUrlsFromNode(child, urls));
  }

  if (Array.isArray(value.children)) {
    value.children.forEach((child: unknown) => collectImageUrlsFromNode(child, urls));
  }
};

export const extractRichTextImageUrls = (value: RichTextValue | StoredRichText): string[] => {
  if (!value) return [];

  if (typeof value === 'string') {
    return collectImageUrlsFromString(value);
  }

  const urls: string[] = [];
  collectImageUrlsFromNode(value, urls);
  return urls;
};

export const extractRichTextImageUrl = (value: RichTextValue | StoredRichText): string | undefined => {
  return extractRichTextImageUrls(value)[0];
};
