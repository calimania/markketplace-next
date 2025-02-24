import { Paper, Title } from '@mantine/core';
import { Page, ContentBlock } from "@/markket/page.d";
import { Article } from '@/markket/article';

interface PageContentProps {
  params: {
    page?: Page;
    post?: Article;
  };
};


export default function PageContent({ params }: PageContentProps) {
  const content = params?.page?.Content || params?.post?.Content;
  const renderedImages = new Set<string>();

  if (!content?.length) {
    return null;
  }

  const renderImage = (node: ContentBlock['children'][0], key: number) => {
    if (!node.url || renderedImages.has(node.url)) {
      return null;
    }

    if (!node.children?.[0]?.text) {
      return null;
    }

    return (
      <figure key={key} className="image-container">
        <a
          href={node.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block"
          title={node.children?.[0]?.text || ''}
        >
          <div className="rounded-xl">
            <img
              src={node.url}
              alt={node.children?.[0]?.text || ''}
              className="max-w-sm"
              loading="lazy"
            />
          </div>
          {node.children?.[0]?.text && (
            <figcaption>
              {node.children[0].text}
            </figcaption>
          )}
        </a>
      </figure>
    );
  };

  const renderInline = (node: ContentBlock['children'][0], key: number) => {
    if (node.type === 'link') {
      const isImage = node.url?.match(/\.(jpg|jpeg|png|gif|webp)$/i);

      if (isImage && renderedImages.has(node.url as string)) {
        renderedImages.add(node.url as string);
        return null;
      }

      return (
        <a
          key={key}
          href={node.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-markket-blue hover:text-markket-pink transition-colors"
        >
          {node.children?.[0]?.text}
        </a>
      );
    }

    return <span key={key}>{node.text}</span>;
  };

  /**
   * For the content blocks that are lists, we need to render them recursively
   * @param node
   * @param key
   * @returns
   */
  const renderListItem = (node: ContentBlock['children'][0], key: number) => {
    if (node.type !== 'list-item') return null;

    return (
      <li key={key} className="list-item">
        {node.children?.map((child, i) => renderInline(child, i))}
      </li>
    );
  };

  const renderBlock = (block: ContentBlock) => {
    if (block.type === 'paragraph') {
      const imageNodes = block.children.filter(
        child => child.type === 'link' &&
          child.url?.match(/\.(jpg|jpeg|png|gif|webp)$/i) &&
          !renderedImages.has(child.url)
      );

      const textNodes = block.children.filter(
        child => !(child.type === 'link' &&
          child.url?.match(/\.(jpg|jpeg|png|gif|webp)$/i))
      );

      return (
        <>
          {textNodes.length > 0 && (
            <p>
              {textNodes.map((child, i) => renderInline(child, i))}
            </p>
          )}
          {imageNodes.length > 1 ? (
            <div className="image-gallery">
              {imageNodes.map((node, i) => renderImage(node, i))}
            </div>
          ) : (
            imageNodes.map((node, i) => renderImage(node, i))
          )}
        </>
      );
    }

    switch (block.type) {
      case 'heading':
        return (
          <Title size={block.level || 1} className="heading">
            {block.children.map((child, i) => renderInline(child, i))}
          </Title>
        );

      case 'list':
        return (
          <ul className="list-container">
            {block.children
              .filter(child => child.type === 'list-item')
              .map((child, i) => renderListItem(child, i))}
          </ul>
        );

      default:
        return null;
    }
  };

  return (
    <Paper p="md" mt={33} className='blocks-content'>
      <div className="space-y-6">
        {content.map((block: ContentBlock, index: number) => (
          <div key={index}>{renderBlock(block)}</div>
        ))}
      </div>
    </Paper>
  );
}
