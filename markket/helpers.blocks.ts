export const blocksToHtml = (blocks: any[]): string => {
  if (!blocks || !Array.isArray(blocks)) return '';

  try {
    return blocks.map(block => {
      if (block.type === 'paragraph') {
        return `<p>${block.children.map((child: any) =>
          child.text || (child.type === 'link' ?
            `<a href="${child.url}">${child.children?.[0]?.text || ''}</a>` : '')
        ).join('')}</p>`;
      }

      if (block.type === 'heading') {
        const level = block.level || 1;
        return `<h${level}>${block.children.map((child: any) =>
          child.url ?
            `<a href="${child.url}">${child.children?.[0]?.text || child.text || ''}</a>` :
            child.text
        ).join('')}</h${level}>`;
      }

      if (block.type === 'code') {
        return `<pre><code>${block.children.map((child: any) => child.text).join('\n')}</code></pre>`;
      }

      if (block.type === 'blockquote') {
        return `<blockquote>${block.children.map((child: any) => child.text).join('\n')}</blockquote>`;
      }

      if (block.type === 'bullet-list') {
        return `<ul>${block.children.map((item: any) =>
          `<li>${item.children.map((c: any) => c.text).join('')}</li>`
        ).join('')}</ul>`;
      }

      if (block.type === 'ordered-list') {
        return `<ol>${block.children.map((item: any) =>
          `<li>${item.children.map((c: any) => c.text).join('')}</li>`
        ).join('')}</ol>`;
      }

      if (block.type === 'image') {
        const src = block.image?.url || block.url || '';
        const alt = block.image?.alternativeText || block.alt || '';
        return `<img src="${src}" alt="${alt}" />`;
      }

      return '';
    }).join('');
  } catch (error) {
    console.error('Error converting blocks to HTML:', error);
    return '';
  }
};


export const JSONDocToBlocks = (doc: any): any[] => {
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
