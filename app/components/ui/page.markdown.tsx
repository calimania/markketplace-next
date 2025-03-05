import { Remarkable } from "remarkable";

/**
 * Render markdown content for events, product description and other main content with blocks
 * that match our style
 * @param props { content: string }
 * @returns
 */
const Markdown = ({ content }: { content: string }) => {
  const md = new Remarkable();

  return (
    <div
      className="prose dark:prose-dark max-w-none blocks-content"
      dangerouslySetInnerHTML={{ __html: md.render(content) }}
    />
  );
};

export default Markdown;
