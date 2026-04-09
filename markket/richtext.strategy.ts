import { JSONDocToBlocks } from '@/markket/helpers.blocks';
import type { contentTypes } from '@/markket/index.d';
import type { RichTextValue } from '@/markket/richtext';
import { isTiptapDoc, richTextToHtml } from '@/markket/richtext.utils';

export type RichTextFormat = 'markdown' | 'blocks' | 'html';
export type RichTextContentType = contentTypes | 'store';

export const RICH_TEXT_FIELD_FORMATS: Record<RichTextContentType, Record<string, RichTextFormat>> = {
  page: {
    Content: 'blocks',
  },
  article: {
    Content: 'blocks',
  },
  product: {
    Description: 'markdown',
  },
  event: {
    Description: 'markdown',
  },
  album: {
    content: 'blocks',
  },
  track: {
    content: 'blocks',
  },
  store: {
    Description: 'html',
  },
};

export const getRichTextFieldFormat = (contentType: RichTextContentType, field: string): RichTextFormat | null => {
  return RICH_TEXT_FIELD_FORMATS[contentType]?.[field] || null;
};

export const normalizeRichTextByFormat = (value: unknown, format: RichTextFormat): unknown => {
  if (value === undefined || value === null) return value;

  if (format === 'blocks') {
    if (isTiptapDoc(value)) {
      return JSONDocToBlocks(value);
    }

    return value;
  }

  if (format === 'html') {
    return richTextToHtml(value as RichTextValue);
  }

  // markdown: keep plain string as-is; fallback to HTML when incoming shape is structured.
  if (typeof value === 'string') return value;
  return richTextToHtml(value as RichTextValue);
};

export const normalizeRichTextFieldsForContentType = <T extends Record<string, unknown>>(
  contentType: RichTextContentType,
  payload: T,
): T => {
  const fieldFormats = RICH_TEXT_FIELD_FORMATS[contentType];
  if (!fieldFormats) return payload;

  const next = { ...payload } as Record<string, unknown>;

  Object.entries(fieldFormats).forEach(([field, format]) => {
    if (!(field in next)) return;
    next[field] = normalizeRichTextByFormat(next[field], format);
  });

  return next as T;
};
