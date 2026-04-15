import { JSONDocToBlocks, sanitizeStrapiBlocks } from './helpers.blocks';
import type { StrapiBlock, TiptapDoc } from './richtext.d';

/**
 * Converts Tiptap format (or raw TiptapDoc) to Strapi v5 blocks format
 * This is called before sending to the API to ensure format compatibility
 */
export function tiptapToStrapiBlocks(value: unknown): StrapiBlock[] {
  if (typeof value === 'string') {
    try {
      value = JSON.parse(value);
    } catch {
      return [];
    }
  }

  if (Array.isArray(value)) {
    return sanitizeStrapiBlocks(value as StrapiBlock[]);
  }

  if (value && typeof value === 'object' && 'content' in value) {
    return JSONDocToBlocks(value as TiptapDoc);
  }

  return [];
}
