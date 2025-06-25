import { SimpleGrid } from '@mantine/core';
import { BlogPostCard } from './card';
import { Article } from '@/markket/article.d';

interface DocsGridProps {
  posts: Article[];
}

export function DocsGrid({ posts }: DocsGridProps) {
  return (
    <SimpleGrid cols={{ base: 1, md: 2, xl: 3 }} spacing="lg">
      {posts.map((post, index) => (
        <BlogPostCard key={index} post={post} />
      ))}
    </SimpleGrid>
  );
};

export default DocsGrid;
