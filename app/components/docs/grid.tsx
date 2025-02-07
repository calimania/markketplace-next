import { SimpleGrid } from '@mantine/core';
import { BlogPostCard } from './card';

interface DocsGridProps {
  posts: any[];
}

export function DocsGrid({ posts }: DocsGridProps) {
  return (
    <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg">
      {posts.map((post, index) => (
        <BlogPostCard key={index} post={post} />
      ))}
    </SimpleGrid>
  );
};

export default DocsGrid;
