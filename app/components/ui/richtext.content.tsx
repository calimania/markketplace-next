import Markdown from '@/app/components/ui/page.markdown';
import type { RichTextValue, StoredRichText } from '@/markket/richtext';
import { isHtmlString, richTextToHtml } from '@/markket/richtext.utils';
import { injectVideoEmbeds } from '@/markket/richtext.smart';

type RichTextContentProps = {
  content: RichTextValue | StoredRichText;
  className?: string;
};

export default function RichTextContent({ content, className }: RichTextContentProps) {
  const normalized = richTextToHtml(content);
  const enhanced = injectVideoEmbeds(normalized);

  if (!enhanced.trim()) return null;

  if (isHtmlString(enhanced)) {
    return (
      <div
        className={className || 'prose dark:prose-dark max-w-none blocks-content'}
        dangerouslySetInnerHTML={{ __html: enhanced }}
      />
    );
  }

  return <Markdown content={enhanced} />;
}
