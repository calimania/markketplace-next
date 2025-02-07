import { SimpleGrid } from '@mantine/core';
import { BlogPostCard } from './card';

interface BlogGridProps {
  posts: any[];
}

export function BlogGrid({ posts }: BlogGridProps) {
  return (
    <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg">
      {posts.map((post) => (
        <BlogPostCard key={post.id} post={post} />
      ))}
    </SimpleGrid>
  );
};

export default BlogGrid;
