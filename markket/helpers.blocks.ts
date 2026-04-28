import type { StrapiBlock, StrapiBlockLinkChild, StrapiBlockTextChild } from '@/markket/richtext';

type StrapiInlineChild = StrapiBlockTextChild | StrapiBlockLinkChild;
type StrapiListItemBlock = Omit<StrapiBlock, 'type' | 'children'> & {
  type: 'list-item';
  children?: StrapiInlineChild[];
};
type StrapiListBlock = Omit<StrapiBlock, 'type' | 'children'> & {
  type: 'list' | 'bullet-list' | 'ordered-list';
  children?: StrapiListItemBlock[];
};

const encodeAttribute = (value: string): string => {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
};

const decodeStrapiImage = (value: unknown): Record<string, unknown> | null => {
  if (typeof value !== 'string' || !value.trim()) return null;

  try {
    return JSON.parse(value) as Record<string, unknown>;
  } catch {
    return null;
  }
};

const isMeaningfulTextNode = (child: StrapiBlockTextChild): boolean => {
  return typeof child.text === 'string' && child.text.trim().length > 0;
};

const isMeaningfulLinkNode = (child: StrapiBlockLinkChild): boolean => {
  return typeof child.url === 'string'
    && child.url.trim().length > 0
    && Array.isArray(child.children)
    && child.children.some(isMeaningfulTextNode);
};

const isMeaningfulInlineChild = (child: StrapiBlockTextChild | StrapiBlockLinkChild): boolean => {
  return child.type === 'link' ? isMeaningfulLinkNode(child) : isMeaningfulTextNode(child);
};

const sanitizeInlineNodes = (
  nodes?: Array<StrapiBlockTextChild | StrapiBlockLinkChild>,
): Array<StrapiBlockTextChild | StrapiBlockLinkChild> => {
  return (nodes || []).filter(isMeaningfulInlineChild);
};

const hasValidImagePayload = (block: StrapiBlock): boolean => {
  return Boolean(
    block.type === 'image'
      && block.image
      && typeof block.image.url === 'string'
      && block.image.url.trim().length > 0
      && typeof block.image.name === 'string'
      && typeof block.image.width === 'number'
      && typeof block.image.height === 'number'
      && block.image.formats
      && typeof block.image.hash === 'string'
      && typeof block.image.ext === 'string'
      && typeof block.image.mime === 'string'
      && typeof block.image.size === 'number'
      && typeof block.image.provider === 'string'
      && typeof block.image.createdAt === 'string'
      && typeof block.image.updatedAt === 'string',
  );
};

const ensureImageChildren = (block: StrapiBlock): StrapiBlock => {
  const existingChildren = Array.isArray(block.children) ? block.children : [];
  return {
    ...block,
    children: existingChildren.length > 0 ? existingChildren : [{ type: 'text', text: '' }],
  };
};

export const sanitizeStrapiBlocks = (blocks: StrapiBlock[]): StrapiBlock[] => {
  return ((blocks || []) as StrapiBlock[]).flatMap((block): StrapiBlock[] => {

    if (!block || typeof block !== 'object') return [];

    if (block.type === 'paragraph' || block.type === 'heading' || block.type === 'quote' || block.type === 'code') {
      const children = sanitizeInlineNodes(block.children);
      return children.length > 0 ? [{ ...block, children }] : [];
    }

    if (block.type === 'list' || block.type === 'bullet-list' || block.type === 'ordered-list') {
      const listBlock = block as StrapiListBlock;
      const children = (listBlock.children || []).flatMap((item): StrapiListItemBlock[] => {
        const itemChildren = sanitizeInlineNodes(item?.children);
        return itemChildren.length > 0 ? [{ ...item, children: itemChildren }] : [];
      });

      return children.length > 0
        ? [{ ...listBlock, children: children as unknown as StrapiBlock['children'] }]
        : [];
    }

    if (block.type === 'image') {
      return hasValidImagePayload(block) ? [ensureImageChildren(block)] : [];
    }

    return [block];
  });
};

const escapeHtml = (value: string): string => {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
};

const renderInlineText = (child: StrapiBlockTextChild): string => {
  let text = escapeHtml(child.text || '');

  if (child.code) text = `<code>${text}</code>`;
  if (child.strikethrough) text = `<s>${text}</s>`;
  if (child.underline) text = `<u>${text}</u>`;
  if (child.bold) text = `<strong>${text}</strong>`;
  if (child.italic) text = `<em>${text}</em>`;

  return text;
};

const renderInlineChild = (child: StrapiBlockTextChild | StrapiBlockLinkChild): string => {
  if (child.type === 'link') {
    const label = (child.children || []).map(renderInlineText).join('');
    const href = escapeHtml(child.url || '');
    return `<a href="${href}" target="_blank" rel="noopener noreferrer">${label}</a>`;
  }

  return renderInlineText(child);
};

const renderBlockChildren = (children?: Array<StrapiBlockTextChild | StrapiBlockLinkChild>): string => {
  return (children || []).map(renderInlineChild).join('');
};

const renderListItem = (item: any): string => {
  // Strapi v5: list-item children are inline nodes directly
  // Strapi v4/legacy: list-item children are paragraphs wrapping inline nodes
  const children = Array.isArray(item?.children) ? item.children : [];
  const firstChild = children[0];

  if (firstChild?.type === 'paragraph') {
    // Legacy format: children are paragraphs
    const content = children
      .map((paragraph: any) => renderBlockChildren(paragraph?.children || []))
      .filter(Boolean)
      .join('');
    return `<li>${content}</li>`;
  }

  // v5 format: children are inline nodes directly
  return `<li>${renderBlockChildren(children)}</li>`;
};

