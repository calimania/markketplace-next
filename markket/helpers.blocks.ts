import type { StrapiBlock, StrapiBlockLinkChild, StrapiBlockTextChild } from '@/markket/richtext';

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
  if (child.bold) text = `<strong>${text}</strong>`;
  if (child.italic) text = `<em>${text}</em>`;

  return text;
};

const renderInlineChild = (child: StrapiBlockTextChild | StrapiBlockLinkChild): string => {
  if (child.type === 'link') {
    const label = (child.children || []).map(renderInlineText).join('');
    const href = escapeHtml(child.url || '');
    return `<a href="${href}">${label}</a>`;
  }

  return renderInlineText(child);
};

const renderBlockChildren = (children?: Array<StrapiBlockTextChild | StrapiBlockLinkChild>): string => {
  return (children || []).map(renderInlineChild).join('');
};

const renderListItem = (item: any): string => {
  const paragraphs = Array.isArray(item?.children) ? item.children : [];
  const content = paragraphs
    .map((paragraph: any) => renderBlockChildren(paragraph?.children || []))
    .filter(Boolean)
    .join('');

  return `<li>${content}</li>`;
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
        return `<img src="${escapeHtml(src)}" alt="${escapeHtml(String(alt))}" />`;
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

  return doc.content.map((node: any) => {
    switch (node.type) {
      case 'paragraph':
        return {
          type: 'paragraph',
          children: node.content
            ? node.content.map((child: any) => {
              if (child.type === 'text') {
                const marks = child.marks || [];
                const textNode: any = {
                  type: 'text',  // Add explicit type: 'text'
                  text: child.text || ''
                };

                // Apply formatting marks
                marks.forEach((mark: any) => {
                  if (mark.type === 'bold') textNode.bold = true;
                  if (mark.type === 'italic') textNode.italic = true;
                  if (mark.type === 'code') textNode.code = true;
                });

                return textNode;
              }

              if (child.type === 'link') {
                return {
                  type: 'link',
                  url: child.attrs?.href || '',
                  children: child.content?.map((c: any) => ({
                    type: 'text',  // Add explicit type: 'text'
                    text: c.text || ''
                  })) || [{ type: 'text', text: '' }]
                };
              }

              return { type: 'text', text: '' };  // Add explicit type: 'text'
            })
            : [{ type: 'text', text: '' }]  // Add explicit type: 'text'
        };

      case 'heading':
        return {
          type: 'heading',
          level: node.attrs?.level || 1,
          children: node.content
            ? node.content.map((child: any) => {
              if (child.type === 'text') {
                return { type: 'text', text: child.text || '' };  // Add explicit type: 'text'
              }

              if (child.type === 'link') {
                return {
                  type: 'link',
                  url: child.attrs?.href || '',
                  children: child.content?.map((c: any) => ({
                    type: 'text',  // Add explicit type: 'text'
                    text: c.text || ''
                  })) || [{ type: 'text', text: '' }]
                };
              }

              return { type: 'text', text: '' };  // Add explicit type: 'text'
            })
            : [{ type: 'text', text: '' }]  // Add explicit type: 'text'
        };

      case 'bulletList':
        return {
          type: 'bullet-list',
          children: node.content
            ? node.content.map((listItem: any) => ({
              type: 'list-item',
              children: listItem.content?.map((p: any) => ({
                type: 'paragraph',
                children: p.content?.map((c: any) => ({
                  type: 'text',  // Add explicit type: 'text'
                  text: c.text || ''
                })) || [{ type: 'text', text: '' }]
              })) || [{ type: 'text', text: '' }]
            }))
            : []
        };

      case 'orderedList':
        return {
          type: 'ordered-list',
          children: node.content
            ? node.content.map((listItem: any) => ({
              type: 'list-item',
              children: listItem.content?.map((p: any) => ({
                type: 'paragraph',
                children: p.content?.map((c: any) => ({
                  type: 'text',  // Add explicit type: 'text'
                  text: c.text || ''
                })) || [{ type: 'text', text: '' }]
              })) || [{ type: 'text', text: '' }]
            }))
            : []
        };

      case 'blockquote':
        return {
          type: 'blockquote',
          children: node.content
            ? node.content.flatMap((p: any) =>
              p.content?.map((c: any) => ({
                type: 'text',  // Add explicit type: 'text'
                text: c.text || ''
              })) || [{ type: 'text', text: '' }]
            )
            : [{ type: 'text', text: '' }]  // Add explicit type: 'text'
        };

      case 'code':
      case 'codeBlock':
        return {
          type: 'code',
          language: node.attrs?.language || 'plaintext',
          children: [{ type: 'text', text: node.content?.[0]?.text || '' }]  // Add explicit type: 'text'
        };

      case 'image':
        return {
          type: 'image',
          url: node.attrs?.src || '',
          alt: node.attrs?.alt || '',
          children: [{ type: 'text', text: '' }]  // Add explicit type: 'text'
        };

      default:
        // Handle any other node types as paragraphs
        return {
          type: 'paragraph',
          children: [{ type: 'text', text: '' }]  // Add explicit type: 'text'
        };
    }
  });
  // .filter((block: any) => {
  //   // Filter out empty paragraphs (no text content)
  //   if (block.type === 'paragraph') {
  //     return block.children.some((child: any) => child.text?.trim().length > 0 || child.type === 'link');
  //   }
  //   return true;
  // });
};
