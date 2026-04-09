// @Maybe use the office Strapi block render // @strapi/blocks-react-renderer
import { Title, Code } from '@mantine/core';
import { Page, ContentBlock } from "@/markket/page.d";
import { Album, AlbumTrack } from '@/markket/album';
import { Article } from '@/markket/article';
import { CodeHighlight } from '@mantine/code-highlight';
import type { StrapiBlockLinkChild, StrapiBlockTextChild } from '@/markket/richtext';

interface PageContentProps {
  params: {
    page?: Page;
    post?: Article;
    album?: Album;
    track?: AlbumTrack;
  };
};

/**
 * Component designed to render Content Blocks from Strapi
 * Stores, Pages & Articles store their .content attribute in this format
 * @param props - PageContentProps
 * @returns { JSX.Element }
 */
export default function PageContent({ params, }: PageContentProps) {
  const content = params?.page?.Content || params?.post?.Content || params?.album?.content || params?.track?.content;
  const renderedImages = new Set<string>();

  if (!content?.length) {
    return null;
  }

  const isLinkChild = (node: StrapiBlockTextChild | StrapiBlockLinkChild): node is StrapiBlockLinkChild => {
    return node.type === 'link';
  };

  const isTextChild = (node: StrapiBlockTextChild | StrapiBlockLinkChild): node is StrapiBlockTextChild => {
    return node.type === 'text';
  };

  const getBlockType = (block: ContentBlock) => {
    if (block.type === 'bullet-list') return 'list-unordered';
    if (block.type === 'ordered-list') return 'list-ordered';
    if (block.type === 'blockquote') return 'quote';
    if (block.type === 'codeBlock') return 'code';
    if (block.type === 'list') return block.format === 'ordered' ? 'list-ordered' : 'list-unordered';
    return block.type;
  };

  const getLinkLabel = (node: StrapiBlockLinkChild) => {
    return node.children?.map((child) => child.text).join('') || '';
  };

  const renderImage = (node: StrapiBlockLinkChild, key: number) => {
    if (!node.url || renderedImages.has(node.url)) {
      return null;
    }

    const label = getLinkLabel(node);

    if (!label) {
      return null;
    }

    renderedImages.add(node.url);

    return (
      <figure key={key} className="image-container">
        <a
          href={node.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block"
          title={label}
        >
          <div className="rounded-xl">
            <img
              src={node.url}
              alt={label}
              className="max-w-sm"
              loading="lazy"
            />
          </div>
          {label && (
            <figcaption>
              {label}
            </figcaption>
          )}
        </a>
      </figure>
    );
  };

  const renderInline = (node: StrapiBlockTextChild | StrapiBlockLinkChild, key: number) => {
    if (isTextChild(node) && node.code) {
      return (
        <code key={key} className="inline-code">
          {node.text}
        </code>
      );
    }

    if (isLinkChild(node)) {
      const isImage = node.url?.match(/\.(jpg|jpeg|png|gif|webp)$/i);

      if (isImage && renderedImages.has(node.url as string)) {
        return null;
      }

      return (
        <a
          key={key}
          href={node.url}
          target={node.url?.startsWith('http') ? '_blank' : '_self'}
          rel="noopener noreferrer"
          className="text-markket-blue hover:text-markket-pink transition-colors"
        >
          {getLinkLabel(node)}
        </a>
      );
    }

    if (node.bold) {
      return <strong key={key}>{node.text}</strong>
    }

    if (node.italic) {
      return <em key={key}>{node.text}</em>;
    }

    return <span key={key}>{node.text}</span>;
  };

  /**
   * For the content blocks that are lists, we need to render them recursively
   * @param node
   * @param key
   * @returns
   */
  const renderListItem = (node: any, key: number) => {
    if (node.type !== 'list-item') return null;

    const paragraphs = Array.isArray(node.children) ? node.children : [];

    return (
      <li key={key} className="list-item">
        {paragraphs.map((paragraph: any, paragraphIndex: number) => {
          const inlineChildren = Array.isArray(paragraph?.children) ? paragraph.children : [];
          return (
            <span key={paragraphIndex}>
              {inlineChildren.map((child: StrapiBlockTextChild | StrapiBlockLinkChild, i: number) => renderInline(child, i))}
            </span>
          );
        })}
      </li>
    );
  };

  const renderImageBlock = (imageData: any, key: number) => {
    if (!imageData?.url) return null;

    const caption = imageData.caption || imageData.alternativeText;

    return (
      <figure key={key} className="my-8">
        <img
          src={imageData.url}
          alt={imageData.alternativeText || ''}
          className="rounded-lg w-full max-w-3xl mx-auto"
          width={imageData.width}
          height={imageData.height}
          loading="lazy"
        />
        {caption && (
          <figcaption className="text-center text-sm text-gray-500 mt-2">
            {caption}
          </figcaption>
        )}
      </figure>
    );
  };

  const renderBlock = (block: ContentBlock) => {
    const blockType = getBlockType(block);
    const children = block.children || [];

    if (blockType === 'paragraph') {
      const imageNodes = children.filter(
        (child): child is StrapiBlockLinkChild => isLinkChild(child) &&
          !!child.url?.match(/\.(jpg|jpeg|png|gif|webp)$/i) &&
          !renderedImages.has(child.url)
      );

      const textNodes = children.filter(
        (child) => !(isLinkChild(child) && child.url?.match(/\.(jpg|jpeg|png|gif|webp)$/i))
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

    switch (blockType) {
      case 'heading':
        return (
          <Title order={(block.level || 1) as 1 | 2 | 3 | 4 | 5 | 6} className="heading">
            {children.map((child, i) => renderInline(child, i))}
          </Title>
        );

      case 'code':
        return (
          <div className="code-block-wrapper">
            <CodeHighlight
              code={children
                .map((child) => isTextChild(child) ? child.text : '')
                .filter(Boolean)
                .join('\n')}
              language={typeof block.language === 'string' ? block.language : 'tsx'}
              copyLabel="Copy code"
              withCopyButton
            />
          </div>
        );

      case 'list-unordered':
        return (
          <ul className="list-container">
            {(children as any[])
              .filter((child) => child.type === 'list-item')
              .map((child, i) => renderListItem(child, i))}
          </ul>
        );

      case 'list-ordered':
        return (
          <ol className="list-container">
            {(children as any[])
              .filter((child) => child.type === 'list-item')
              .map((child, i) => renderListItem(child, i))}
          </ol>
        );

      case 'quote':
        return (
          <blockquote className="border-l-4 border-markket-blue pl-4 my-4 italic text-gray-700">
            {children.map((child, i) => renderInline(child, i))}
          </blockquote>
        );

      case 'image':
        return renderImageBlock(block.image, 0);

      default:
        return null;
    }
  };

  return (
    <div className='blocks-content'>
      {content.map((block: ContentBlock, index: number) => (
        <div key={index}>{renderBlock(block)}</div>
      ))}
    </div>
  );
}