const getNormalizedBlockType = (block: StrapiBlock): string => {
  if (block.type === 'bullet-list') return 'list-unordered';
  if (block.type === 'ordered-list') return 'list-ordered';
  if (block.type === 'blockquote') return 'quote';
  if (block.type === 'codeBlock') return 'code';
  if (block.type === 'list') {
    return block.format === 'ordered' ? 'list-ordered' : 'list-unordered';
  }

  return block.type;
};

export const blocksToHtml = (blocks: StrapiBlock[]): string => {
  if (!blocks || !Array.isArray(blocks)) return '';

  try {
    return blocks.map(block => {
      const normalizedType = getNormalizedBlockType(block);

      if (normalizedType === 'paragraph') {
        return `<p>${renderBlockChildren(block.children)}</p>`;
      }

      if (normalizedType === 'heading') {
        const level = block.level || 1;
        return `<h${level}>${renderBlockChildren(block.children)}</h${level}>`;
      }

      if (normalizedType === 'code') {
        const code = (block.children || [])
          .map((child) => ('text' in child ? child.text || '' : ''))
          .join('\n');
        return `<pre><code>${escapeHtml(code)}</code></pre>`;
      }

      if (normalizedType === 'quote') {
        return `<blockquote>${renderBlockChildren(block.children)}</blockquote>`;
      }

      if (normalizedType === 'list-unordered') {
        return `<ul>${(block.children as any[] || []).map(renderListItem).join('')}</ul>`;
      }

      if (normalizedType === 'list-ordered') {
        return `<ol>${(block.children as any[] || []).map(renderListItem).join('')}</ol>`;
      }

      if (normalizedType === 'image') {
        const src = block.image?.url || block.url || '';
        const alt = block.image?.alternativeText || block.alt || '';
        const imageData = block.image ? encodeAttribute(JSON.stringify(block.image)) : '';
        const dataAttr = imageData ? ` data-strapi-image="${imageData}"` : '';
        return `<img src="${escapeHtml(src)}" alt="${escapeHtml(String(alt))}"${dataAttr} />`;
      }

      return '';
    }).join('');
  } catch (error) {
    console.error('Error converting blocks to HTML:', error);
    return '';
  }
};


export const JSONDocToBlocks = (doc: any): StrapiBlock[] => {
  if (!doc || !doc.content) return [];

  const mapInlineNodes = (nodes: any[]): any[] => {
    if (!Array.isArray(nodes) || nodes.length === 0) return [];

    return nodes.map((child: any) => {
      if (child.type === 'text') {
        const marks = child.marks || [];
        // In Tiptap, links are marks on text nodes. Convert to Strapi link wrapper.
        const linkMark = marks.find((m: any) => m.type === 'link');
        const textNode: any = { type: 'text', text: child.text || '' };
        marks.forEach((mark: any) => {
          if (mark.type === 'bold') textNode.bold = true;
          if (mark.type === 'italic') textNode.italic = true;
          if (mark.type === 'code') textNode.code = true;
          if (mark.type === 'underline') textNode.underline = true;
          if (mark.type === 'strikethrough') textNode.strikethrough = true;
        });
        if (linkMark) {
          return {
            type: 'link',
            url: linkMark.attrs?.href || '',
            children: [textNode],
          };
        }
        return textNode;
      }
      // Tiptap also emits link as a node type (e.g., from paste); handle both.
      if (child.type === 'link') {
        const children = mapInlineNodes(child.content || []);
        return {
          type: 'link',
          url: child.attrs?.href || '',
          children,
        };
      }
      return null;
    }).filter(Boolean);
  };

  const mapParagraphContent = (node: any): any[] => {
    return mapInlineNodes(node.content || []);
  };

  return sanitizeStrapiBlocks(doc.content.map((node: any) => {
    switch (node.type) {
      case 'paragraph':
        return { type: 'paragraph', children: mapParagraphContent(node) };

      case 'heading':
        return {
          type: 'heading',
          level: node.attrs?.level || 1,
          children: mapInlineNodes(node.content || []),
        };

      case 'bulletList':
        return {
          type: 'list',
          format: 'unordered',
          children: (node.content || []).map((listItem: any) => ({
            type: 'list-item',
            children: mapInlineNodes(listItem.content?.[0]?.content || []),
          })),
        };

      case 'orderedList':
        return {
          type: 'list',
          format: 'ordered',
          children: (node.content || []).map((listItem: any) => ({
            type: 'list-item',
            children: mapInlineNodes(listItem.content?.[0]?.content || []),
          })),
        };

      case 'blockquote':
        return {
          type: 'quote',
          children: mapInlineNodes(node.content?.[0]?.content || []),
        };

      case 'code':
      case 'codeBlock':
        return {
          type: 'code',
          children: [{ type: 'text', text: node.content?.[0]?.text || '' }],
        };

      case 'image':
        const imagePayload = decodeStrapiImage(node.attrs?.strapiImage);
        const src = typeof node.attrs?.src === 'string' ? node.attrs.src.trim() : '';
        const alt = typeof node.attrs?.alt === 'string' ? node.attrs.alt.trim() : '';

        if (imagePayload?.url) {
          return {
            type: 'image',
            url: imagePayload.url,
            image: imagePayload,
            alt: alt || imagePayload.alternativeText || undefined,
            children: [{ type: 'text', text: '' }],
          };
        }

        if (!src) {
          return null;
        }

        // Keep user intent without creating invalid Strapi image blocks.
        return {
          type: 'paragraph',
          children: [{
            type: 'link',
            url: src,
            children: [{ type: 'text', text: alt || src }],
          }],
        };

      default:
        return null;
    }
  }).filter(Boolean));
};
