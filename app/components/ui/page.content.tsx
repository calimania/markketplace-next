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
  return (
    <Paper p="md" withBorder>
      <div className="blocks-content">
        <BlocksRenderer content={params.page?.Content as BlocksContent} />
      </div>
    </Paper>
  )
};
