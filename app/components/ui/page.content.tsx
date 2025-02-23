import { Paper }  from '@mantine/core';
import {
  BlocksRenderer,
  type BlocksContent,
} from "@strapi/blocks-react-renderer";
import  { Page } from "@/markket/page.d";

interface PageContentProps {
  params: {
    page?: Page;
  };
}

export default function PageContent({ params }: PageContentProps) {

  const content = params?.page?.Content;

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
