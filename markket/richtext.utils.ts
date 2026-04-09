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
