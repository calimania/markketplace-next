import { Paper }  from '@mantine/core';
import {
  BlocksRenderer,
  type BlocksContent,
} from "@strapi/blocks-react-renderer";
import  { Page } from "@/markket/page.d";
import { Article } from '@/markket/article';

interface PageContentProps {
  params: {
    page?: Page;
    post?: Article;
  };
}

export default function PageContent({ params }: PageContentProps) {

  const content = params?.page?.Content || params?.post?.Content;

  if (!content?.length) {
    return null;
  }

  return (
    <Paper p="md" mt={33}>
      <div className="blocks-content">
        <BlocksRenderer content={(content || []) as BlocksContent} />
      </div>
    </Paper>
  )
};
