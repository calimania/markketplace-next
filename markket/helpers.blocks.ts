export const blocksToHtml = (blocks: any[]): string => {
  if (!blocks || !Array.isArray(blocks)) return '';

  try {
    return blocks.map(block => {
      if (block.type === 'paragraph') {
        return `<p>${block.children.map(child =>
          child.text || (child.type === 'link' ?
            `<a href="${child.url}">${child.children?.[0]?.text || ''}</a>` : '')
        ).join('')}</p>`;
      }

      if (block.type === 'heading') {
        const level = block.level || 1;
        return `<h${level}>${block.children.map(child =>
          child.url ?
            `<a href="${child.url}">${child.children?.[0]?.text || child.text || ''}</a>` :
            child.text
        ).join('')}</h${level}>`;
      }

      if (block.type === 'code') {
        return `<pre><code>${block.children.map(child => child.text).join('\n')}</code></pre>`;
      }

      if (block.type === 'blockquote') {
        return `<blockquote>${block.children.map(child => child.text).join('\n')}</blockquote>`;
      }

      if (block.type === 'bullet-list') {
        return `<ul>${block.children.map(item =>
          `<li>${item.children.map(c => c.text).join('')}</li>`
        ).join('')}</ul>`;
      }

      if (block.type === 'ordered-list') {
        return `<ol>${block.children.map(item =>
          `<li>${item.children.map(c => c.text).join('')}</li>`
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
